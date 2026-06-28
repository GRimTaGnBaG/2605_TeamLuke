/**
 * PARENTVAULT-COMMENTARY
 *
 * Builds an export manifest preview for journal records and attachments.
 *
 * The export design should be evidence-grade: timestamps, metadata, attachment counts, hashes, and clear structure.
 *
 * Production export must avoid leaking plaintext through logs, temp files, or analytics.
 *
 * Reading guide:
 * - Comments in this project explain product intent, privacy/security boundaries, and why a flow exists.
 * - They are deliberately more detailed than normal production comments because this prototype is being shared for learning, review, and handoff.
 * - If code and comments ever disagree, fix both together; stale privacy/security comments are dangerous.
 */

import type { JournalEntry, JournalExportManifest, JournalExportRequest } from '@parentvault/shared';

// Demo export id helper. Production exports should use stable ids and persisted manifests.
const id = () => Math.random().toString(36).slice(2, 10);

export function buildJournalExportManifest(entries: JournalEntry[], request: JournalExportRequest): JournalExportManifest {
  // Apply the user's export filters before counting or listing entries.
  const filtered = entries
    .filter(entry => !request.childId || entry.childId === request.childId)
    .filter(entry => !request.dateFrom || entry.occurredAt >= request.dateFrom)
    .filter(entry => !request.dateTo || entry.occurredAt <= request.dateTo)
    .filter(entry => request.includeMedicalEntries || !['medical', 'medication', 'appointment'].includes(entry.type))
    .filter(entry => request.includeCustodyEntries || entry.type !== 'custody')
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.audit.entryOrder - b.audit.entryOrder);

  // Attachment count respects the includeAttachments setting so preview matches export options.
  const attachmentCount = request.includeAttachments
    ? filtered.reduce((sum, entry) => sum + entry.attachments.length, 0)
    : 0;

  return {
    id: id(),
    generatedAt: new Date().toISOString(),
    format: request.format,
    entryCount: filtered.length,
    attachmentCount,
    entries: filtered.map(entry => ({
      id: entry.id,
      title: entry.title,
      occurredAt: entry.occurredAt,
      createdAt: entry.audit.createdAt,
      attachmentIds: request.includeAttachments ? entry.attachments.map(attachment => attachment.id) : []
    })),
    warnings: [
      'Export is an organized record package, not legal advice.',
      'Preserve original device/cloud copies of photos and screenshots when possible.',
      'Production export should include hashes and encrypted originals for integrity.'
    ]
  };
}

export function makeDefaultJournalExportRequest(childId?: string): JournalExportRequest {
  // Default to a complete ZIP-style export with attachments and audit metadata included.
  return {
    id: id(),
    childId,
    format: 'zip',
    includeAttachments: true,
    includeAttachmentMetadata: true,
    includeAuditMetadata: true,
    includeMedicalEntries: true,
    includeCustodyEntries: true,
    createdAt: new Date().toISOString()
  };
}

export function buildJournalExportText(entries: JournalEntry[], request: JournalExportRequest) {
  // Text export preview is built from the same manifest logic so counts and included ids match.
  const manifest = buildJournalExportManifest(entries, request);
  const includedEntryIds = new Set(manifest.entries.map(entry => entry.id));
  const includedEntries = entries
    .filter(entry => includedEntryIds.has(entry.id))
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.audit.entryOrder - b.audit.entryOrder);

  // Lines are assembled as plain text for easy sharing/preview.
  const lines = [
    'ParentVault Journal Export',
    `Generated: ${new Date(manifest.generatedAt).toLocaleString()}`,
    `Entries: ${manifest.entryCount}`,
    `Attachments: ${manifest.attachmentCount}`,
    '',
    'Records'
  ];

  // Render each entry in chronological order with evidence-oriented metadata.
  includedEntries.forEach((entry, index) => {
    lines.push(
      '',
      `${index + 1}. ${entry.title}`,
      `Type: ${entry.type}`,
      `Event time: ${new Date(entry.occurredAt).toLocaleString()} (${entry.occurredAtPrecision})`,
      `Entered: ${new Date(entry.audit.createdAt).toLocaleString()}`,
      entry.peopleInvolved?.length ? `People: ${entry.peopleInvolved.join(', ')}` : 'People: not listed',
      entry.location ? `Location: ${entry.location}` : 'Location: not listed',
      `Notes: ${entry.notes || 'No notes'}`
    );

    if (request.includeAttachments && entry.attachments.length) {
      lines.push(`Attachments: ${entry.attachments.map(attachment => `${attachment.kind} ${attachment.filename ?? attachment.id}`).join('; ')}`);
    }
  });

  lines.push('', 'Review reminders', ...manifest.warnings.map(warning => `- ${warning}`));
  return lines.join('\n');
}
