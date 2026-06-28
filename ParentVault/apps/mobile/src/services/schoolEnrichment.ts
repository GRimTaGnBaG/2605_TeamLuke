/**
 * PARENTVAULT-COMMENTARY
 *
 * Drafts school enrichment data such as address, phone, hours, website, calendar URL, and no-school dates.
 *
 * This workflow should help parents fill gaps without treating web/AI guesses as truth.
 *
 * All enriched school details must remain draft until a parent confirms them.
 *
 * Reading guide:
 * - Comments in this project explain product intent, privacy/security boundaries, and why a flow exists.
 * - They are deliberately more detailed than normal production comments because this prototype is being shared for learning, review, and handoff.
 * - If code and comments ever disagree, fix both together; stale privacy/security comments are dangerous.
 */

import type { SchoolCalendarDate, SchoolEnrichmentSuggestion, SchoolInfo } from '@parentvault/shared';

// Local helpers for timestamps and demo ids in draft enrichment results.
const now = () => new Date().toISOString();
const id = () => Math.random().toString(36).slice(2, 10);

export interface SchoolSearchInput {
  // School name is required because enrichment starts from a known/entered school.
  schoolName: string;
  // Optional location narrows search/enrichment and improves draft details.
  city?: string;
  state?: string;
  academicYear?: string;
}

/**
 * MVP placeholder for web-backed school enrichment.
 * Production backend should perform live search/fetch/OCR/calendar parsing, then return reviewable suggestions.
 */
export async function suggestSchoolEnrichment(input: SchoolSearchInput): Promise<SchoolEnrichmentSuggestion> {
  // Build a query string that future search/fetch code can use.
  const location = [input.city, input.state].filter(Boolean).join(', ');
  const query = `${input.schoolName}${location ? ` ${location}` : ''} ${input.academicYear ?? ''}`.trim();

  // Draft school details intentionally contain "Review required" markers until real sources are parsed.
  const school: Partial<SchoolInfo> = {
    schoolName: input.schoolName,
    districtName: location ? `${input.city ?? ''} School District`.trim() : undefined,
    websiteUrl: `https://search.example/school?q=${encodeURIComponent(query)}`,
    calendarUrl: `https://search.example/school-calendar?q=${encodeURIComponent(`${query} calendar`)}`,
    address: input.city && input.state ? {
      line1: 'Review required  -  found from web search',
      city: input.city,
      state: input.state,
      postalCode: 'Review'
    } : undefined,
    mainPhone: 'Review required',
    officeHours: 'Review required',
    schoolHours: 'Review required',
    lastEnrichedAt: now(),
    enrichmentSources: [
      'School official website search result',
      'District academic calendar search result'
    ],
    notes: 'Web enrichment draft. Parent must confirm official website, address, phone, hours, and calendar dates before saving.'
  };

  // Placeholder calendar dates exercise the review/save flow before real calendar parsing exists.
  const calendarDates: SchoolCalendarDate[] = [
    {
      id: id(),
      type: 'first_day',
      title: 'First day of school  -  review exact date',
      startsAt: `${new Date().getFullYear()}-08-01T08:00:00.000Z`,
      noSchool: false,
      confidence: 0.2,
      notes: 'Placeholder until backend parses the official school/district calendar.'
    },
    {
      id: id(),
      type: 'break',
      title: 'Fall break / no school  -  review exact date range',
      startsAt: `${new Date().getFullYear()}-10-01T08:00:00.000Z`,
      endsAt: `${new Date().getFullYear()}-10-05T17:00:00.000Z`,
      noSchool: true,
      confidence: 0.2,
      notes: 'Placeholder until backend parses the official school/district calendar.'
    }
  ];

  return {
    id: id(),
    query,
    school,
    calendarDates,
    sources: school.enrichmentSources ?? [],
    warnings: [
      'Parent confirmation required before saving school details or no-school dates.',
      'Use official school/district sources first; third-party school directory data may be stale.',
      'Calendar dates should be refreshed yearly.'
    ],
    confidence: 0.35,
    requiresParentConfirmation: true
  };
}

export function schoolDatesToScheduleItems(childId: string | undefined, dates: SchoolCalendarDate[]) {
  // Converts reviewed school calendar dates into schedule reminders.
  return dates.map(date => ({
    childId,
    type: 'school' as const,
    title: date.noSchool ? `No school: ${date.title}` : date.title,
    startsAt: date.startsAt,
    endsAt: date.endsAt,
    notes: [date.notes, date.sourceUrl ? `Source: ${date.sourceUrl}` : undefined].filter(Boolean).join('\n') || undefined,
    notificationOffsets: ['day_before' as const],
    confidence: date.confidence
  }));
}
