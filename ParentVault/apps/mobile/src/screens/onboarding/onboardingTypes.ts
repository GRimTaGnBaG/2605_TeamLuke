/**
 * Onboarding types
 *
 * These types describe the Nanny Bot setup wizard data.
 * Keeping them out of OnboardingScreen.tsx makes the screen easier to scan and edit.
 */

// Ordered wizard step ids. Screens use these keys for conditional rendering.
export type SetupStepKey = 'basics' | 'school' | 'medical' | 'care' | 'custody' | 'journal' | 'review';

export type SetupDraft = {
  // Child identity fields.
  childName: string;
  legalName: string;
  preferredName: string;
  birthdate: string;
  // Medical/care fields are plain text in the draft until transformed into arrays/records.
  allergies: string;
  conditions: string;
  medications: string;
  careInstructions: string;
  // School fields support pickup, attendance, and calendar setup.
  schoolName: string;
  grade: string;
  teacherName: string;
  schoolPhone: string;
  schoolWebsite: string;
  pickupInstructions: string;
  // Care team fields seed doctors/pharmacy/insurance/emergency contacts.
  providerName: string;
  providerPhone: string;
  pharmacyName: string;
  insuranceProvider: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  // Custody/journal fields give the parent a factual starting point without legal advice.
  custodySummary: string;
  exchangeRules: string;
  journalNote: string;
};

export type SetupStep = {
  // Step key used in state and rendering.
  key: SetupStepKey;
  // Short label shown in progress dots.
  label: string;
  // Main step heading.
  title: string;
  // Helper copy explaining what to fill out.
  message: string;
  // Upload/paste hint for that step.
  uploadHint: string;
};
