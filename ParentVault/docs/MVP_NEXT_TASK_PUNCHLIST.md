# ParentVault MVP Next-Task Punch List

_Last updated: 2026-05-12_

## Current verified baseline

- `npm run typecheck` passes for API, mobile, and shared workspaces.
- Mobile app has the core prototype screens: Profiles, Schedule, Chat, Import, Journal, Security.
- Backend is still a skeleton; do not use real family data yet.

## Immediate next tasks

### 1. Visual smoke test on device/emulator

**Goal:** prove the app launches and each screen is usable.

- [ ] Run `npm run mobile` from the project root.
- [ ] Open in Android emulator or Expo Go.
- [ ] Tap each tab: Profiles, Schedule, Chat, Import, Journal, Security.
- [ ] Capture screenshots of broken layouts, clipped text, confusing labels, or crashes.
- [ ] Confirm bottom navigation is usable on a small phone screen.

**Done when:** all tabs open without crashing.

### 2. Core MVP flow polish

**Goal:** make the three highest-value flows feel coherent.

- [ ] Profiles: add/edit child profile drafts with clear sample/prototype warnings.
- [ ] Schedule: add event, medication reminder, mark medication taken, schedule local alerts.
- [ ] Journal: save factual note, attach image, preview export manifest.
- [ ] Add edit/delete paths for user-created profile, schedule, and journal records.
- [ ] Add better empty states and success/error messages.

**Done when:** a parent can understand the product in under five minutes using sample data only.

### 3. Backend/auth decision

**Goal:** select the production direction before persistence work.

Recommended default unless Luke chooses otherwise:

- Hosted Postgres backend.
- Strong auth provider.
- Expo notifications first.
- S3-compatible encrypted attachment storage.
- Preserve backend adapter boundary for future self-host.

Options to compare:

- Supabase: fastest Postgres/auth/storage path.
- Firebase: strong mobile-first auth/notifications, less ideal for relational custody/schedule data.
- Clerk/Auth0 + custom API: more control, more setup.

**Done when:** one auth/database/storage stack is selected.

### 4. Safe persistence implementation

**Goal:** move from prototype state to backend-backed state without leaking sensitive data.

- [ ] Implement auth session handling.
- [ ] Persist profiles/schedule/journal through backend adapter.
- [ ] Encrypt sensitive fields before storage or use envelope encryption.
- [ ] Add audit metadata to creates/updates/deletes/imports.
- [ ] Add export and account deletion endpoints.
- [ ] Add logging redaction tests.

**Done when:** sample data round-trips through the backend with no plaintext sensitive logs.

### 5. Notification reliability

**Goal:** reminders are trustworthy on real devices.

- [ ] Permission onboarding explains lock-screen privacy.
- [ ] Day-before, day-of, hour-before, and custom reminders work.
- [ ] Medication mark-as-taken history is visible.
- [ ] Missed reminder behavior is clear.
- [ ] Test on physical Android device.

**Done when:** a real local notification fires at the expected time.

## Quick wins already started

- Added prototype warning to the app header.
- Added journal validation so blank entries are not silently saved.
- Journal now shows newest entries first.

## Hard safety rule

No real child, custody, SSN, medical, insurance, legal, or journal data should be entered until auth, encryption, logging redaction, export, and deletion are implemented and tested.
