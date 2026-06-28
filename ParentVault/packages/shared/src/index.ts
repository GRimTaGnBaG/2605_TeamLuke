/**
 * PARENTVAULT-COMMENTARY
 *
 * Shared domain model exports for child profiles, providers, schedules, journals, imports, schools, custody, insurance, privacy, and AI results.
 *
 * This package is the contract between mobile, API, and future backend implementations.
 *
 * Be careful changing field names because multiple app layers depend on this schema.
 *
 * Reading guide:
 * - Comments in this project explain product intent, privacy/security boundaries, and why a flow exists.
 * - They are deliberately more detailed than normal production comments because this prototype is being shared for learning, review, and handoff.
 * - If code and comments ever disagree, fix both together; stale privacy/security comments are dangerous.
 */

// Base identifier type used across the shared schema.
export type ID = string;

// Schedule categories drive colors, reminders, import classification, and UI grouping.
export type ScheduleType = 'custody' | 'school' | 'event' | 'medication' | 'appointment';
// Import sources identify where a proposed record came from before the parent reviews it.
export type ImportSourceType = 'image' | 'pdf' | 'calendar' | 'decree' | 'flyer' | 'screenshot' | 'voice' | 'text';
// Reminder offsets can be standard named timing rules or an exact custom number of minutes.
export type NotificationOffset = 'day_before' | 'day_of' | 'hour_before' | { customMinutesBefore: number };
// Provider/contact categories keep care, school, pharmacy, legal, and insurance records searchable.
export type ProviderType = 'pediatrician' | 'doctor' | 'dentist' | 'specialist' | 'therapist' | 'pharmacy' | 'school' | 'childcare' | 'insurance' | 'legal' | 'other';
// School calendar date types separate holidays, no-school days, early releases, and other school events.
export type SchoolDateType = 'first_day' | 'last_day' | 'holiday' | 'break' | 'teacher_workday' | 'early_release' | 'no_school' | 'exam' | 'registration' | 'other';
// Account security option types used by the settings/security model.
export type SecondFactorMethod = 'totp' | 'sms' | 'email' | 'passkey' | 'recovery_code';
export type LocalUnlockMethod = 'biometric' | 'device_passcode' | 'app_pin';
// Feature flags let ParentVault run in minimal schedule-only mode or full vault mode.
export type ParentVaultFeature = 'schedule_reminders' | 'child_profile' | 'medical' | 'providers' | 'insurance' | 'school' | 'custody_legal' | 'journal' | 'media_attachments' | 'ai_imports' | 'web_enrichment';
// Journal taxonomy supports filtering and export for medical, custody, school, and general notes.
export type JournalEntryType = 'general' | 'medical' | 'custody' | 'school' | 'communication' | 'behavior' | 'expense' | 'appointment' | 'medication' | 'other';
// Attachment capture method records how a journal/import file entered the vault.
export type AttachmentCaptureMethod = 'camera' | 'photo_library' | 'screenshot_import' | 'document_picker' | 'share_sheet' | 'manual';
// Export formats are the planned output package types for journal/evidence sharing.
export type ExportFormat = 'pdf' | 'zip' | 'json' | 'csv';
// Reminder kinds describe why a reminder exists, not just when it fires.
export type ReminderKind = 'day_before' | 'morning_of' | 'hour_before' | 'pickup_school_day' | 'pickup_no_school_day' | 'therapy_transport' | 'therapy_hour_before' | 'medication_due' | 'journal_prompt' | 'monthly_calendar_setup' | 'custom';
export type ReminderDeliveryChannel = 'local_push' | 'email' | 'sms' | 'in_app';

// Encryption scopes describe which category of sensitive data an encrypted value belongs to.
export type EncryptionScope = 'identity' | 'medical' | 'insurance' | 'legal' | 'journal' | 'media' | 'import' | 'general';

// Metadata wrapper for encrypted fields that must not be stored as plaintext.
export interface EncryptedValue {
  ciphertext: string;
  algorithm: 'xchacha20-poly1305' | 'aes-256-gcm';
  keyId: string;
  nonce: string;
  scope: EncryptionScope;
  createdAt: string;
}

// Marker for values that may exist only temporarily in memory while being entered or encrypted.
export interface SensitivePlaintext<T = string> {
  value: T;
  warning: 'plaintext_runtime_only_never_persist';
}

// User-controlled privacy mode and feature-consent settings.
export interface PrivacyFeatureSettings {
  accountId: ID;
  enabledFeatures: ParentVaultFeature[];
  declinedFeatures: ParentVaultFeature[];
  allowOptionalProfilePrompts: boolean;
  allowWebEnrichment: boolean;
  allowAiImports: boolean;
  minimalMode: boolean;
  updatedAt: string;
}

// Account/device security settings for unlock and second-factor requirements.
export interface AuthSecuritySettings {
  accountId: ID;
  twoFactorRequired: boolean;
  enabledSecondFactors: SecondFactorMethod[];
  preferredSecondFactor?: SecondFactorMethod;
  localUnlockRequired: boolean;
  localUnlockMethods: LocalUnlockMethod[];
  trustedDeviceIds: ID[];
  recoveryCodesRemaining: number;
  lastSecurityReviewAt?: string;
}

// Runtime challenge model for a second-factor verification attempt.
export interface TwoFactorChallenge {
  id: ID;
  method: SecondFactorMethod;
  deliveryHint?: string;
  expiresAt: string;
  verifiedAt?: string;
}

// Postal address shared by providers, schools, contacts, and other entities.
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

// Doctor, dentist, therapist, pharmacy, school, legal, or other provider contact.
export interface CareProvider {
  id: ID;
  type: ProviderType;
  organizationName?: string;
  personName: string;
  role?: string;
  phone?: string;
  afterHoursPhone?: string;
  email?: string;
  portalUrl?: string;
  address?: Address;
  officeHours?: string;
  notes?: string;
  isPrimary?: boolean;
  acceptsElectronicPrescriptions?: boolean;
  preferredForRefills?: boolean;
  updatedAt: string;
}

// Insurance plan/card metadata. Sensitive member/group fields are encrypted-value fields.
export interface InsuranceInfo {
  id: ID;
  providerName: string;
  planName?: string;
  policyHolderName?: string;
  relationshipToChild?: string;
  memberIdEncrypted?: EncryptedValue;
  groupNumberEncrypted?: EncryptedValue;
  rxBinEncrypted?: EncryptedValue;
  rxPcnEncrypted?: EncryptedValue;
  rxGroupEncrypted?: EncryptedValue;
  phone?: string;
  nurseLinePhone?: string;
  pharmacyBenefitsPhone?: string;
  portalUrl?: string;
  cardFrontUri?: string;
  cardBackUri?: string;
  copayNotes?: string;
  priorAuthorizationNotes?: string;
  notes?: string;
}

// Reusable notification rule that produces planned reminders.
export interface ReminderRule {
  id: ID;
  kind: ReminderKind;
  enabled: boolean;
  localTime?: string;
  minutesBefore?: number;
  messageTemplate: string;
  deliveryChannels: ReminderDeliveryChannel[];
}

// Notification preference bundle for default, pickup, therapy, journal, and monthly planning reminders.
export interface NotificationPreferences {
  accountId: ID;
  timezone: string;
  quietHours?: { startLocalTime: string; endLocalTime: string };
  genericLockScreenText: boolean;
  defaultRules: ReminderRule[];
  pickupRules: {
    schoolDayLocalTime: string;
    noSchoolLocalTime: string;
    dayOfEarlyLocalTime: string;
  };
  therapyRules: {
    morningPlanningLocalTime: string;
    hourBeforeMinutes: number;
    onlyWhenParentHasChild: boolean;
  };
  journalPrompt?: {
    enabled: boolean;
    localTime: string;
    messageTemplate: string;
  };
  monthlyCalendarSetup?: {
    enabled: boolean;
    dayOfMonth: number;
    localTime: string;
  };
}

// Concrete reminder generated from a schedule item or standing reminder rule.
export interface PlannedReminder {
  id: ID;
  scheduleItemId?: ID;
  kind: ReminderKind;
  firesAt: string;
  title: string;
  body: string;
  deliveryChannels: ReminderDeliveryChannel[];
  timezone: string;
}

// Individual date from a school calendar such as no-school days, breaks, or early releases.
export interface SchoolCalendarDate {
  id: ID;
  type: SchoolDateType;
  title: string;
  startsAt: string;
  endsAt?: string;
  noSchool: boolean;
  sourceUrl?: string;
  confidence?: number;
  notes?: string;
}

// School profile details used for pickups, attendance, calendar enrichment, and school contacts.
export interface SchoolInfo {
  id: ID;
  schoolName: string;
  districtName?: string;
  grade?: string;
  teacherName?: string;
  mainPhone?: string;
  attendancePhone?: string;
  websiteUrl?: string;
  calendarUrl?: string;
  address?: Address;
  officeHours?: string;
  schoolHours?: string;
  pickupInstructions?: string;
  busInfo?: string;
  calendarDates?: SchoolCalendarDate[];
  lastEnrichedAt?: string;
  enrichmentSources?: string[];
  notes?: string;
}

// Review-first school enrichment result. Parent confirmation is required before saving.
export interface SchoolEnrichmentSuggestion {
  id: ID;
  query: string;
  school: Partial<SchoolInfo>;
  calendarDates: SchoolCalendarDate[];
  sources: string[];
  warnings: string[];
  confidence: number;
  requiresParentConfirmation: true;
}

// Custody/legal summary. Case numbers remain encrypted when implemented.
export interface LegalCustodyInfo {
  id: ID;
  court?: string;
  caseNumberEncrypted?: EncryptedValue;
  decreeDate?: string;
  custodySummary?: string;
  exchangeRules?: string;
  holidayRules?: string;
  sourceDocumentIds: ID[];
  notes?: string;
}

// Emergency or pickup-authorized contact tied to a child profile.
export interface EmergencyContact {
  id: ID;
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
  address?: Address;
  allowedPickup?: boolean;
  notes?: string;
}

// Medication record used for child medical profile, refills, providers, and reminders.
export interface Medication {
  id: ID;
  name: string;
  dosage?: string;
  route?: string;
  prescribingProviderId?: ID;
  pharmacyProviderId?: ID;
  rxNumberEncrypted?: EncryptedValue;
  refillInstructions?: string;
  refillRemainingCount?: number;
  lastFilledAt?: string;
  nextRefillDueAt?: string;
  instructions?: string;
  scheduleText?: string;
  active: boolean;
  startDate?: string;
  endDate?: string;
  sideEffectsToWatch?: string[];
}

// Medical summary for allergies, medications, restrictions, conditions, and care notes.
export interface MedicalProfile {
  bloodType?: string;
  allergies: string[];
  conditions: string[];
  medications: Medication[];
  immunizationNotes?: string;
  dietaryRestrictions: string[];
  sensoryNeeds: string[];
  careInstructions?: string;
}

// Main child vault profile. Most app features attach to or derive from this record.
export interface ChildProfile {
  id: ID;
  displayName: string;
  legalName?: string;
  preferredName?: string;
  birthdate?: string;
  ssnLast4?: string;
  encryptedSsn?: EncryptedValue;
  medical: MedicalProfile;
  careProviders: CareProvider[];
  contacts: EmergencyContact[];
  insurance: InsuranceInfo[];
  school?: SchoolInfo;
  legalCustody?: LegalCustodyInfo;
  notes?: string;
  updatedAt: string;
}

// Calendar/schedule item for custody, school, events, medication, and appointments.
export interface ScheduleItem {
  id: ID;
  childId?: ID;
  type: ScheduleType;
  title: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
  providerId?: ID;
  notes?: string;
  medicationId?: ID;
  notificationOffsets: NotificationOffset[];
  takenAt?: string;
  source?: ImportSourceType;
  confidence?: number;
}

// File/media attachment tied to a journal entry, including provenance metadata.
export interface JournalAttachment {
  id: ID;
  kind: 'photo' | 'screenshot' | 'document';
  uri: string;
  filename?: string;
  mimeType?: string;
  capturedAt?: string;
  importedAt: string;
  captureMethod: AttachmentCaptureMethod;
  originalMetadata?: Record<string, string | number | boolean>;
  sha256?: string;
  redacted?: boolean;
  notes?: string;
}

// Audit metadata that helps preserve journal chronology and evidence handling context.
export interface JournalEntryAuditMetadata {
  createdAt: string;
  updatedAt: string;
  createdByAccountId?: ID;
  deviceId?: ID;
  timezone?: string;
  entryOrder: number;
  userSuppliedOccurredAt: boolean;
  source: 'manual' | 'ai_import' | 'share_sheet' | 'camera' | 'document_import';
}

// Parent-entered or imported journal note for medical, custody, school, communication, and other events.
export interface JournalEntry {
  id: ID;
  childId?: ID;
  type: JournalEntryType;
  occurredAt: string;
  occurredAtPrecision: 'exact' | 'approximate' | 'date_only' | 'unknown';
  title: string;
  notes: string;
  peopleInvolved?: string[];
  location?: string;
  attachments: JournalAttachment[];
  tags: string[];
  sourceDocumentIds?: ID[];
  audit: JournalEntryAuditMetadata;
}

// User-selected export options for a future PDF/ZIP/JSON/CSV package.
export interface JournalExportRequest {
  id: ID;
  childId?: ID;
  format: ExportFormat;
  dateFrom?: string;
  dateTo?: string;
  includeAttachments: boolean;
  includeAttachmentMetadata: boolean;
  includeAuditMetadata: boolean;
  includeMedicalEntries: boolean;
  includeCustodyEntries: boolean;
  createdAt: string;
}

// Summary manifest describing what an export package contains.
export interface JournalExportManifest {
  id: ID;
  generatedAt: string;
  format: ExportFormat;
  entryCount: number;
  attachmentCount: number;
  entries: Array<{ id: ID; title: string; occurredAt: string; createdAt: string; attachmentIds: ID[] }>;
  warnings: string[];
}

// Searchable/citable text unit used by grounded vault Q&A.
export interface KnowledgeSource {
  id: ID;
  childId?: ID;
  kind: 'profile' | 'provider' | 'medication' | 'schedule' | 'journal' | 'document' | 'school' | 'insurance' | 'legal';
  title: string;
  text: string;
  sensitive: boolean;
  updatedAt: string;
  uri?: string;
}

// Grounded answer from saved vault sources with confidence, citations, and warnings.
export interface RagAnswer {
  answer: string;
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  sources: KnowledgeSource[];
  warnings: string[];
}

// Draft extraction result from pasted text, documents, screenshots, or future OCR/import flows.
export interface ImportSuggestion {
  id: ID;
  sourceType: ImportSourceType;
  summary: string;
  proposedProfiles?: Partial<ChildProfile>[];
  proposedScheduleItems?: Partial<ScheduleItem>[];
  proposedJournalEntries?: Partial<JournalEntry>[];
  warnings: string[];
}

// Chat command result shape for replies plus optional proposed vault changes.
export interface ChatCommandResult {
  reply: string;
  proposedScheduleItems?: Partial<ScheduleItem>[];
  proposedProfileUpdates?: Partial<ChildProfile>[];
  ragAnswer?: RagAnswer;
}

// Creates a valid empty medical profile so forms can initialize without null checks.
export const emptyMedicalProfile = (): MedicalProfile => ({
  allergies: [],
  conditions: [],
  medications: [],
  dietaryRestrictions: [],
  sensoryNeeds: []
});

export * from './rag';
export * from './completeness';
export * from './encryption';
export * from './reminders';
