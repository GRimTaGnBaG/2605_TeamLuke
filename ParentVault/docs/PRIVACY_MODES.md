# Privacy Modes and Optional Data

ParentVault must be useful even when a parent does not want to store detailed child data.

## Core rule

Schedule reminders are the baseline feature. A parent can use schedule reminders without entering SSN, insurance, doctors, school, medical history, custody documents, journals, photos, screenshots, AI imports, or web enrichment.

No optional category should block the rest of the app.

## Modes

### Schedule-only / minimal mode

Enabled features:

- Schedule reminders
- Generic notifications
- Mark-as-done / mark-as-taken style confirmations if the parent creates those reminders manually

Disabled by default in this mode:

- Optional child profile prompts
- Medical vault
- Doctors/pharmacy
- Insurance
- School enrichment
- Custody/legal docs
- Journal
- Media attachments
- AI imports
- Web enrichment

### Full vault mode

The parent may enable any combination of optional categories. Every category remains skippable.

## Consent rules

- Ask for optional data only when the feature is enabled.
- Every prompt must have a skip path.
- “Required” means required for that feature, not required for the app.
- If a parent declines a feature, do not nag them repeatedly.
- Re-enable prompts only when the parent explicitly turns the feature back on.
- AI import and web enrichment require separate consent because they process data outside simple local entry.

## Chatbot behavior

The bot should say things like:

- “You can skip that and still use schedule reminders.”
- “Insurance is only needed if you want the vault to answer insurance/referral/prescription questions.”
- “I won’t ask for medical details while medical vault is off.”
- “Schedule-only mode is on, so I’ll keep this to dates, times, reminders, and notifications.”

## Current implementation

- Shared model: `PrivacyFeatureSettings` and `ParentVaultFeature`.
- Mobile privacy settings service: `apps/mobile/src/services/privacySettings.ts`.
- Security & Privacy screen has:
  - schedule-only mode
  - full vault mode
  - per-feature toggles
  - optional prompt toggle
- Completeness prompts respect minimal mode and feature settings.

## Product principle

ParentVault should earn trust by collecting less by default, explaining why each optional detail helps, and letting the parent say no without losing the app’s core utility.
