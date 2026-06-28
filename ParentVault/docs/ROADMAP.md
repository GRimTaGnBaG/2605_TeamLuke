# ParentVault Roadmap

## Phase 0 — Prototype foundation

- Expo mobile shell with Profiles, Schedule, Chat, Import, and Journal tabs.
- Shared TypeScript domain models.
- Backend client boundary for cloud and self-host modes.
- Static/mock AI import and notification planning.
- Product docs, launch checklist, and security assumptions.

## Phase 1 — Private alpha: cloud-first MVP

Goal: prove weekly usefulness and trust with a small number of parents.

- Hosted API with auth, encrypted record persistence, and audit metadata.
- Real create/edit/delete flows for child profiles, schedule items, medications, and journal entries.
- Local biometric/PIN app lock.
- Push/local notification implementation for schedule and medication reminders.
- Medication “taken” confirmation history.
- Import job pipeline with OCR/parser stubs first, then limited AI extraction.
- Parent review/diff flow for all imported or chat-generated changes.
- Export/delete flows and privacy policy draft.
- Internal abuse/safety rules: no legal advice, no medical advice, no covert monitoring.

## Phase 2 — Public beta: reliable family operations

Goal: make the app reliable enough for strangers to use with sensitive family data.

- Subscription billing and entitlement checks.
- Multi-child dashboard and better today/this-week views.
- Calendar import read support.
- More robust document extraction for school flyers, custody schedules, medication instructions, and screenshots.
- Attachment upload with retention controls.
- Search/filter for journal and schedule.
- Notification reliability reporting and missed-reminder recovery.
- App store beta review, crash reporting, and support process.
- External security/privacy review.

## Phase 3 — Launch 1.0

Goal: launch a polished cloud-first Android/iOS product.

- Production cloud deployment with backups, monitoring, incident response, and key management.
- Hardened onboarding, trust center, consent screens, and data lifecycle controls.
- App Store and Google Play production listings.
- Launch website, pricing page, support docs, and FAQ.
- Paid plans live.
- Data portability: machine-readable export plus human-readable PDF/CSV export.
- High-confidence AI import flows with conservative fallback questions.

## Phase 4 — Family sharing and integrations

- Caregiver/co-parent invite roles with least-privilege permissions.
- Confirmation requests for pickups, meds, or events.
- Calendar provider two-way sync where safe.
- School/clinic/contact directory improvements.
- Shared emergency card.
- Optional neutral co-parent communication log, still factual and non-advisory.

## Phase 5 — Self-host option

Goal: let privacy-focused parents run their own ParentVault backend without changing the mobile app mental model.

- ParentVault Desktop/Server for Windows/macOS/Linux.
- QR pairing: server URL, public key, one-time token.
- Local HTTPS API and encrypted storage.
- Migration from cloud vault to self-hosted vault.
- Optional relay/tunnel for remote access.
- Cloud metadata-only mode or full cloud disable.
- Self-host backup/export UX.

## Guiding sequencing principle

Do cloud-first because it lowers setup friction and speeds mobile iteration. Preserve self-host by enforcing the `BackendClient` boundary, portable encrypted records, and explicit pairing/key ownership from the beginning.
