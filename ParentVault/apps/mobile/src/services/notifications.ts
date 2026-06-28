/**
 * PARENTVAULT-COMMENTARY
 *
 * Defines local notification preview/scheduling helpers for Nanny-style reminders.
 *
 * The service maps schedule items into practical reminders: day-before, day-of, hour-before, pickup, therapy, medication, journal, and monthly prep.
 *
 * Production notification bodies should default to generic text for custody/medical privacy.
 *
 * Reading guide:
 * - Comments in this project explain product intent, privacy/security boundaries, and why a flow exists.
 * - They are deliberately more detailed than normal production comments because this prototype is being shared for learning, review, and handoff.
 * - If code and comments ever disagree, fix both together; stale privacy/security comments are dangerous.
 */

import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { defaultNannyStyleNotificationPreferences, planJournalPrompt, planMonthlyCalendarSetup, planNannyStyleReminders, type PlannedReminder, type ScheduleItem } from '@parentvault/shared';

Notifications.setNotificationHandler({
  // Default local notification behavior for this prototype: show alerts and play sound, no badge count.
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

export async function ensureNotificationPermission() {
  // Reuse existing permission when already granted; otherwise request permission at scheduling time.
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export function previewNannyStyleAlerts(item: ScheduleItem): PlannedReminder[] {
  // Preview uses shared reminder rules without touching the device scheduler.
  return planNannyStyleReminders(item, defaultNannyStyleNotificationPreferences());
}

export async function schedulePlannedReminder(reminder: PlannedReminder) {
  // Do not schedule if notification permission is denied.
  const allowed = await ensureNotificationPermission();
  if (!allowed) return undefined;
  // Past reminders are ignored because Expo cannot schedule them usefully.
  const triggerAt = new Date(reminder.firesAt);
  if (triggerAt.getTime() <= Date.now()) return undefined;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: reminder.title,
      body: reminder.body,
      data: { plannedReminderId: reminder.id, kind: reminder.kind, scheduleItemId: reminder.scheduleItemId }
    },
    trigger: { type: SchedulableTriggerInputTypes.DATE, date: triggerAt }
  });
}

export async function scheduleLocalAlerts(item: ScheduleItem) {
  // Schedule every future planned reminder and return Expo's notification ids.
  const planned = previewNannyStyleAlerts(item);
  const ids: string[] = [];
  for (const reminder of planned) {
    const notificationId = await schedulePlannedReminder(reminder);
    if (notificationId) ids.push(notificationId);
  }
  return ids;
}

export function previewNannyStandingReminders() {
  // Standing reminders are not tied to a schedule item; this preview feeds the rules explainer card.
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return [
    planJournalPrompt(tomorrow),
    planMonthlyCalendarSetup(nextMonth)
  ].filter((reminder): reminder is PlannedReminder => Boolean(reminder));
}
