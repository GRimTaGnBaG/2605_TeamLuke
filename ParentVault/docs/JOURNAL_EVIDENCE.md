# Journal, Evidence, and Medical Logging

## Goal

Parents should be able to document anything they need to preserve: custody events, school issues, medical symptoms, medications, behavior, expenses, appointments, screenshots of texts, photos, documents, and general notes.

ParentVault is not a legal service, but it should organize records cleanly so a parent can export them later for an attorney, court, doctor, school, or personal reference.

## Entry model

Every journal entry stores two separate timelines:

1. **Event date/time** — when the parent says the event happened.
2. **Input/audit timestamp** — when the parent added it to ParentVault.

This matters because a parent may add something later but still need the event dated correctly.

Fields:

- Entry type: general, medical, custody, school, communication, behavior, expense, appointment, medication, other
- Child ID
- Event date/time
- Event time precision: exact, approximate, date-only, unknown
- Title
- Notes/context
- People involved
- Location
- Tags
- Attachments
- Source document IDs
- Audit metadata:
  - created at
  - updated at
  - device/account metadata
  - timezone
  - input order
  - whether event time was user-supplied
  - source: manual, camera, share sheet, document import, AI import

## Attachments

Supported attachment types:

- Photo
- Screenshot
- Document

Attachment metadata:

- URI / storage reference
- Filename
- MIME type
- Captured-at time if available
- Imported-at time
- Capture method: camera, photo library, screenshot import, document picker, share sheet, manual
- Original metadata, encrypted in production
- SHA-256 hash in production
- Redaction flag
- Notes

Production should preserve original files, calculate hashes, and export a manifest. Metadata should be encrypted and should not be modified silently.

## Medical logging

Medical entries can track:

- Symptoms
- Temperature or other readings
- Medication taken/missed
- Side effects
- Doctor calls
- Appointment notes
- Injury photos
- School nurse calls
- Pharmacy/refill issues

The app should remind users that medical logs are records, not medical advice.

## Court/custody logging

Court-oriented entries can track:

- Exchanges
- Missed pickups/drop-offs
- Communication screenshots
- Schedule disputes
- Expenses
- School/medical decision events
- Calls/messages with context

The app should stay factual: who, what, when, where, source/attachment. Avoid emotional language prompts. It should not claim that an item is admissible evidence; that is for an attorney/court.

## Export

Export should support:

- PDF timeline
- ZIP with attachments
- JSON manifest
- CSV summary

Export package should include:

- Entries sorted by event date/time, then input order
- Entry created-at/updated-at metadata
- User-supplied event date/time
- Notes
- Tags/type
- People/location
- Attachment files
- Attachment metadata
- Hashes/checksums
- Export manifest
- Warnings/disclaimer

## Current MVP implementation

- Shared journal evidence types are in `packages/shared/src/index.ts`.
- Mobile journal screen supports entry type, event date/time, title, people, location, notes, photo/screenshot import, camera capture, and export preview.
- `apps/mobile/src/services/journalExport.ts` builds an export manifest scaffold.
- API validation accepts the expanded journal/audit/attachment shape.

## Production blockers

- Encrypted attachment/media storage.
- Original metadata preservation.
- SHA-256 hashing.
- Immutable audit log or append-only revision history.
- PDF/ZIP export generation.
- Share sheet import.
- Secure delete/export controls.
- Clear legal disclaimer and attorney-friendly export format review.
