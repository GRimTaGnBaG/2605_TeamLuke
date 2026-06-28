# School Enrichment Workflow

## Goal

ParentVault should minimize manual entry. If a parent provides a school name, flyer, website, or district clue, the app should try to find school details itself and only ask the parent to confirm.

Example parent input:

- “She goes to Castle Heights Elementary.”
- “Add Wilson County Schools calendar.”
- A screenshot/flyer with school name.

## Information to collect

School profile:

- School name
- District name
- Website URL
- Calendar URL
- Address/location
- Main phone
- Attendance phone
- Office hours
- School hours
- Teacher/grade if parent provides it
- Pickup instructions and bus info if parent provides it

Academic calendar:

- First day of school
- Last day of school
- Holidays
- Breaks
- Teacher workdays
- Early release days
- No-school dates
- Registration/open house events

## Expected assistant behavior

1. Parent gives school name/location or uploads a school flyer/calendar.
2. Backend searches official school/district sources first.
3. Backend fetches official pages/PDFs/calendar feeds.
4. AI/OCR extracts proposed school profile and yearly calendar dates.
5. App shows a review screen:
   - Found school details
   - Found calendar/no-school dates
   - Source links
   - Confidence
   - Warnings
6. Parent confirms or edits.
7. Only confirmed data is saved.
8. Confirmed out-of-school dates are added to the schedule as `school` items.

## Source priority

1. Official school website
2. Official district website
3. Official district PDF calendar
4. Official iCal/Google calendar feed
5. Government education directories
6. Third-party school directories only as fallback, never trusted alone

## Safety rules

- Never silently overwrite parent-confirmed school details.
- Never add no-school dates without review/confirmation.
- Keep source URLs with every extracted date.
- Refresh calendar yearly or when district publishes an update.
- If multiple schools match, choose the most likely candidate but ask for confirmation.
- Avoid asking the parent for information that can be found safely from official public sources.

## MVP implementation

Current mobile MVP includes:

- `SchoolInfo` fields for website, calendar URL, hours, district, and calendar dates.
- `SchoolEnrichmentSuggestion` review model.
- `apps/mobile/src/services/schoolEnrichment.ts` placeholder that mimics web-backed enrichment.
- Child Vault review/confirm UI.
- Confirmed school dates become schedule items.

Production should move enrichment to the backend because mobile apps should not scrape/search broadly themselves.
