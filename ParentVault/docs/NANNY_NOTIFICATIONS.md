# Nanny-Style Notification Coverage

ParentVault should include Nanny bot’s notification behavior without the Discord-specific delivery layer.

## Included behavior

Nanny reminder patterns now represented in app code:

- Day-before event reminder at **7:00 PM**.
- Day-of event reminder at **7:00 AM**.
- Early event day-of reminder fallback at **4:57 AM** when an event starts before 8:00 AM.
- One-hour-before event reminder.
- Custody/pickup reminder:
  - **3:45 PM** on school days.
  - **5:45 PM** on no-school/school-out days.
- Therapy reminders:
  - **8:55 AM** planning/transportation reminder.
  - One-hour-before reminder.
  - Future production rule: only schedule when the parent has the child.
- Medication due reminders with mark-as-taken flow.
- Nightly journal prompt at **8:45 PM**.
- Monthly next-month calendar/reminder prep on the **28th at 7:00 PM**.

## Not included

- Discord DM delivery.
- OpenClaw cron job management inside the app.

The mobile app uses local push notifications. Production can add SMS/email/in-app inbox later if the user opts in.

## Current implementation

Shared reminder planner:

- `packages/shared/src/reminders.ts`
- `defaultNannyStyleNotificationPreferences()`
- `planNannyStyleReminders()`
- `planJournalPrompt()`
- `planMonthlyCalendarSetup()`

Mobile scheduler:

- `apps/mobile/src/services/notifications.ts`
- Schedule screen previews Nanny-style reminder rules and per-event planned alerts.

## Gaps before production

- Persist scheduled notification IDs so reminders can be cancelled/updated.
- Build recurring reminder setup for nightly journal prompt and monthly prep.
- Implement custody ownership engine so therapy reminders only fire when the parent has the child.
- Connect school/no-school calendar dates to pickup reminder time selection instead of relying on text matching.
- Add notification preference editor.
- Keep lock-screen notification text generic by default for privacy.
