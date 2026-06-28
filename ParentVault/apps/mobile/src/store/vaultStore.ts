/**
 * PARENTVAULT-COMMENTARY
 *
 * Central Zustand store holding demo child profiles, schedules, journal entries, onboarding state, theme mode, and command handlers.
 *
 * This is currently in-memory/demo state used to make the prototype interactive.
 *
 * Do not treat this as secure persistence; production must move sensitive data through encrypted storage/backend adapters.
 *
 * Reading guide:
 * - Comments in this project explain product intent, privacy/security boundaries, and why a flow exists.
 * - They are deliberately more detailed than normal production comments because this prototype is being shared for learning, review, and handoff.
 * - If code and comments ever disagree, fix both together; stale privacy/security comments are dangerous.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { summarizeChildVaultGaps, type ChildProfile, type JournalEntry, type RagAnswer, type ScheduleItem, type SchoolInfo } from '@parentvault/shared';
import { answerFromKnowledge, buildKnowledgeSources } from '../services/knowledge';

// Consistent timestamp helper for records that need created/updated timing.
const now = () => new Date().toISOString();

// Lightweight demo id generator.
// Production should use stable server/client-safe ids instead of Math.random.
const id = () => Math.random().toString(36).slice(2, 10);

// AsyncStorage keys for small app-level preferences.
// These are not used for sensitive child data.
const ONBOARDING_COMPLETE_KEY = 'parentvault:onboardingComplete';
const THEME_MODE_KEY = 'parentvault:themeMode';
type ThemeMode = 'dark' | 'light';

// Shape of the shared vault store.
// Screens read state from this interface and call these actions instead of mutating arrays directly.
export interface VaultState {
  children: ChildProfile[];
  schedule: ScheduleItem[];
  journal: JournalEntry[];
  onboardingLoaded: boolean;
  onboardingCompleted: boolean;
  themeMode: ThemeMode;
  addChild: (child: Omit<ChildProfile, 'id' | 'updatedAt'>) => void;
  updateChild: (childId: string, patch: Partial<Omit<ChildProfile, 'id' | 'updatedAt'>>) => void;
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  updateScheduleItem: (scheduleItemId: string, patch: Partial<Omit<ScheduleItem, 'id'>>) => void;
  removeScheduleItem: (scheduleItemId: string) => void;
  updateChildSchool: (childId: string, school: SchoolInfo) => void;
  markMedicationTaken: (scheduleItemId: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  loadOnboardingStatus: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  restartOnboarding: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  askVault: (question: string) => RagAnswer;
  applyChatText: (text: string) => string;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  onboardingLoaded: false,
  onboardingCompleted: false,
  themeMode: 'dark',
  // Demo child profile used to make the prototype feel alive without requiring setup first.
  // This is sample data only; production must replace it with real encrypted/persisted records.
  children: [
    {
      id: 'demo-child',
      displayName: 'Sample Child',
      legalName: 'Sample Grace Child',
      preferredName: 'Sam',
      birthdate: '2018-03-12',
      ssnLast4: '1234',
      medical: {
        allergies: ['Peanuts'],
        conditions: ['Seasonal asthma'],
        dietaryRestrictions: ['No peanuts or peanut oil'],
        sensoryNeeds: [],
        careInstructions: 'Keep rescue inhaler available during sports or heavy outdoor activity.',
        medications: [
          {
            id: 'demo-med',
            name: 'Amoxicillin',
            dosage: '5 mL',
            route: 'oral',
            instructions: 'Take with food',
            scheduleText: '8 AM and 8 PM',
            active: true,
            prescribingProviderId: 'provider-pediatrician',
            pharmacyProviderId: 'provider-pharmacy',
            refillInstructions: 'Call pharmacy or use portal 3 days before supply runs out.',
            refillRemainingCount: 1,
            lastFilledAt: '2026-05-01',
            nextRefillDueAt: '2026-05-15',
            sideEffectsToWatch: ['rash', 'stomach upset']
          }
        ]
      },
      careProviders: [
        {
          id: 'provider-pediatrician',
          type: 'pediatrician',
          personName: 'Dr. Elena Rivera',
          role: 'Primary pediatrician',
          organizationName: 'Riverbend Pediatrics',
          phone: '(555) 123-0199',
          afterHoursPhone: '(555) 123-0100',
          email: 'frontdesk@riverbend.example',
          portalUrl: 'https://portal.riverbend.example',
          address: { line1: '125 Wellness Way', city: 'Lebanon', state: 'TN', postalCode: '37087' },
          officeHours: 'Mon-Fri 8:00 AM-5:00 PM',
          notes: 'Ask for nurse line for medication questions.',
          isPrimary: true,
          updatedAt: now()
        },
        {
          id: 'provider-dentist',
          type: 'dentist',
          personName: 'Dr. Marcus Lee',
          organizationName: 'Smile Grove Dental',
          phone: '(555) 810-2400',
          address: { line1: '44 Cedar Pike', city: 'Lebanon', state: 'TN', postalCode: '37087' },
          updatedAt: now()
        },
        {
          id: 'provider-pharmacy',
          type: 'pharmacy',
          personName: 'Pharmacist on duty',
          organizationName: 'Family Care Pharmacy',
          phone: '(555) 777-2222',
          portalUrl: 'https://pharmacy.example/refills',
          address: { line1: '900 Main St', city: 'Lebanon', state: 'TN', postalCode: '37087' },
          officeHours: 'Mon-Fri 9:00 AM-7:00 PM; Sat 10:00 AM-3:00 PM',
          acceptsElectronicPrescriptions: true,
          preferredForRefills: true,
          notes: 'Preferred pharmacy for child prescriptions and refills.',
          updatedAt: now()
        }
      ],
      contacts: [
        { id: 'demo-contact', name: 'Maya Johnson', relationship: 'Grandparent', phone: '(555) 456-1111', allowedPickup: true }
      ],
      insurance: [
        {
          id: 'insurance-1',
          providerName: 'Example Health',
          planName: 'Family PPO',
          policyHolderName: 'Parent/guardian on file',
          relationshipToChild: 'Parent',
          phone: '(555) 222-9090',
          nurseLinePhone: '(555) 222-9191',
          pharmacyBenefitsPhone: '(555) 222-9292',
          portalUrl: 'https://insurance.example',
          copayNotes: 'Check card/portal for current copays.',
          priorAuthorizationNotes: 'Some specialist meds may require prior authorization.',
          notes: 'Member ID, group number, Rx BIN/PCN/group encrypted in production.'
        }
      ],
      school: {
        id: 'school-1',
        schoolName: 'Maple Ridge Elementary',
        districtName: 'Example County Schools',
        grade: '2nd',
        teacherName: 'Ms. Carter',
        mainPhone: '(555) 600-1212',
        attendancePhone: '(555) 600-1213',
        websiteUrl: 'https://school.example',
        calendarUrl: 'https://school.example/calendar',
        address: { line1: '10 Schoolhouse Rd', city: 'Lebanon', state: 'TN', postalCode: '37087' },
        officeHours: 'Mon-Fri 7:30 AM-3:30 PM',
        schoolHours: '8:00 AM-2:45 PM',
        pickupInstructions: 'Use west entrance car line. ID required.',
        busInfo: 'Bus 14, afternoon dropoff approx. 3:42 PM.',
        calendarDates: [
          { id: 'school-date-1', type: 'no_school', title: 'Teacher workday', startsAt: '2026-09-07T08:00:00.000Z', noSchool: true, confidence: 1, notes: 'Saved school calendar date.' }
        ],
        enrichmentSources: ['School profile']
      },
      legalCustody: {
        id: 'custody-1',
        court: 'Example County Court',
        decreeDate: '2025-06-01',
        custodySummary: 'Review the custody order before relying on this summary.',
        exchangeRules: 'Add verified exchange times, locations, and exception rules.',
        holidayRules: 'Add verified holiday and school-break custody rules.',
        sourceDocumentIds: []
      },
      updatedAt: now()
    }
  ],
  // Initial demo schedule item so the Calendar screen has something useful to render on first launch.
  schedule: [
    {
      id: 'demo-med-dose',
      childId: 'demo-child',
      type: 'medication',
      title: 'Amoxicillin dose',
      startsAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      medicationId: 'demo-med',
      notificationOffsets: ['hour_before', { customMinutesBefore: 10 }]
    }
  ],
  journal: [],
  // Adds a child profile and stamps app-owned fields that callers should not provide.
  addChild: child => set(state => ({ children: [...state.children, { ...child, id: id(), updatedAt: now() }] })),

  // Merges profile edits into a child and refreshes updatedAt for audit/display purposes.
  updateChild: (childId, patch) => set(state => ({
    children: state.children.map(child => child.id === childId ? { ...child, ...patch, updatedAt: now() } : child)
  })),

  // Appends a new calendar/schedule item.
  // The caller provides the event content; the store assigns the local id.
  addScheduleItem: item => set(state => ({ schedule: [...state.schedule, { ...item, id: id() }] })),

  // Updates an existing schedule item by id.
  // Used by quick reschedule actions to move an event without recreating it.
  updateScheduleItem: (scheduleItemId, patch) => set(state => ({
    schedule: state.schedule.map(item => item.id === scheduleItemId ? { ...item, ...patch } : item)
  })),

  // Removes a schedule item by id.
  // The Schedule screen protects this action with a two-tap confirmation.
  removeScheduleItem: scheduleItemId => set(state => ({
    schedule: state.schedule.filter(item => item.id !== scheduleItemId)
  })),

  // Replaces the school info block for a child profile.
  updateChildSchool: (childId, school) => set(state => ({
    children: state.children.map(child => child.id === childId ? { ...child, school, updatedAt: now() } : child)
  })),

  // Marks a medication schedule item as taken by recording the current timestamp.
  markMedicationTaken: scheduleItemId => set(state => ({
    schedule: state.schedule.map(item => item.id === scheduleItemId ? { ...item, takenAt: now() } : item)
  })),

  // Adds a journal entry with a generated id.
  addJournalEntry: entry => set(state => ({ journal: [...state.journal, { ...entry, id: id() }] })),

  // Loads small app preferences from AsyncStorage.
  // Child/profile/schedule data is not being loaded here yet; this is prototype preference state only.
  loadOnboardingStatus: async () => {
    const [saved, savedThemeMode] = await Promise.all([
      AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY),
      AsyncStorage.getItem(THEME_MODE_KEY)
    ]);
    set({
      onboardingLoaded: true,
      onboardingCompleted: saved === 'true',
      themeMode: savedThemeMode === 'light' ? 'light' : 'dark'
    });
  },
  // Persists that the first-run onboarding has been completed.
  completeOnboarding: async () => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    set({ onboardingLoaded: true, onboardingCompleted: true });
  },
  // Clears the onboarding flag so the setup guide can be shown again.
  restartOnboarding: async () => {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    set({ onboardingLoaded: true, onboardingCompleted: false });
  },
  // Saves and applies the user's light/dark preference.
  setThemeMode: async mode => {
    await AsyncStorage.setItem(THEME_MODE_KEY, mode);
    set({ themeMode: mode });
  },
  // Answers a question from the current in-memory vault data using the local knowledge service.
  askVault: question => {
    const state = get();
    return answerFromKnowledge(question, buildKnowledgeSources(state.children, state.schedule, state.journal));
  },
  // Lightweight command handler behind the chat screen.
  // It decides whether text should become a schedule item, journal note, or vault question.
  applyChatText: text => {
    const lower = text.toLowerCase();
    const firstChild = get().children[0];

    // Profile-completion questions produce a missing-details checklist instead of saving a note.
    if (lower.includes('what am i missing') || lower.includes('what details') || lower.includes('complete profile') || lower.includes('help me fill') || lower.includes('what should i add')) {
      return firstChild ? `Here's what I'd collect next so the vault is actually useful:\n${summarizeChildVaultGaps(firstChild)}` : 'Add a child profile first, then I can walk you through the missing details.';
    }

    // Search-style questions are answered from saved profile/schedule/journal knowledge sources.
    if (/^(who|what|where|when|which|show|tell|give|find)\b/i.test(text) || lower.includes('doctor') || lower.includes('phone number') || lower.includes('insurance') || lower.includes('pharmacy') || lower.includes('fill') || lower.includes('refill')) {
      const answer = get().askVault(text);
      const sourceList = answer.sources.slice(0, 3).map(source => `- ${source.title}`).join('\n');
      return `${answer.answer}${sourceList ? `\n\nSources:\n${sourceList}` : ''}`;
    }

    // Medication-like text creates a draft medication reminder for review.
    if (lower.includes('med') || lower.includes('medicine') || lower.includes('dose')) {
      get().addScheduleItem({
        childId: firstChild?.id,
        type: 'medication',
        title: text.replace(/^add\s*/i, '') || 'Medication reminder',
        startsAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        notificationOffsets: ['hour_before', { customMinutesBefore: 10 }],
        source: 'text',
        confidence: 0.65,
        notes: 'Created from chat. Review exact time/dosage before relying on this reminder.'
      });
      return 'I drafted a medication reminder one hour from now. Review the time/dosage before relying on it.';
    }

    // Custody/pickup/dropoff text creates a custody schedule draft for tomorrow.
    if (lower.includes('custody') || lower.includes('pickup') || lower.includes('dropoff')) {
      get().addScheduleItem({
        childId: firstChild?.id,
        type: 'custody',
        title: text.replace(/^add\s*/i, '') || 'Custody event',
        startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        notificationOffsets: ['day_before', 'hour_before'],
        source: 'text',
        confidence: 0.7,
        notes: 'Created from chat. Confirm dates/times from the source document.'
      });
      return 'I drafted a custody schedule item for tomorrow with day-before and hour-before alerts.';
    }

    // Everything else becomes a journal note so the information is not lost.
    const createdAt = now();
    get().addJournalEntry({
      childId: firstChild?.id,
      type: 'general',
      occurredAt: createdAt,
      occurredAtPrecision: 'exact',
      title: 'Chat note',
      notes: text,
      attachments: [],
      tags: ['chat'],
      audit: {
        createdAt,
        updatedAt: createdAt,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        entryOrder: get().journal.length + 1,
        userSuppliedOccurredAt: false,
        source: 'manual'
      }
    });
    return 'I saved that as a journal note. If it should be a schedule item, mention pickup, custody, school, event, or medication.';
  }
}));
