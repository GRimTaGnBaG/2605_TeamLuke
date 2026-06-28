/**
 * PARENTVAULT-COMMENTARY
 *
 * Schedule/reminders screen for custody, school, events, therapy, medications, pickup timing, journal prompts, and monthly planning.
 *
 * It previews Nanny-style reminder rules and lets parents schedule local alerts or mark medication as taken.
 *
 * Sensitive reminder notifications should use generic lock-screen text unless a parent explicitly opts into details.
 *
 * Reading guide:
 * - Comments in this project explain product intent, privacy/security boundaries, and why a flow exists.
 * - They are deliberately more detailed than normal production comments because this prototype is being shared for learning, review, and handoff.
 * - If code and comments ever disagree, fix both together; stale privacy/security comments are dangerous.
 */

import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { NotificationOffset, ScheduleItem, ScheduleType } from '@parentvault/shared';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { ThemedTextInput } from '../components/ThemedTextInput';
import { previewNannyStandingReminders, previewNannyStyleAlerts, scheduleLocalAlerts } from '../services/notifications';
import { useVaultStore } from '../store/vaultStore';
import { useTheme } from '../theme';

// Converts the app's saved notification offset values into plain English for the UI.
// Schedule items can store either named offsets like "day_before" or a custom minute count.
const formatOffset = (offset: NotificationOffset) => {
  if (offset === 'day_before') return 'day before';
  if (offset === 'day_of') return 'morning of';
  if (offset === 'hour_before') return 'hour before';
  return `${offset.customMinutesBefore} min before`;
};

// Normalizes a date to local midnight so day comparisons ignore hours/minutes/seconds.
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

// Uses the normalized date as a stable React key and comparison value for calendar tiles.
const dayKey = (date: Date) => startOfDay(date).toISOString();

// Compares two Date objects by calendar day instead of exact timestamp.
const isSameDay = (left: Date, right: Date) => dayKey(left) === dayKey(right);

// Short date label used in dashboard text and status messages.
const formatDayLabel = (date: Date) => date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

// Localized clock label used wherever a parent needs to scan event timing quickly.
const formatTime = (date: Date) => date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

// Maps saved schedule item types into user-facing labels.
// Keeping this centralized prevents one screen from saying "Med" while another says "Medication".
const typeLabel = (item: ScheduleItem) => {
  if (item.type === 'custody') return 'Custody';
  if (item.type === 'school') return 'School';
  if (item.type === 'medication') return 'Medication';
  if (item.type === 'appointment') return 'Appointment';
  return 'Event';
};

// Defines the color/icon language for each schedule category.
// The same tone object powers the legend, date cards, calendar dots, pills, and next-up panel.
const typeTone = (type: ScheduleItem['type']) => {
  if (type === 'custody') return { color: '#f97316', soft: '#ffedd5', darkSoft: '#431407', icon: 'swap-horizontal-outline' as const };
  if (type === 'school') return { color: '#14b8a6', soft: '#ccfbf1', darkSoft: '#134e4a', icon: 'school-outline' as const };
  if (type === 'medication') return { color: '#ef4444', soft: '#fee2e2', darkSoft: '#450a0a', icon: 'medical-outline' as const };
  if (type === 'appointment') return { color: '#8b5cf6', soft: '#ede9fe', darkSoft: '#2e1065', icon: 'clipboard-outline' as const };
  return { color: '#2563eb', soft: '#dbeafe', darkSoft: '#172554', icon: 'sparkles-outline' as const };
};

// Returns the quick relative label used in the "Next up" panel.
// The exact date is still shown beside it so the label is helpful without being ambiguous.
const getRelativeDay = (date: Date) => {
  const diff = Math.round((startOfDay(date).getTime() - startOfDay(new Date()).getTime()) / (24 * 60 * 60 * 1000));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `In ${diff} days`;
};

// Builds the rolling 14-day strip shown under the quick-add/readiness cards.
// It starts today and then walks forward one day at a time.
const getCalendarDays = () => {
  const today = startOfDay(new Date());
  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return date;
  });
};

// All schedule categories this screen supports for creation, filtering visuals, and the legend.
const scheduleTypes: ScheduleType[] = ['custody', 'school', 'event', 'medication', 'appointment'];

// Combines the date and time form fields into an ISO timestamp.
// Invalid entries return undefined so the submit handler can show a friendly validation message.
const parseEventDateTime = (dateText: string, timeText: string) => {
  const datePart = dateText.trim();
  const timePart = timeText.trim() || '09:00';
  const parsed = new Date(`${datePart}T${timePart.length === 5 ? `${timePart}:00` : timePart}`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

// Turns changing readiness copy into a safe checkbox id.
// This keeps the checked map stable for the current render without storing UI-only state in the vault.
const readinessId = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export function ScheduleScreen() {
  // Theme/styles first; every color comes from the active light/dark theme.
  const theme = useTheme();
  const styles = createStyles(theme);

  // Store values provide saved schedule items, children, and actions this tab can run.
  const schedule = useVaultStore(s => s.schedule);
  const children = useVaultStore(s => s.children);
  const addScheduleItem = useVaultStore(s => s.addScheduleItem);
  const updateScheduleItem = useVaultStore(s => s.updateScheduleItem);
  const removeScheduleItem = useVaultStore(s => s.removeScheduleItem);
  const markMedicationTaken = useVaultStore(s => s.markMedicationTaken);

  // alertStatus is UI feedback only. It tracks messages like "2 alerts scheduled" per card.
  // It is intentionally separate from the schedule store because local notification scheduling
  // is device-specific and should not rewrite the event itself.
  const [alertStatus, setAlertStatus] = useState<Record<string, string>>({});

  // Draft fields back the manual "Add to calendar" form.
  // They stay local until the parent taps Add calendar event and validation passes.
  const [draftTitle, setDraftTitle] = useState('');
  const [draftType, setDraftType] = useState<ScheduleType>('event');
  const [draftDate, setDraftDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [draftTime, setDraftTime] = useState('09:00');
  const [draftLocation, setDraftLocation] = useState('');
  const [draftNotes, setDraftNotes] = useState('');
  const [draftError, setDraftError] = useState('');

  // quickStatus gives confirmation for quick-add and remove actions without needing a toast library.
  const [quickStatus, setQuickStatus] = useState('');

  // checkedReadiness is local checklist state for the "Today readiness" card.
  // These checks are lightweight daily confirmations, not permanent child-profile data.
  const [checkedReadiness, setCheckedReadiness] = useState<Record<string, boolean>>({});

  // pendingRemoveId implements the two-tap delete confirmation for schedule items.
  // First tap arms the removal; second tap confirms it.
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  // Always show upcoming items in time order so the parent sees what matters next first.
  const sortedSchedule = useMemo(
    () => [...schedule].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    [schedule]
  );
  // One timestamp for this render keeps all date calculations internally consistent.
  const now = new Date();

  // Only future/today items belong in the dashboard.
  // startOfDay(now) keeps today's earlier events visible until tomorrow.
  const upcomingSchedule = useMemo(
    () => sortedSchedule.filter(item => new Date(item.startsAt).getTime() >= startOfDay(now).getTime()),
    [sortedSchedule]
  );
  const todaySchedule = useMemo(
    () => upcomingSchedule.filter(item => isSameDay(new Date(item.startsAt), now)),
    [upcomingSchedule]
  );
  // The next upcoming item drives the large "Next up" panel at the top.
  const nextItem = upcomingSchedule[0];
  const nextTone = nextItem ? typeTone(nextItem.type) : typeTone('event');

  // Preview the next couple of Nanny-style reminders so the parent can see when nudges would happen.
  const nextAlerts = nextItem ? previewNannyStyleAlerts(nextItem).filter(reminder => new Date(reminder.firesAt).getTime() >= Date.now()).slice(0, 2) : [];

  // Count items coming soon for the "7 days" dashboard stat.
  const nextSevenDays = upcomingSchedule.filter(item => {
    const start = new Date(item.startsAt).getTime();
    return start < Date.now() + 7 * 24 * 60 * 60 * 1000;
  });
  // The calendar strip does not need to regenerate unless the screen remounts.
  const calendarDays = useMemo(getCalendarDays, []);

  // For this prototype, actions default to the first child.
  // Future multi-child flows should expose explicit child selection before saving events.
  const firstChild = children[0];

  // Builds the readiness checklist from live vault data.
  // The checklist answers: do we have a profile, is today covered, are school details present,
  // and are medication details reviewed?
  const readinessItems = useMemo(() => {
    const items = [
      {
        id: 'profile',
        label: firstChild ? `${firstChild.displayName} profile available` : 'Create a child profile',
        detail: firstChild ? 'Emergency, medical, school, and contact details can be reviewed from Profiles.' : 'Add the child profile before relying on reminders.'
      },
      {
        id: 'today',
        label: todaySchedule.length ? `${todaySchedule.length} item${todaySchedule.length === 1 ? '' : 's'} scheduled today` : 'No schedule conflicts today',
        detail: todaySchedule.length ? todaySchedule.map(item => `${formatTime(new Date(item.startsAt))} ${item.title}`).join(' | ') : 'Add anything urgent with Quick add.'
      },
      {
        id: 'school',
        label: firstChild?.school ? 'School details ready' : 'Add school details',
        detail: firstChild?.school ? `${firstChild.school.schoolName}${firstChild.school.pickupInstructions ? ` | ${firstChild.school.pickupInstructions}` : ''}` : 'Save school, pickup, attendance, and calendar details.'
      },
      {
        id: 'meds',
        label: firstChild?.medical.medications.length ? 'Medication info reviewed' : 'No medications listed',
        detail: firstChild?.medical.medications.length ? firstChild.medical.medications.map(med => `${med.name}${med.scheduleText ? ` (${med.scheduleText})` : ''}`).join(' | ') : 'Add medication details if reminders are needed.'
      }
    ];
    return items.map(item => ({ ...item, id: readinessId(`${item.id}-${item.label}`) }));
  }, [firstChild, todaySchedule]);
  // Used to display the readiness completion score.
  const completedReadiness = readinessItems.filter(item => checkedReadiness[item.id]).length;

  // Looks up a child's display name for schedule cards.
  // If an event has no childId, it is treated as applying to all children.
  const childName = (childId?: string) => children.find(child => child.id === childId)?.displayName || 'All children';

  // Validates and saves the manual calendar form.
  // The store receives a clean ScheduleItem shape while local draft fields are cleared afterward.
  const addCalendarEvent = () => {
    const startsAt = parseEventDateTime(draftDate, draftTime);
    if (!draftTitle.trim()) {
      setDraftError('Add a title first.');
      return;
    }
    if (!startsAt) {
      setDraftError('Use date YYYY-MM-DD and time HH:MM.');
      return;
    }

    // Medication reminders need tighter timing, so they get an hour-before and 10-minute custom offset.
    // Other events get the broader day-before, morning-of, and hour-before reminder set.
    addScheduleItem({
      childId: children[0]?.id,
      type: draftType,
      title: draftTitle.trim(),
      startsAt,
      location: draftLocation.trim() || undefined,
      notes: draftNotes.trim() || undefined,
      notificationOffsets: draftType === 'medication' ? ['hour_before', { customMinutesBefore: 10 }] : ['day_before', 'day_of', 'hour_before']
    });
    setDraftTitle('');
    setDraftLocation('');
    setDraftNotes('');
    setDraftError('');
  };

  // Creates common family events without making the parent fill out the whole form.
  // Each quick action picks a sensible time relative to now and adds a short review note.
  const addQuickEvent = (type: ScheduleType, title: string, hoursFromNow: number, notes?: string) => {
    addScheduleItem({
      childId: children[0]?.id,
      type,
      title,
      startsAt: new Date(Date.now() + hoursFromNow * 60 * 60 * 1000).toISOString(),
      notes,
      notificationOffsets: type === 'medication' ? ['hour_before', { customMinutesBefore: 10 }] : ['day_before', 'day_of', 'hour_before']
    });
    setQuickStatus(`${title} added to the calendar.`);
  };

  // Schedules local device notifications for one reviewed item and reports what happened.
  const scheduleAlerts = async (itemId: string) => {
    const item = schedule.find(candidate => candidate.id === itemId);
    if (!item) return;
    const ids = await scheduleLocalAlerts(item);
    setAlertStatus(prev => ({
      ...prev,
      [itemId]: ids.length ? `${ids.length} alert${ids.length === 1 ? '' : 's'} scheduled on this device` : 'No future alerts to schedule'
    }));
  };

  // Removes an event with a two-step confirmation to avoid accidental data loss.
  // This is intentionally simple because schedule items are still demo/local state.
  const requestRemove = (item: ScheduleItem) => {
    if (pendingRemoveId === item.id) {
      removeScheduleItem(item.id);
      setPendingRemoveId(null);
      setQuickStatus(`${item.title} removed from the calendar.`);
      return;
    }
    setPendingRemoveId(item.id);
    setAlertStatus(prev => ({ ...prev, [item.id]: 'Tap Remove again to confirm.' }));
  };

  // Handles the quick reschedule buttons on each event card.
  // Moving a medication clears takenAt because the dose is no longer tied to the old time.
  const rescheduleItem = (item: ScheduleItem, mode: 'one_hour' | 'tomorrow_morning') => {
    const currentStart = new Date(item.startsAt);
    const nextStart = mode === 'one_hour'
      ? new Date(currentStart.getTime() + 60 * 60 * 1000)
      : (() => {
          // Tomorrow morning defaults to 9:00 AM because it is a broadly safe review time
          // for school/custody/admin tasks without implying a medical dose time.
          const tomorrow = startOfDay(new Date());
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(9, 0, 0, 0);
          return tomorrow;
        })();
    updateScheduleItem(item.id, { startsAt: nextStart.toISOString(), takenAt: undefined });
    setAlertStatus(prev => ({ ...prev, [item.id]: `${item.title} moved to ${formatDayLabel(nextStart)} at ${formatTime(nextStart)}.` }));
  };

  // Render order is intentionally dashboard-first:
  // 1. top summary and next-up event,
  // 2. today/readiness/quick-add utilities,
  // 3. rolling calendar strip,
  // 4. manual add form,
  // 5. detailed upcoming event cards,
  // 6. reminder-rule explainer and fallback draft button.
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Hero identifies the tab and shows how many child profiles exist in this vault. */}
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.eyebrow}>ParentVault Home</Text>
          <Text style={styles.title}>Child calendar</Text>
          <Text style={styles.subtitle}>Today, next handoff, medicine, school, and appointments at a glance.</Text>
        </View>
        <View style={[styles.childBadge, { backgroundColor: theme.primarySoft }]}>
          <Ionicons name="people-outline" size={18} color={theme.primary} />
          <Text style={[styles.childBadgeText, { color: theme.primary }]}>{children.length || 1}</Text>
        </View>
      </View>

      {/* Dashboard stats give a fast scan of today's load, near-term load, and custody-specific count. */}
      <View style={styles.statRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{todaySchedule.length}</Text>
          <Text style={styles.statLabel}>today</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{nextSevenDays.length}</Text>
          <Text style={styles.statLabel}>7 days</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{upcomingSchedule.filter(item => item.type === 'custody').length}</Text>
          <Text style={styles.statLabel}>custody</Text>
        </View>
      </View>

      {/* Color/type legend makes the calendar dots and card badges understandable. */}
      <View style={styles.legendRow}>
        {scheduleTypes.map(type => {
          const tone = typeTone(type);
          return (
            <View key={type} style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: theme.mode === 'dark' ? tone.darkSoft : tone.soft }]}>
                <Ionicons name={tone.icon} size={14} color={tone.color} />
              </View>
              <Text style={styles.legendText}>{typeLabel({ type } as ScheduleItem)}</Text>
            </View>
          );
        })}
      </View>

      {/* Next-up panel highlights the single most urgent upcoming item. */}
      <View style={[styles.nextPanel, { backgroundColor: theme.mode === 'dark' ? '#0b1220' : '#eff6ff', borderColor: theme.mode === 'dark' ? '#1d4ed8' : '#bfdbfe' }]}>
        <View style={[styles.nextIcon, { backgroundColor: theme.mode === 'dark' ? nextTone.darkSoft : nextTone.soft }]}>
          <Ionicons name={nextTone.icon} size={28} color={nextTone.color} />
        </View>
        <View style={styles.nextContent}>
          <Text style={styles.nextKicker}>Next up</Text>
          {nextItem ? (
            <>
              <Text style={styles.nextTitle}>{nextItem.title}</Text>
              <Text style={styles.nextTime}>{getRelativeDay(new Date(nextItem.startsAt))} - {formatDayLabel(new Date(nextItem.startsAt))} at {formatTime(new Date(nextItem.startsAt))}</Text>
              <Text style={styles.nextChild}>{typeLabel(nextItem)} for {childName(nextItem.childId)}</Text>
              {nextAlerts.length ? <Text style={styles.nextAlert}>Heads-up: {nextAlerts.map(reminder => formatTime(new Date(reminder.firesAt))).join(', ')}</Text> : null}
            </>
          ) : <Text style={styles.nextTime}>No upcoming items yet. Add a draft or import a document.</Text>}
        </View>
      </View>

      {/* Today card lists only items occurring on the current local calendar day. */}
      <Card>
        <Text style={styles.sectionLabel}>Today</Text>
        {todaySchedule.length ? todaySchedule.map(item => (
          <View key={item.id} style={styles.todayRow}>
            <View style={[styles.typeDot, { backgroundColor: typeTone(item.type).color }]} />
            <Text style={styles.todayTime}>{formatTime(new Date(item.startsAt))}</Text>
            <View style={styles.todayBody}>
              <Text style={styles.name}>{item.title}</Text>
              <Text style={styles.meta}>{typeLabel(item)} - {childName(item.childId)}</Text>
            </View>
          </View>
        )) : <Text style={styles.empty}>Nothing scheduled for today.</Text>}
      </Card>

      {/* Readiness card lets the parent manually check whether the day's basics are covered. */}
      <Card>
        <View style={styles.readinessHeader}>
          <View>
            <Text style={styles.sectionLabel}>Today readiness</Text>
            <Text style={styles.empty}>{completedReadiness} of {readinessItems.length} checked</Text>
          </View>
          <View style={[styles.readinessScore, { backgroundColor: completedReadiness === readinessItems.length ? '#15803d' : theme.primaryStrong }]}>
            <Text style={styles.readinessScoreText}>{Math.round((completedReadiness / readinessItems.length) * 100)}%</Text>
          </View>
        </View>
        {readinessItems.map(item => {
          const checked = Boolean(checkedReadiness[item.id]);
          return (
            <Pressable
              key={item.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              // Toggle just this row while preserving the other readiness checks.
              onPress={() => setCheckedReadiness(current => ({ ...current, [item.id]: !checked }))}
              style={[styles.readinessRow, { borderColor: checked ? theme.primary : theme.border, backgroundColor: checked ? theme.primarySoft : theme.card }]}
            >
              <View style={[styles.checkCircle, { backgroundColor: checked ? theme.primaryStrong : 'transparent', borderColor: checked ? theme.primaryStrong : theme.inputBorder }]}>
                {checked ? <Ionicons name="checkmark" size={15} color="#ffffff" /> : null}
              </View>
              <View style={styles.readinessText}>
                <Text style={[styles.readinessLabel, { color: checked ? theme.primary : theme.text }]}>{item.label}</Text>
                <Text style={styles.readinessDetail}>{item.detail}</Text>
              </View>
            </Pressable>
          );
        })}
      </Card>

      {/* Quick add creates common schedule items with one tap for repeated family workflows. */}
      <Card>
        <Text style={styles.sectionLabel}>Quick add</Text>
        <Text style={styles.empty}>Common family tasks with sensible reminder timing.</Text>
        <View style={styles.quickGrid}>
          <PrimaryButton tone="quiet" onPress={() => addQuickEvent('custody', 'Custody pickup', 24, 'Confirm location and who is picking up.')}>Custody pickup</PrimaryButton>
          <PrimaryButton tone="quiet" onPress={() => addQuickEvent('medication', 'Medication dose', 1, 'Confirm dose and instructions before relying on this reminder.')}>Medication dose</PrimaryButton>
          <PrimaryButton tone="quiet" onPress={() => addQuickEvent('school', 'Pack school bag', 12, 'Check folder, water bottle, lunch, and required forms.')}>Pack school bag</PrimaryButton>
        </View>
        {quickStatus ? <Text style={styles.status}>{quickStatus}</Text> : null}
      </Card>

      {/* Rolling 14-day calendar strip. Each tile shows event count plus up to three color dots. */}
      <View style={styles.calendarGrid}>
        {calendarDays.map(date => {
          const itemsForDay = upcomingSchedule.filter(item => isSameDay(new Date(item.startsAt), date));
          const isToday = isSameDay(date, now);
          // The first item for a day determines the tile border color; dots still show mixed event types.
          const primaryTone = itemsForDay[0] ? typeTone(itemsForDay[0].type) : undefined;
          return (
            <View
              key={dayKey(date)}
              style={[
                styles.dayTile,
                primaryTone ? { borderColor: primaryTone.color, borderTopWidth: 4 } : null,
                isToday ? styles.todayTile : null
              ]}
            >
              <Text style={[styles.dayName, isToday ? styles.todayTileText : null]}>{date.toLocaleDateString(undefined, { weekday: 'short' })}</Text>
              <Text style={[styles.dayNumber, isToday ? styles.todayTileText : null]}>{date.getDate()}</Text>
              <View style={styles.dayDots}>
                {itemsForDay.slice(0, 3).map(item => <View key={item.id} style={[styles.dayDot, { backgroundColor: isToday ? '#ffffff' : typeTone(item.type).color }]} />)}
              </View>
              <Text style={[styles.dayCount, isToday ? styles.todayTileText : null]}>{itemsForDay.length ? `${itemsForDay.length}` : 'Clear'}</Text>
            </View>
          );
        })}
      </View>

      {/* Manual add form for custom events that do not fit the quick-add presets. */}
      <Card>
        <Text style={styles.sectionLabel}>Add to calendar</Text>
        <ThemedTextInput
          value={draftTitle}
          onChangeText={setDraftTitle}
          placeholder="Event title"
          style={styles.input}
        />
        <View style={styles.typePicker}>
          {scheduleTypes.map(type => {
            // Each type chip updates both the saved event type and the visual reminder color.
            const selected = draftType === type;
            const tone = typeTone(type);
            return (
              <Pressable
                key={type}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setDraftType(type)}
                style={[styles.typeChoice, { borderColor: selected ? tone.color : theme.border, backgroundColor: selected ? (theme.mode === 'dark' ? tone.darkSoft : tone.soft) : theme.card }]}
              >
                <Ionicons name={tone.icon} size={15} color={selected ? tone.color : theme.subtle} />
                <Text style={[styles.typeChoiceText, { color: selected ? tone.color : theme.muted }]}>{typeLabel({ type } as ScheduleItem)}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.formRow}>
          <ThemedTextInput
            value={draftDate}
            onChangeText={setDraftDate}
            placeholder="YYYY-MM-DD"
            style={[styles.input, styles.formHalf]}
          />
          <ThemedTextInput
            value={draftTime}
            onChangeText={setDraftTime}
            placeholder="HH:MM"
            style={[styles.input, styles.formHalf]}
          />
        </View>
        <ThemedTextInput
          value={draftLocation}
          onChangeText={setDraftLocation}
          placeholder="Location, pickup spot, or school"
          style={styles.input}
        />
        <ThemedTextInput
          value={draftNotes}
          onChangeText={setDraftNotes}
          placeholder="Notes"
          multiline
          style={[styles.input, styles.notesInput]}
        />
        {draftError ? <Text style={styles.error}>{draftError}</Text> : null}
        <PrimaryButton onPress={addCalendarEvent}>Add calendar event</PrimaryButton>
      </Card>

      {/* Empty state appears only when there are no current/future schedule items. */}
      {upcomingSchedule.length === 0 ? <Card><Text style={styles.empty}>No upcoming schedule items yet. Add an event draft or import a school/custody document.</Text></Card> : null}

      {/* Detailed cards for every current/future schedule item. */}
      {upcomingSchedule.map(item => (
        <Card key={item.id}>
          {/* Top row pairs a colored date badge with the event title, child, type, and confidence label. */}
          <View style={styles.eventCardTop}>
            <View style={[styles.eventDateBadge, { backgroundColor: theme.mode === 'dark' ? typeTone(item.type).darkSoft : typeTone(item.type).soft }]}>
              <Text style={[styles.eventDateMonth, { color: typeTone(item.type).color }]}>{new Date(item.startsAt).toLocaleDateString(undefined, { month: 'short' })}</Text>
              <Text style={[styles.eventDateDay, { color: typeTone(item.type).color }]}>{new Date(item.startsAt).getDate()}</Text>
            </View>
            <View style={styles.eventCardBody}>
              <View style={styles.row}>
                <View style={[styles.pill, { backgroundColor: theme.mode === 'dark' ? typeTone(item.type).darkSoft : typeTone(item.type).soft }]}>
                  <Ionicons name={typeTone(item.type).icon} size={14} color={typeTone(item.type).color} />
                  <Text style={[styles.type, { color: typeTone(item.type).color }]}>{typeLabel(item)}</Text>
                </View>
                <Text style={styles.confidence}>{item.confidence ? `${Math.round(item.confidence * 100)}% reviewed` : 'manual'}</Text>
              </View>
              <Text style={styles.name}>{item.title}</Text>
              <Text style={styles.meta}>{childName(item.childId)}</Text>
              <Text style={styles.dateLine}>{formatDayLabel(new Date(item.startsAt))} at {formatTime(new Date(item.startsAt))}</Text>
            </View>
          </View>
          {item.location ? <Text>{item.location}</Text> : null}
          {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
          <Text style={styles.alerts}>Saved alerts: {item.notificationOffsets.map(formatOffset).join(', ')}</Text>
          <Text style={styles.alerts}>Smart reminder preview: {previewNannyStyleAlerts(item).map(reminder => `${reminder.kind} ${new Date(reminder.firesAt).toLocaleString()}`).join(' - ') || 'none in future'}</Text>
          <View style={styles.actionGrid}>
            <PrimaryButton tone="quiet" onPress={() => rescheduleItem(item, 'one_hour')}>Move +1 hour</PrimaryButton>
            <PrimaryButton tone="quiet" onPress={() => rescheduleItem(item, 'tomorrow_morning')}>Move to tomorrow</PrimaryButton>
          </View>
          {/* Medication events can be marked taken; other event types skip this action. */}
          {item.type === 'medication' ? (
            item.takenAt ? <Text style={styles.taken}>Taken at {new Date(item.takenAt).toLocaleTimeString()}</Text> : <PrimaryButton onPress={() => markMedicationTaken(item.id)}>Mark as taken</PrimaryButton>
          ) : null}
          <PrimaryButton tone="quiet" onPress={() => scheduleAlerts(item.id)}>Schedule local alerts</PrimaryButton>
          {/* Delete uses a two-tap confirmation and switches to danger styling once armed. */}
          <PrimaryButton tone={pendingRemoveId === item.id ? 'danger' : 'quiet'} onPress={() => requestRemove(item)}>
            {pendingRemoveId === item.id ? 'Confirm remove' : 'Remove from calendar'}
          </PrimaryButton>
          {alertStatus[item.id] ? <Text style={styles.status}>{alertStatus[item.id]}</Text> : null}
        </Card>
      ))}
      {/* Reminder-rule explainer shows the default reminder logic behind the preview text above. */}
      <Card>
        <Text style={styles.sectionLabel}>Nanny-style reminder rules</Text>
        <Text style={styles.ruleText}>Day-before 7:00 PM. Day-of 7:00 AM, or 4:57 AM for early events. One hour before event start.</Text>
        <Text style={styles.ruleText}>Pickup reminders: 3:45 PM on school days, 5:45 PM on no-school days. Journal prompt: 8:45 PM.</Text>
        <Text style={styles.status}>Standing reminder previews: {previewNannyStandingReminders().map(r => `${r.title} ${new Date(r.firesAt).toLocaleString()}`).join(' - ')}</Text>
      </Card>
      {/* Fallback draft button for quickly seeding an event and editing it later. */}
      <PrimaryButton onPress={() => addScheduleItem({
        childId: children[0]?.id,
        type: 'event',
        title: 'New event draft',
        startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        notificationOffsets: ['day_before', 'day_of', 'hour_before']
      })}>Add event draft</PrimaryButton>
    </ScrollView>
  );
}

// Screen-specific styles for the Schedule tab only.
// Styles are grouped roughly in the same order as the JSX above so future edits are easier to trace.
const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  // Overall scroll padding.
  container: { padding: 20, paddingBottom: 32 },

  // Hero/header layout.
  hero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  heroText: { flex: 1 },
  eyebrow: { color: theme.primary, fontWeight: '800', textTransform: 'uppercase', fontSize: 12, marginBottom: 4 },
  title: { fontSize: 30, fontWeight: '800', color: theme.text },
  subtitle: { color: theme.muted, marginBottom: 16 },
  childBadge: { minWidth: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  childBadgeText: { fontSize: 12, fontWeight: '900', marginTop: 1 },

  // Summary stat cards.
  statRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBox: { flex: 1, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card, borderRadius: 14, padding: 12 },
  statNumber: { color: theme.text, fontSize: 22, fontWeight: '900' },
  statLabel: { color: theme.subtle, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },

  // Event type legend.
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 },
  legendIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  legendText: { color: theme.muted, fontSize: 12, fontWeight: '800' },

  // Next-up feature panel.
  nextPanel: { borderWidth: 1, borderRadius: 18, padding: 16, flexDirection: 'row', gap: 14, marginBottom: 12 },
  nextIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  nextContent: { flex: 1 },
  nextKicker: { color: theme.primary, fontWeight: '900', fontSize: 12, textTransform: 'uppercase' },
  nextTitle: { color: theme.text, fontSize: 22, lineHeight: 27, fontWeight: '900', marginTop: 3 },
  nextTime: { color: theme.text, fontWeight: '800', marginTop: 6 },
  nextChild: { color: theme.muted, marginTop: 3 },
  nextAlert: { color: theme.primary, fontWeight: '800', marginTop: 8 },

  // Shared text and today's list.
  sectionLabel: { color: theme.primary, fontWeight: '800', fontSize: 13, textTransform: 'uppercase', marginBottom: 6 },
  empty: { color: theme.muted },
  todayRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: theme.border },
  typeDot: { width: 8, height: 8, borderRadius: 4 },
  todayTime: { color: theme.primary, fontWeight: '800', minWidth: 72 },
  todayBody: { flex: 1 },

  // Readiness checklist.
  readinessHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  readinessScore: { width: 48, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  readinessScoreText: { color: '#ffffff', fontWeight: '900' },
  readinessRow: { flexDirection: 'row', gap: 10, borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 8 },
  checkCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  readinessText: { flex: 1 },
  readinessLabel: { fontWeight: '900' },
  readinessDetail: { color: theme.muted, marginTop: 2 },

  // Quick-add and 14-day calendar strip.
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  quickGrid: { gap: 4, marginTop: 8 },
  dayTile: { width: '23%', minHeight: 84, borderRadius: 12, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card, padding: 10, justifyContent: 'space-between' },
  todayTile: { backgroundColor: theme.primaryStrong, borderColor: theme.primaryStrong },
  todayTileText: { color: '#ffffff' },
  dayName: { color: theme.subtle, fontWeight: '800', fontSize: 12 },
  dayNumber: { color: theme.text, fontSize: 22, fontWeight: '800' },
  dayDots: { flexDirection: 'row', gap: 4, minHeight: 8 },
  dayDot: { width: 8, height: 8, borderRadius: 4 },
  dayCount: { color: theme.muted, fontSize: 11, fontWeight: '700' },

  // Add-event form controls.
  typePicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 4 },
  typeChoice: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  typeChoiceText: { fontSize: 12, fontWeight: '900', textTransform: 'capitalize' },
  formRow: { flexDirection: 'row', gap: 8 },
  formHalf: { flex: 1 },
  input: { minHeight: 44 },
  notesInput: { minHeight: 78, textAlignVertical: 'top' },
  error: { color: theme.warning, fontWeight: '800', marginTop: 8 },

  // Upcoming event cards.
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  actionGrid: { gap: 4, marginTop: 8 },
  eventCardTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  eventDateBadge: { width: 54, minHeight: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  eventDateMonth: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  eventDateDay: { fontSize: 23, fontWeight: '900', marginTop: 1 },
  eventCardBody: { flex: 1 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  type: { fontWeight: '900', fontSize: 12 },
  confidence: { color: theme.subtle, fontSize: 12 },
  name: { fontSize: 19, fontWeight: '800', marginTop: 4, color: theme.text },
  meta: { color: theme.subtle, marginBottom: 4 },
  nextMeta: { color: theme.text, fontWeight: '700', marginTop: 6 },
  dateLine: { color: theme.text, fontWeight: '700' },
  notes: { color: theme.muted, marginTop: 8 },
  alerts: { color: theme.muted, marginTop: 8 },
  ruleText: { color: theme.muted, marginTop: 4 },
  taken: { color: '#15803d', fontWeight: '800', marginTop: 8 },

  // Generic status/confirmation text.
  status: { color: theme.primary, fontWeight: '700', marginTop: 8 }
});
