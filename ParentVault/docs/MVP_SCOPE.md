# ParentVault MVP Scope

## Product thesis

ParentVault is a mobile-first secure family operations vault for parents who need one trusted place for child profiles, custody/school/event schedules, medication reminders, AI-assisted document imports, and factual journaling.

The MVP should prove that parents will trust ParentVault with high-sensitivity child data because it is useful every week and transparent about privacy.

## Target launch shape

- **Platforms:** Android and iOS via Expo React Native.
- **Backend:** cloud-first hosted API for account sync, encrypted vault storage, AI import jobs, notifications, and audit logs.
- **Future mode:** later self-hosted PC/server backend using the same mobile app surface and backend client contract.
- **Primary user:** one parent managing one or more children.
- **Secondary users:** future caregiver/co-parent sharing is out of MVP unless needed for invite-based medication confirmations.

## MVP outcomes

1. A parent can create child profiles with sensitive details safely.
2. A parent can see what matters today: custody, school, events, and medications.
3. A parent can receive configurable reminders and mark medication as taken.
4. A parent can import messy real-world inputs and approve structured suggestions before saving.
5. A parent can keep factual journal entries with attachment metadata.
6. A parent can understand and control privacy, export, and deletion.

## In scope

### 1. Account, device, and vault basics

- Email/passkey or email/password account creation.
- Device biometric/PIN gate before opening the app.
- Cloud vault record sync through the backend abstraction.
- Per-record timestamps and audit metadata.
- Export/delete request flow.
- Clear privacy copy during onboarding.

### 2. Child profile vault

- Child display name, birthdate, SSN last four/encrypted full SSN, allergies, medications, emergency contacts, notes.
- Sensitive field handling: no plaintext SSN logging, masked display, explicit edit intent.
- Multiple children under one parent account.

### 3. Schedule and reminders

- Schedule types: custody, school, event, medication.
- Basic create/edit/delete for schedule items.
- Notification offsets: day before, day of, hour before, custom minutes.
- Today/next-up view.
- Medication reminder with “mark as taken” and taken timestamp.

### 4. AI-assisted import review

- Import sources: text, voice transcript, image, screenshot, PDF, flyer, calendar, decree.
- Backend import job placeholder that returns structured suggestions.
- Parent review screen showing proposed profile updates, schedule items, journal entries, confidence, and warnings.
- Save only after explicit parent approval.
- Delete source after processing or retain by setting.

### 5. Chat command assistant

- Natural-language command entry for schedule/profile updates.
- Assistant proposes changes, never silently mutates sensitive data.
- Explain uncertainty and ask for missing dates/times.

### 6. Journal

- Factual journal entries with occurred date/time, title, notes, tags, child association.
- Photo/screenshot/document attachment metadata.
- Redaction flag for attachment metadata.
- Export-ready structure for parent records.

## Out of scope for MVP

- Full legal case management.
- Legal advice, custody strategy, or court filing generation.
- Medical diagnosis or medication recommendations.
- Co-parent messaging and dispute workflows.
- Full calendar provider two-way sync.
- Real-time family sharing/roles beyond a single parent account.
- Production self-host installer.
- Automated OCR/AI extraction without parent review.
- Payment enforcement beyond basic subscription gating.

## MVP quality bar

- No sensitive data in logs.
- No AI action writes without review.
- Basic offline/read cache and retry queue for edits.
- Clear empty states and recovery for failed import jobs.
- Data export and account deletion documented before public launch.
- App store privacy labels and internal security checklist complete.
