# ParentVault Next Tasks & Setup Guide

_Last updated: 2026-05-12_

## 1. Where the files are

Main project folder:

```text
C:\Users\GrimRipper\.openclaw\workspace\ParentVault
```

Important paths:

```text
ParentVault\package.json                  # Root workspace scripts
ParentVault\README.md                     # Project overview
ParentVault\apps\mobile                  # Expo React Native app
ParentVault\apps\mobile\App.tsx          # Mobile app entry/shell
ParentVault\apps\mobile\src\screens      # Main app screens
ParentVault\apps\mobile\src\services     # Notifications, imports, privacy, security helpers
ParentVault\apps\mobile\src\store        # Local app state/store
ParentVault\apps\api                     # Fastify backend skeleton
ParentVault\apps\api\src                 # API routes/auth/backend code
ParentVault\packages\shared              # Shared TypeScript models and logic
ParentVault\docs                         # Product, security, launch, roadmap docs
```

Best docs to read first:

```text
docs\MVP_SCOPE.md
docs\ROADMAP.md
docs\LAUNCH_CHECKLIST.md
docs\ARCHITECTURE.md
docs\ENCRYPTION.md
docs\MOBILE_MVP_UX_AUDIT.md
```

## 2. Current project status

The app is currently an MVP skeleton, not production-ready yet.

Already in place:

- Expo mobile app for Android/iOS.
- Fastify API skeleton.
- Shared TypeScript package.
- Mobile screens for schedule, profiles, journal, import, chat, and security.
- Notification/reminder scaffolding.
- Privacy/security/encryption design docs.
- AI import and school enrichment placeholder flows.
- TypeScript typecheck passes across all workspaces.

Do **not** put real family data into it yet. Encryption/auth/storage are still scaffold-level.

## 3. Local setup

Open PowerShell and go to the project:

```powershell
cd C:\Users\GrimRipper\.openclaw\workspace\ParentVault
```

Install dependencies if needed:

```powershell
npm install
```

Verify code still typechecks:

```powershell
npm run typecheck
```

Start the mobile app:

```powershell
npm run mobile
```

Then in the Expo terminal:

- Press `a` for Android emulator/device.
- Press `i` for iOS simulator, only on macOS.
- Use Expo Go or a development build for physical-device testing.

Start the API skeleton in a second terminal:

```powershell
cd C:\Users\GrimRipper\.openclaw\workspace\ParentVault
npm run api
```

## 4. Recommended next-task order

### Task 1 — Visual smoke test the mobile app

Goal: make sure the app opens and every tab/screen is usable.

Checklist:

- [ ] Run `npm run mobile`.
- [ ] Open the app in Android/Expo.
- [ ] Tap through every screen.
- [ ] Note broken layout, missing buttons, confusing labels, or crashes.
- [ ] Take screenshots of anything ugly or broken.

Pass condition:

- App opens without crashing and all major screens render.

### Task 2 — Tighten the core MVP flow

Focus on the three flows that matter most:

1. Child profile / vault.
2. Schedule / reminders.
3. Journal / evidence log.

Checklist:

- [ ] Create/edit/delete mock child profile data.
- [ ] Create/edit/delete schedule items.
- [ ] Create a medication reminder and mark it taken.
- [ ] Create a journal entry with attachment metadata.
- [ ] Confirm empty states make sense.
- [ ] Confirm error states are understandable.

Pass condition:

- A parent can understand the basic product in under five minutes.

### Task 3 — Decide backend/auth direction

Before real data, choose the backend path.

Recommended path for now:

- Cloud-first hosted API.
- Strong auth.
- Encrypted records.
- Local device lock.
- Keep self-host support later by preserving the backend adapter boundary.

Choices to make:

- [ ] Auth provider: Supabase, Firebase, Clerk, Auth0, or custom.
- [ ] Database: Postgres is the likely default.
- [ ] Storage for attachments: S3-compatible bucket or provider storage.
- [ ] Push notifications: Expo notifications first, native later if needed.

Pass condition:

- One auth/database/storage plan is selected before persistence work begins.

### Task 4 — Implement real persistence safely

Only after Task 3.

Checklist:

- [ ] Replace mock/local-only storage with backend calls behind the existing adapter boundary.
- [ ] Encrypt sensitive records before cloud persistence or use envelope encryption.
- [ ] Ensure logs never include SSNs, medical details, document text, or private notes.
- [ ] Add audit metadata for create/update/delete/import actions.
- [ ] Add export/delete account endpoints.

Pass condition:

- Test child profile/schedule/journal data can round-trip through the backend without plaintext sensitive logging.

### Task 5 — Build notification reliability

Checklist:

- [ ] Local notifications request permission clearly.
- [ ] Reminder offsets work: day-before, day-of, hour-before, custom minutes.
- [ ] Medication reminders include mark-as-taken.
- [ ] Missed/failed notification behavior is understandable.

Pass condition:

- A test reminder fires correctly on a physical Android device.

### Task 6 — Harden AI/import behavior

Checklist:

- [ ] Imports require explicit consent.
- [ ] AI suggestions never save automatically.
- [ ] Review screen shows proposed changes, confidence, and warnings.
- [ ] Ambiguous dates/times ask follow-up questions.
- [ ] Source files can be deleted after extraction.

Pass condition:

- Import flow is helpful but conservative; parent approval is always required.

## 5. Commands I should run when checking progress

From the project root:

```powershell
npm run typecheck
```

Optional later gates:

```powershell
npm run lint
npm run mobile
npm run api
```

Note: `lint` currently only runs if configured in workspaces; if no lint script exists, add one later.

## 6. What to ask Jarvis next

Useful next prompts:

```text
Jarvis, run the ParentVault app and tell me what breaks.
```

```text
Jarvis, review the mobile UX and make a punch list for the MVP.
```

```text
Jarvis, implement the next safest ParentVault task.
```

```text
Jarvis, help me choose the backend/auth provider for ParentVault.
```

```text
Jarvis, turn the MVP checklist into GitHub-style issues.
```

## 7. My recommendation

Next best move: run the mobile app visually, fix the rough edges in Schedule/Profile/Journal, then decide backend/auth before touching real data.

Security rule: no real child, medical, custody, or SSN data goes into ParentVault until auth, encryption, logging, export, and deletion are implemented and tested.
