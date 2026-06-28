# ParentVault Product Presentation Notes

## One-line summary

ParentVault is a secure Android/iOS family operations vault for child profiles, schedules, medication reminders, AI-assisted imports, and factual journaling.

## Product promise

ParentVault helps a parent stop losing critical child information across screenshots, texts, calendars, school flyers, custody notes, medication bottles, and memory. The app turns scattered information into structured records while keeping sensitive data protected and AI suggestions reviewable.

## Main user flow

1. Parent completes a friendly onboarding flow or starts in schedule-only mode.
2. Parent adds one or more child profiles only as deeply as they are comfortable.
3. Parent uses the main tabs: Profiles, Schedule, Chat, Import, Journal, and Settings.
4. Parent reviews AI/import suggestions before anything sensitive is saved.
5. Parent receives reminders, confirms medication actions, and keeps factual journal records.
6. Parent controls privacy, notifications, export, deletion, and future cloud/self-host behavior.

## Main pages/tabs

### Profiles

The Profiles page is the child vault. It is intended to hold identity, care, medical, provider, school, emergency contact, insurance, and custody information.

Key points:

- Store the information a parent needs during emergencies, school issues, medical calls, custody exchanges, and everyday planning.
- Mask sensitive fields by default, especially SSNs, insurance/Rx IDs, custody text, and medical notes.
- Use a completeness assistant to suggest missing details without forcing the parent to enter optional sensitive data.
- Encrypt sensitive data before persistence and never log it in plaintext.

### Schedule

The Schedule page handles custody, school, events, therapy, medication, pickup timing, journal prompts, and monthly planning reminders.

Key points:

- Support today/next-up reminders and practical “nanny-style” guidance.
- Support medication reminders with mark-as-taken confirmation.
- Let parents configure day-before, day-of, hour-before, and custom notification offsets.
- Default lock-screen notification text should be generic to avoid leaking custody or medical details.

### Chat

The Chat page is a factual assistant and command layer for the vault.

Key points:

- Answer factual questions from stored vault data, such as provider names, school details, insurance notes, and medication schedules.
- Draft structured changes from natural language, such as schedule items or reminder drafts.
- Cite or list the stored sources used for factual answers.
- Never provide legal or medical advice. The assistant may organize facts and reminders only.
- Sensitive edits should remain review-first and should not silently mutate private data.

### Import

The Import page turns messy real-world inputs into reviewed structured suggestions.

Supported source direction:

- Text
- Voice transcripts
- Images
- Screenshots
- PDFs
- School flyers
- Calendars
- Custody decrees
- Other parent-provided documents

Key points:

- AI/OCR output should produce drafts: proposed profile updates, schedule items, journal entries, confidence, warnings, and source metadata.
- Parent review is mandatory before saving any AI-derived change.
- Source retention/deletion choice should be explicit.
- SSNs, medical details, custody documents, screenshots, and child images require explicit consent before AI/OCR processing.

### Journal

The Journal page captures factual parent records.

Use cases:

- Custody events
- School updates
- Medication logs
- Symptoms
- Appointments
- Doctor calls
- Photos/screenshots
- Communication notes
- Expenses or incidents

Key points:

- Entries should include occurred-at time, entered-at metadata, child association, title, notes, category/tags, people/location, and attachment metadata.
- Exports should be evidence-grade: structured, timestamped, source-aware, and careful not to leak plaintext into logs.
- The journal should encourage neutral factual wording rather than emotional or accusatory language.

### Settings

The Settings page is the trust center.

Key points:

- Dark mode is currently the default app theme, with a Light Mode toggle.
- Security/privacy controls belong here: vault unlock, 2FA, masking, notification privacy, AI consent, export, deletion, and cloud/self-host options.
- The page should clearly explain prototype limitations and production safety requirements.

## Onboarding direction

The intended onboarding tone is a friendly nanny-style guide. It should walk parents through:

- Child profile basics
- School details
- Medical/care details
- Custody details
- Journal setup
- Privacy and data choices

Every optional sensitive category should be skippable. ParentVault should feel calm and helpful, not like a stressful legal or medical form.

## Data model overview

### ChildProfile

Identity, medical/care details, providers, emergency contacts, insurance, school, custody, and timestamps.

### ScheduleItem

Type, child, title, startsAt, location, notes, notification offsets, confidence, source, and medication confirmation state.

### JournalEntry

Occurred/entered metadata, facts, notes, tags, child association, people/location, attachments, and export metadata.

### ImportSuggestion

Extracted draft records with source, confidence, warnings, consent/review metadata, and proposed changes.

## AI assistant boundaries

AI can:

- Summarize
- Extract
- Classify
- Suggest structured records
- Answer factual questions from stored vault data

AI cannot:

- Give legal advice
- Give medical advice
- Silently change sensitive data
- Process sensitive documents without explicit parent consent
- Replace parent review before saving changes

## Security and privacy posture

ParentVault is intended to handle extremely sensitive data, including SSNs, medical details, custody notes, screenshots, photos, emergency contacts, and journals.

Production blockers before real data:

1. Strong authentication and mandatory 2FA.
2. Local biometric/PIN/device-passcode vault unlock.
3. Encryption before persistence, sync, backup, queues, logs, exports, or AI/OCR processing.
4. Secure media/document storage.
5. AI/OCR consent, redaction, retention, and review workflow.
6. Export and delete flows.
7. Audit logs that do not copy sensitive plaintext.
8. Generic notification defaults for sensitive reminders.
9. Security tests for redaction, permissions, 2FA, recovery, consent, notifications, and attachments.
10. Legal/privacy review before public launch or real sensitive data.

## Current prototype status

- Expo React Native mobile app scaffold exists.
- API/backend scaffold exists.
- Shared TypeScript domain models exist.
- Dark mode is the default theme.
- Main tabs exist: Profiles, Schedule, Chat, Import, Journal, Settings.
- Current demo state is in-memory and not production secure storage.
- AI import is stubbed/fake and must be replaced with consent-aware processing.
- Use sample data only until the production blockers are resolved.

## Technical architecture

- `apps/mobile` — Expo React Native app for Android and iOS.
- `apps/api` — Node/Fastify backend skeleton for future cloud sync, auth, import jobs, notifications, and audit logs.
- `packages/shared` — shared TypeScript domain models and helper logic.
- Future mode — self-host backend using the same mobile app surface and backend client contract.

## Launch readiness priorities

1. Production auth, mandatory 2FA, local vault unlock, session/device controls.
2. End-to-end or per-user envelope encryption before persistence/sync/backup.
3. AI/OCR consent, redaction, retention, and parent review flow.
4. Secure media/document storage and deletion/export flows.
5. Notification privacy, audit logs, security tests, legal/privacy review, and app store privacy labels.

## Recommended next build steps

1. Add a polished Today / Next Up home view so the app is useful immediately.
2. Harden Settings into a trust center with privacy mode, notification privacy, export/delete, AI consent, and vault lock.
3. Turn static PDFs into clickable demo flows or a polished Expo demo script.
4. Keep all real family data out until encryption, auth, export/delete, and secure storage are finished.
