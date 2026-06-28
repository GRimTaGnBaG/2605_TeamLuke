/**
 * PARENTVAULT-COMMENTARY
 *
 * Grounded retrieval/answer helper for vault Q&A.
 *
 * It ranks stored knowledge sources and builds conservative answers rather than inventing facts.
 *
 * If confidence/source coverage is weak, the assistant should say what is missing instead of guessing.
 *
 * Reading guide:
 * - Comments in this project explain product intent, privacy/security boundaries, and why a flow exists.
 * - They are deliberately more detailed than normal production comments because this prototype is being shared for learning, review, and handoff.
 * - If code and comments ever disagree, fix both together; stale privacy/security comments are dangerous.
 */

import type { ChildProfile, ID, JournalEntry, KnowledgeSource, RagAnswer, ScheduleItem } from './index';

export interface ImportedDocument {
  // Local/document id used as citation identity.
  id: ID;
  // Optional child link lets retrieval narrow answers to one child.
  childId?: ID;
  // Human-readable document title shown in source lists.
  title: string;
  // Extracted or pasted document text used for retrieval.
  text: string;
  // Source type helps explain provenance of imported text.
  sourceType?: string;
  uri?: string;
  sensitive?: boolean;
  updatedAt: string;
}

export interface RagKnowledgeInput {
  // Current in-memory child records.
  children: ChildProfile[];
  // Current schedule items to make calendar facts searchable.
  schedule: ScheduleItem[];
  // Current journal entries to make parent notes searchable.
  journal: JournalEntry[];
  // Optional imported documents for future OCR/file ingestion.
  documents?: ImportedDocument[];
  // Optional clock override for tests/future deterministic answer behavior.
  now?: string;
}

export interface RetrievalOptions {
  // If supplied, prefer sources linked to this child plus global sources.
  childId?: ID;
  // Maximum number of citations/snippets to return.
  maxSources?: number;
  // Minimum score required for a source to count as relevant.
  minScore?: number;
}

export interface ScoredSource {
  source: KnowledgeSource;
  score: number;
}

const DEFAULT_MAX_SOURCES = 5;
const DEFAULT_MIN_SCORE = 1.1;
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'do', 'does', 'for', 'from', 'has', 'have', 'how',
  'i', 'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'our', 'please', 'show', 'tell', 'the', 'to', 'was',
  'what', 'when', 'where', 'which', 'who', 'why', 'with'
]);

// Joins optional lines into one source body while dropping missing fields.
const compact = (parts: Array<string | undefined | null | false>): string => parts.filter(Boolean).join('\n');
// Formats array fields only when they actually contain values.
const asList = (label: string, values?: string[]): string | undefined => values?.length ? `${label}: ${values.join(', ')}` : undefined;
// Formats nested address data into a single readable source line.
const formatAddress = (address?: { line1: string; line2?: string; city: string; state: string; postalCode: string; country?: string }): string | undefined => {
  if (!address) return undefined;
  return [address.line1, address.line2, `${address.city}, ${address.state} ${address.postalCode}`, address.country].filter(Boolean).join(', ');
};
// Last-line safety net: redact obvious SSN-like values before source text is returned to the UI.
const redact = (text: string): string => text
  .replace(/\b\d{3}-?\d{2}-?\d{4}\b/g, '[redacted ssn]')
  .replace(/\b(?:ssn|social security number)\s*[:#]?\s*\S+/gi, 'SSN: [redacted]');

// Creates a KnowledgeSource and trims long bodies so answer previews stay manageable.
const source = (input: Omit<KnowledgeSource, 'text'> & { text: string }): KnowledgeSource => ({
  ...input,
  text: redact(input.text).slice(0, 2400)
});

export function buildKnowledgeSources(input: RagKnowledgeInput): KnowledgeSource[] {
  const sources: KnowledgeSource[] = [];

  // Child profile data is expanded into multiple source records so a doctor query can cite
  // the provider directly instead of burying the answer in a giant profile blob.
  for (const child of input.children) {
    sources.push(source({
      id: `profile:${child.id}`,
      childId: child.id,
      kind: 'profile',
      title: `Profile: ${child.displayName}`,
      sensitive: true,
      updatedAt: child.updatedAt,
      text: compact([
        `Child profile for ${child.displayName}`,
        child.legalName ? `Legal name: ${child.legalName}` : undefined,
        child.preferredName ? `Preferred name: ${child.preferredName}` : undefined,
        child.birthdate ? `Birthdate: ${child.birthdate}` : undefined,
        child.ssnLast4 ? `SSN last 4: ${child.ssnLast4}` : undefined,
        asList('Allergies', child.medical.allergies),
        asList('Conditions', child.medical.conditions),
        asList('Dietary restrictions', child.medical.dietaryRestrictions),
        asList('Sensory needs', child.medical.sensoryNeeds),
        child.medical.careInstructions ? `Care instructions: ${child.medical.careInstructions}` : undefined,
        child.notes ? `Profile notes: ${child.notes}` : undefined
      ])
    }));

    // Medications become independent sources because parents often ask dose/refill questions directly.
    for (const medication of child.medical.medications) {
      sources.push(source({
        id: `medication:${child.id}:${medication.id}`,
        childId: child.id,
        kind: 'medication',
        title: `Medication: ${medication.name}`,
        sensitive: true,
        updatedAt: child.updatedAt,
        text: compact([
          `Medication for ${child.displayName}: ${medication.name}`,
          medication.dosage ? `Dosage: ${medication.dosage}` : undefined,
          medication.route ? `Route: ${medication.route}` : undefined,
          medication.instructions ? `Instructions: ${medication.instructions}` : undefined,
          medication.scheduleText ? `Schedule: ${medication.scheduleText}` : undefined,
          medication.pharmacyProviderId ? `Pharmacy provider ID: ${medication.pharmacyProviderId}` : undefined,
          medication.prescribingProviderId ? `Prescribing provider ID: ${medication.prescribingProviderId}` : undefined,
          medication.refillInstructions ? `Refill instructions: ${medication.refillInstructions}` : undefined,
          medication.refillRemainingCount !== undefined ? `Refills remaining: ${medication.refillRemainingCount}` : undefined,
          medication.lastFilledAt ? `Last filled: ${medication.lastFilledAt}` : undefined,
          medication.nextRefillDueAt ? `Next refill due: ${medication.nextRefillDueAt}` : undefined,
          `Active: ${medication.active ? 'yes' : 'no'}`,
          medication.startDate ? `Start date: ${medication.startDate}` : undefined,
          medication.endDate ? `End date: ${medication.endDate}` : undefined,
          medication.sideEffectsToWatch?.length ? `Side effects to watch: ${medication.sideEffectsToWatch.join(', ')}` : undefined
        ])
      }));
    }

    // Providers are searchable by person, organization, role, phone, portal, and office metadata.
    for (const provider of child.careProviders) {
      sources.push(source({
        id: `provider:${child.id}:${provider.id}`,
        childId: child.id,
        kind: 'provider',
        title: `Provider: ${provider.personName}`,
        sensitive: true,
        updatedAt: provider.updatedAt,
        text: compact([
          `Care provider for ${child.displayName}: ${provider.personName}`,
          provider.organizationName ? `Organization: ${provider.organizationName}` : undefined,
          `Type: ${provider.type}`,
          provider.role ? `Role: ${provider.role}` : undefined,
          provider.phone ? `Phone: ${provider.phone}` : undefined,
          provider.afterHoursPhone ? `After-hours phone: ${provider.afterHoursPhone}` : undefined,
          provider.email ? `Email: ${provider.email}` : undefined,
          provider.portalUrl ? `Portal: ${provider.portalUrl}` : undefined,
          provider.address ? `Location: ${formatAddress(provider.address)}` : undefined,
          provider.officeHours ? `Office hours: ${provider.officeHours}` : undefined,
          provider.acceptsElectronicPrescriptions !== undefined ? `Accepts electronic prescriptions: ${provider.acceptsElectronicPrescriptions ? 'yes' : 'no'}` : undefined,
          provider.preferredForRefills !== undefined ? `Preferred for refills: ${provider.preferredForRefills ? 'yes' : 'no'}` : undefined,
          provider.notes ? `Notes: ${provider.notes}` : undefined
        ])
      }));
    }

    // Emergency contacts are sensitive but useful for pickup/contact questions.
    for (const contact of child.contacts) {
      sources.push(source({
        id: `contact:${child.id}:${contact.id}`,
        childId: child.id,
        kind: 'profile',
        title: `Emergency contact: ${contact.name}`,
        sensitive: true,
        updatedAt: child.updatedAt,
        text: compact([
          `Emergency contact for ${child.displayName}: ${contact.name}`,
          `Relationship: ${contact.relationship}`,
          contact.phone ? `Phone: ${contact.phone}` : undefined,
          contact.email ? `Email: ${contact.email}` : undefined,
          contact.allowedPickup !== undefined ? `Allowed pickup: ${contact.allowedPickup ? 'yes' : 'no'}` : undefined,
          contact.notes ? `Notes: ${contact.notes}` : undefined
        ])
      }));
    }

    // Insurance source includes non-encrypted display/contact metadata only.
    for (const policy of child.insurance) {
      sources.push(source({
        id: `insurance:${child.id}:${policy.id}`,
        childId: child.id,
        kind: 'insurance',
        title: `Insurance: ${policy.providerName}`,
        sensitive: true,
        updatedAt: child.updatedAt,
        text: compact([
          `Insurance provider for ${child.displayName}: ${policy.providerName}`,
          policy.planName ? `Plan: ${policy.planName}` : undefined,
          policy.policyHolderName ? `Policy holder: ${policy.policyHolderName}` : undefined,
          policy.relationshipToChild ? `Policy holder relationship: ${policy.relationshipToChild}` : undefined,
          policy.phone ? `Insurance phone: ${policy.phone}` : undefined,
          policy.nurseLinePhone ? `Nurse line: ${policy.nurseLinePhone}` : undefined,
          policy.pharmacyBenefitsPhone ? `Pharmacy benefits phone: ${policy.pharmacyBenefitsPhone}` : undefined,
          policy.portalUrl ? `Portal: ${policy.portalUrl}` : undefined,
          policy.copayNotes ? `Copay notes: ${policy.copayNotes}` : undefined,
          policy.priorAuthorizationNotes ? `Prior authorization notes: ${policy.priorAuthorizationNotes}` : undefined,
          policy.notes ? `Notes: ${policy.notes}` : undefined
        ])
      }));
    }

    // School details become one school source with calendar/pickup/attendance information.
    if (child.school) {
      const school = child.school;
      sources.push(source({
        id: `school:${child.id}:${school.id}`,
        childId: child.id,
        kind: 'school',
        title: `School: ${school.schoolName}`,
        sensitive: true,
        updatedAt: child.updatedAt,
        text: compact([
          `School for ${child.displayName}: ${school.schoolName}`,
          school.grade ? `Grade: ${school.grade}` : undefined,
          school.teacherName ? `Teacher: ${school.teacherName}` : undefined,
          school.districtName ? `District: ${school.districtName}` : undefined,
          school.mainPhone ? `Main phone: ${school.mainPhone}` : undefined,
          school.attendancePhone ? `Attendance phone: ${school.attendancePhone}` : undefined,
          school.websiteUrl ? `Website: ${school.websiteUrl}` : undefined,
          school.calendarUrl ? `Calendar: ${school.calendarUrl}` : undefined,
          school.address ? `Location: ${formatAddress(school.address)}` : undefined,
          school.officeHours ? `Office hours: ${school.officeHours}` : undefined,
          school.schoolHours ? `School hours: ${school.schoolHours}` : undefined,
          school.pickupInstructions ? `Pickup instructions: ${school.pickupInstructions}` : undefined,
          school.busInfo ? `Bus info: ${school.busInfo}` : undefined,
          school.calendarDates?.length ? `School calendar dates: ${school.calendarDates.map(date => `${date.title} ${date.startsAt}${date.noSchool ? ' no school' : ''}`).join('; ')}` : undefined,
          school.notes ? `Notes: ${school.notes}` : undefined
        ])
      }));
    }

    // Legal custody summaries are always sensitive and must be cited conservatively.
    if (child.legalCustody) {
      const legal = child.legalCustody;
      sources.push(source({
        id: `legal:${child.id}:${legal.id}`,
        childId: child.id,
        kind: 'legal',
        title: `Legal custody: ${child.displayName}`,
        sensitive: true,
        updatedAt: child.updatedAt,
        text: compact([
          `Legal custody info for ${child.displayName}`,
          legal.court ? `Court: ${legal.court}` : undefined,
          legal.decreeDate ? `Decree date: ${legal.decreeDate}` : undefined,
          legal.custodySummary ? `Custody summary: ${legal.custodySummary}` : undefined,
          legal.exchangeRules ? `Exchange rules: ${legal.exchangeRules}` : undefined,
          legal.holidayRules ? `Holiday rules: ${legal.holidayRules}` : undefined,
          legal.notes ? `Notes: ${legal.notes}` : undefined,
          legal.sourceDocumentIds.length ? `Source document IDs: ${legal.sourceDocumentIds.join(', ')}` : undefined
        ])
      }));
    }
  }

  // Schedule items become searchable facts for "when/where/what is next" questions.
  for (const item of input.schedule) {
    sources.push(source({
      id: `schedule:${item.id}`,
      childId: item.childId,
      kind: 'schedule',
      title: `Schedule: ${item.title}`,
      sensitive: item.type === 'custody' || item.type === 'medication' || Boolean(item.notes),
      updatedAt: item.startsAt,
      text: compact([
        `Schedule item: ${item.title}`,
        `Type: ${item.type}`,
        `Starts: ${item.startsAt}`,
        item.endsAt ? `Ends: ${item.endsAt}` : undefined,
        item.location ? `Location: ${item.location}` : undefined,
        item.notes ? `Notes: ${item.notes}` : undefined,
        item.medicationId ? `Medication ID: ${item.medicationId}` : undefined,
        item.providerId ? `Provider ID: ${item.providerId}` : undefined,
        item.takenAt ? `Taken at: ${item.takenAt}` : undefined,
        item.source ? `Source type: ${item.source}` : undefined,
        item.confidence !== undefined ? `Extraction confidence: ${item.confidence}` : undefined
      ])
    }));
  }

  // Journal entries include audit metadata so export/evidence context is preserved in answers.
  for (const entry of input.journal) {
    sources.push(source({
      id: `journal:${entry.id}`,
      childId: entry.childId,
      kind: 'journal',
      title: `Journal: ${entry.title}`,
      sensitive: true,
      updatedAt: entry.occurredAt,
      text: compact([
        `Journal entry: ${entry.title}`,
        `Type: ${entry.type}`,
        `Occurred: ${entry.occurredAt}`,
        `Occurred precision: ${entry.occurredAtPrecision}`,
        `Entered/created: ${entry.audit.createdAt}`,
        `Entry order: ${entry.audit.entryOrder}`,
        entry.peopleInvolved?.length ? `People involved: ${entry.peopleInvolved.join(', ')}` : undefined,
        entry.location ? `Location: ${entry.location}` : undefined,
        `Notes: ${entry.notes}`,
        entry.tags.length ? `Tags: ${entry.tags.join(', ')}` : undefined,
        entry.attachments.length ? `Attachments: ${entry.attachments.map(a => `${a.kind} imported ${a.importedAt}${a.sha256 ? ` hash ${a.sha256}` : ''}${a.redacted ? ' redacted' : ''}`).join(', ')}` : undefined,
        entry.sourceDocumentIds?.length ? `Source document IDs: ${entry.sourceDocumentIds.join(', ')}` : undefined
      ])
    }));
  }

  // Imported documents are optional because current mobile prototype may not have OCR/text imports yet.
  for (const doc of input.documents ?? []) {
    sources.push(source({
      id: `document:${doc.id}`,
      childId: doc.childId,
      kind: 'document',
      title: `Document: ${doc.title}`,
      sensitive: doc.sensitive ?? true,
      updatedAt: doc.updatedAt,
      uri: doc.uri,
      text: compact([
        `Imported document: ${doc.title}`,
        doc.sourceType ? `Source type: ${doc.sourceType}` : undefined,
        doc.text
      ])
    }));
  }

  return sources;
}

export function tokenize(text: string): string[] {
  // Simple tokenization is enough for this prototype: lowercase, strip punctuation, split, and drop stop words.
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map(token => token.trim())
    .filter(token => token.length > 1 && !STOP_WORDS.has(token));
}

export function retrieveKnowledgeSources(
  query: string,
  sources: KnowledgeSource[],
  options: RetrievalOptions = {}
): ScoredSource[] {
  // Convert the query into comparable tokens. Empty or stop-word-only queries return no matches.
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return [];
  const maxSources = options.maxSources ?? DEFAULT_MAX_SOURCES;
  const querySet = new Set(queryTokens);

  return sources
    // Child filtering still allows childless/global sources through.
    .filter(item => !options.childId || item.childId === options.childId || item.childId === undefined)
    .map(item => {
      const titleTokens = tokenize(item.title);
      const textTokens = tokenize(item.text);
      let score = 0;
      // Title matches are weighted higher than body matches because titles are curated summaries.
      for (const token of querySet) {
        if (titleTokens.includes(token)) score += 2.5;
        score += Math.min(3, textTokens.filter(candidate => candidate === token).length) * 1.0;
        if (item.kind.includes(token)) score += 1.5;
      }
      if (item.childId && queryTokens.includes(item.childId.toLowerCase())) score += 2;
      return { source: item, score };
    })
    .filter(result => result.score >= (options.minScore ?? DEFAULT_MIN_SCORE))
    .sort((a, b) => b.score - a.score || b.source.updatedAt.localeCompare(a.source.updatedAt))
    .slice(0, maxSources);
}

export function answerFromSources(
  query: string,
  sources: KnowledgeSource[],
  options: RetrievalOptions = {}
): RagAnswer {
  // Retrieval is the only source of truth for the answer; no uncited facts are generated here.
  const retrieved = retrieveKnowledgeSources(query, sources, options);

  if (!retrieved.length) {
    return {
      answer: "I don't know from the saved ParentVault data. Add or import a source, then ask again.",
      confidence: 'unknown',
      sources: [],
      warnings: [
        'No matching source was found; do not guess for child medical, custody, schedule, or identity details.'
      ]
    };
  }

  // Build source snippets from the top few lines so the answer remains inspectable.
  const citedSources = retrieved.map(item => item.source);
  const answerLines = retrieved.map((item, index) => {
    const snippet = item.source.text.split('\n').slice(0, 5).join('; ');
    return `[${index + 1}] ${snippet}`;
  });

  return {
    answer: `I found this in saved ParentVault sources:\n${answerLines.join('\n')}`,
    confidence: retrieved[0].score >= 6 ? 'high' : retrieved[0].score >= 3 ? 'medium' : 'low',
    sources: citedSources,
    warnings: [
      'Answer is limited to cited saved sources; verify medical/legal decisions with the appropriate professional or document.',
      ...(citedSources.some(item => item.sensitive) ? ['Sensitive child data: do not log, paste into external tools, or show on lock screens.'] : [])
    ]
  };
}

export function answerFromKnowledge(
  query: string,
  input: RagKnowledgeInput,
  options: RetrievalOptions = {}
): RagAnswer {
  // Convenience wrapper used by the app store: build sources, then answer from those sources.
  return answerFromSources(query, buildKnowledgeSources(input), options);
}
