/**
 * PARENTVAULT-COMMENTARY
 *
 * Child vault screen for identity, care, medical, provider, emergency, insurance, school, and custody details.
 *
 * This page is where scattered critical information becomes structured and searchable.
 *
 * Any production persistence from this screen must encrypt sensitive fields and mask high-risk values by default.
 *
 * Reading guide:
 * - Comments in this project explain product intent, privacy/security boundaries, and why a flow exists.
 * - They are deliberately more detailed than normal production comments because this prototype is being shared for learning, review, and handoff.
 * - If code and comments ever disagree, fix both together; stale privacy/security comments are dangerous.
 */

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { findChildVaultGaps, type SchoolEnrichmentSuggestion, type SchoolInfo } from '@parentvault/shared';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { ThemedTextInput } from '../components/ThemedTextInput';
import { schoolDatesToScheduleItems, suggestSchoolEnrichment } from '../services/schoolEnrichment';
import { useVaultStore } from '../store/vaultStore';
import { useTheme } from '../theme';

// Formats optional address data for display in provider/school sections.
const formatAddress = (address?: { line1: string; line2?: string; city: string; state: string; postalCode: string }) => {
  if (!address) return 'Location not set';
  return [address.line1, address.line2, `${address.city}, ${address.state} ${address.postalCode}`].filter(Boolean).join(', ');
};

// Combines existing school details with a reviewed enrichment suggestion.
// Existing parent-entered fields win when the suggestion does not provide a better value.
const mergeSchool = (current: SchoolInfo | undefined, suggestion: SchoolEnrichmentSuggestion): SchoolInfo => ({
  id: current?.id ?? `school-${Date.now()}`,
  schoolName: suggestion.school.schoolName ?? current?.schoolName ?? 'School',
  districtName: suggestion.school.districtName ?? current?.districtName,
  grade: current?.grade,
  teacherName: current?.teacherName,
  mainPhone: suggestion.school.mainPhone ?? current?.mainPhone,
  attendancePhone: suggestion.school.attendancePhone ?? current?.attendancePhone,
  websiteUrl: suggestion.school.websiteUrl ?? current?.websiteUrl,
  calendarUrl: suggestion.school.calendarUrl ?? current?.calendarUrl,
  address: suggestion.school.address ?? current?.address,
  officeHours: suggestion.school.officeHours ?? current?.officeHours,
  schoolHours: suggestion.school.schoolHours ?? current?.schoolHours,
  pickupInstructions: current?.pickupInstructions,
  busInfo: current?.busInfo,
  calendarDates: [...(current?.calendarDates ?? []), ...suggestion.calendarDates],
  lastEnrichedAt: new Date().toISOString(),
  enrichmentSources: suggestion.sources,
  notes: [current?.notes, suggestion.school.notes].filter(Boolean).join('\n') || undefined
});

// Small in-screen guide explaining what the parent should fill in first.
const onboardingSteps = [
  {
    eyebrow: 'Step 1',
    title: "Let's make the child profile useful first.",
    body: "Start with the child's name, birthday, allergies, important medical notes, and trusted pickup contacts."
  },
  {
    eyebrow: 'Step 2',
    title: "Next, I'll help collect school details.",
    body: 'School, teacher, hours, pickup rules, attendance phone, calendar, and no-school dates all belong here.'
  },
  {
    eyebrow: 'Step 3',
    title: 'Then we add care logistics.',
    body: 'Doctors, pharmacy, medication schedules, insurance, refill notes, and emergency instructions.'
  },
  {
    eyebrow: 'Step 4',
    title: 'Finally, custody and journal notes.',
    body: 'Keep exchanges, reminders, court-order snippets, incidents, and evidence-style journal notes reviewable before saving.'
  }
];

export function ProfilesScreen() {
  // Theme and styles stay at the top so the visual rules are easy to find.
  const theme = useTheme();
  const styles = createStyles(theme);

  // Store values are the saved vault data this tab displays or updates.
  const children = useVaultStore(s => s.children);
  const addChild = useVaultStore(s => s.addChild);
  const updateChildSchool = useVaultStore(s => s.updateChildSchool);
  const addScheduleItem = useVaultStore(s => s.addScheduleItem);

  // Local state only controls this screen's temporary school-search and guide UI.
  const [schoolQuery, setSchoolQuery] = useState('');
  const [city, setCity] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [suggestion, setSuggestion] = useState<SchoolEnrichmentSuggestion | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [schoolStatus, setSchoolStatus] = useState('');
  const [profileStatus, setProfileStatus] = useState('');
  const [expandedPlanChildId, setExpandedPlanChildId] = useState<string | null>(null);

  const firstChild = children[0];
  // Current guide step shown in the Nanny Nova helper card.
  const nannyStep = onboardingSteps[onboardingStep];

  // Draft school details from public/known school info, but do not save anything yet.
  const enrichSchool = async () => {
    const schoolName = schoolQuery.trim() || firstChild?.school?.schoolName;
    if (!schoolName) {
      setSchoolStatus('Add a school name first, then I can draft school details for review.');
      return;
    }
    setSchoolStatus('Drafting school details for review...');
    setSuggestion(await suggestSchoolEnrichment({ schoolName, city: city.trim() || firstChild?.school?.address?.city, state: stateCode.trim() || firstChild?.school?.address?.state, academicYear: 'current school year' }));
    setSchoolStatus('Review the drafted school details below before saving.');
  };

  // Save the reviewed school suggestion and convert school calendar dates into schedule items.
  const confirmSchoolSuggestion = () => {
    if (!suggestion || !firstChild) return;
    updateChildSchool(firstChild.id, mergeSchool(firstChild.school, suggestion));
    schoolDatesToScheduleItems(firstChild.id, suggestion.calendarDates).forEach(addScheduleItem);
    setSuggestion(null);
    setSchoolStatus('School details and calendar dates were saved to the vault.');
  };

  const addProfileDraft = () => {
    // Creates a minimal profile so the parent can fill it in over time.
    const nextNumber = children.length + 1;
    addChild({
      displayName: `Child profile ${nextNumber}`,
      medical: { allergies: [], conditions: [], medications: [], dietaryRestrictions: [], sensoryNeeds: [] },
      careProviders: [],
      contacts: [],
      insurance: []
    });
    setProfileStatus(`Child profile ${nextNumber} created. Open setup or use the school/import tools to fill it in.`);
  };

  const showFillPlan = (childId: string) => {
    // Expand/collapse the missing-details action plan for one child at a time.
    setExpandedPlanChildId(current => current === childId ? null : childId);
    setShowOnboarding(true);
    setOnboardingStep(0);
    setProfileStatus('Use this plan with the school search, guided import, or setup guide to fill the highest-value details first.');
  };

  // Render order: guide, school lookup, reviewed suggestion, saved child cards, and add-child button.
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Child vault</Text>
      <Text style={styles.subtitle}>Detailed identity, medical, doctor, school, insurance, custody, and emergency information.</Text>

      {showOnboarding ? (
        <Card>
          <View style={styles.nannyRow}>
            <View style={styles.nannyAvatar}><Text style={styles.nannyFace}>NB</Text></View>
            <View style={styles.nannyBubble}>
              <Text style={styles.nannyName}>Nanny Nova</Text>
              <Text style={styles.nannyEyebrow}>{nannyStep.eyebrow} of {onboardingSteps.length}</Text>
              <Text style={styles.nannyTitle}>{nannyStep.title}</Text>
              <Text style={styles.nannyBody}>{nannyStep.body}</Text>
            </View>
          </View>
          <View style={styles.progressDots}>
            {onboardingSteps.map((_, index) => <View key={index} style={[styles.dot, index === onboardingStep && styles.activeDot]} />)}
          </View>
            <View style={styles.onboardingButtons}>
              <PrimaryButton tone="quiet" onPress={() => setShowOnboarding(false)}>Hide guide</PrimaryButton>
            <PrimaryButton onPress={() => setOnboardingStep(step => (step + 1) % onboardingSteps.length)}>Next tip</PrimaryButton>
          </View>
        </Card>
      ) : null}

      <Card>
        <Text style={styles.section}>Find school info automatically</Text>
        <Text style={styles.help}>Enter a school name and location. ParentVault will search official school/district sources, draft address/phone/hours/calendar dates, then ask you to confirm before saving.</Text>
        <ThemedTextInput value={schoolQuery} onChangeText={setSchoolQuery} placeholder="School name" style={styles.input} />
        <View style={styles.rowInputs}>
          <ThemedTextInput value={city} onChangeText={setCity} placeholder="City" style={[styles.input, styles.flexInput]} />
          <ThemedTextInput value={stateCode} onChangeText={setStateCode} placeholder="State" style={[styles.input, styles.stateInput]} autoCapitalize="characters" />
        </View>
        <PrimaryButton onPress={enrichSchool}>Search and draft school details</PrimaryButton>
        {schoolStatus ? <Text style={styles.status}>{schoolStatus}</Text> : null}
      </Card>

      {suggestion ? (
        <Card>
          <Text style={styles.section}>Confirm school enrichment</Text>
          <Text style={styles.help}>Nothing is saved until you confirm. Review against the official school/district website.</Text>
          <Text>School: {suggestion.school.schoolName}</Text>
          {suggestion.school.districtName ? <Text>District: {suggestion.school.districtName}</Text> : null}
          {suggestion.school.mainPhone ? <Text>Main phone: {suggestion.school.mainPhone}</Text> : null}
          {suggestion.school.officeHours ? <Text>Office hours: {suggestion.school.officeHours}</Text> : null}
          {suggestion.school.schoolHours ? <Text>School hours: {suggestion.school.schoolHours}</Text> : null}
          <Text>Location: {formatAddress(suggestion.school.address)}</Text>
          <Text style={styles.section}>Out-of-school / calendar dates</Text>
          {suggestion.calendarDates.map(date => <Text key={date.id}>- {date.title} - {new Date(date.startsAt).toLocaleDateString()} {date.noSchool ? '(no school)' : ''}</Text>)}
          <Text style={styles.section}>Sources</Text>
          {suggestion.sources.map(source => <Text key={source}>- {source}</Text>)}
          {suggestion.warnings.map(warning => <Text key={warning} style={styles.warningText}>Warning: {warning}</Text>)}
          <PrimaryButton onPress={confirmSchoolSuggestion}>Confirm and add to vault</PrimaryButton>
          <PrimaryButton tone="quiet" onPress={() => setSuggestion(null)}>Cancel</PrimaryButton>
        </Card>
      ) : null}

      {children.map(child => {
        // Completeness gaps generate the "Bot checklist" and optional fill plan.
        const gaps = findChildVaultGaps(child);
        const topGaps = gaps.slice(0, 5);
        const planExpanded = expandedPlanChildId === child.id;

        return (
        <Card key={child.id}>
          <Text style={styles.name}>{child.displayName}</Text>
          <View style={styles.completionRow}>
            <View style={styles.completionTrack}>
              <View style={[styles.completionFill, { width: `${Math.max(12, 100 - Math.min(gaps.length, 8) * 12)}%` }]} />
            </View>
            <Text style={styles.completionText}>{gaps.length ? `${gaps.length} to review` : 'Core details ready'}</Text>
          </View>
          {child.legalName ? <Text>Legal name: {child.legalName}</Text> : null}
          {child.preferredName ? <Text>Preferred name: {child.preferredName}</Text> : null}
          <Text>Birthdate: {child.birthdate || 'Not set'}</Text>
          <Text>SSN: {child.ssnLast4 ? `***-**-${child.ssnLast4.replace(/[^0-9]/g, '') || '****'}` : 'Not stored'}</Text>

          <Text style={styles.section}>Medical</Text>
          <Text>Allergies: {child.medical.allergies.length ? child.medical.allergies.join(', ') : 'None listed'}</Text>
          <Text>Conditions: {child.medical.conditions.length ? child.medical.conditions.join(', ') : 'None listed'}</Text>
          <Text>Dietary restrictions: {child.medical.dietaryRestrictions.length ? child.medical.dietaryRestrictions.join(', ') : 'None listed'}</Text>
          {child.medical.careInstructions ? <Text>Care instructions: {child.medical.careInstructions}</Text> : null}

          <Text style={styles.section}>Medications</Text>
          {child.medical.medications.length ? child.medical.medications.map(med => {
            const pharmacy = child.careProviders.find(provider => provider.id === med.pharmacyProviderId);
            return (
              <View key={med.id} style={styles.provider}>
                <Text style={styles.providerName}>- {med.name} {med.dosage ? ` - ${med.dosage}` : ''}</Text>
                {med.instructions ? <Text>Instructions: {med.instructions}</Text> : null}
                {med.scheduleText ? <Text>Schedule: {med.scheduleText}</Text> : null}
                {pharmacy ? <Text>Filled at: {pharmacy.organizationName ?? pharmacy.personName} {pharmacy.phone || ''}</Text> : null}
                {med.refillInstructions ? <Text>Refill: {med.refillInstructions}</Text> : null}
                {med.refillRemainingCount !== undefined ? <Text>Refills remaining: {med.refillRemainingCount}</Text> : null}
                {med.nextRefillDueAt ? <Text>Next refill due: {med.nextRefillDueAt}</Text> : null}
              </View>
            );
          }) : <Text>None listed</Text>}

          <Text style={styles.section}>Doctors & care providers</Text>
          {child.careProviders.map(provider => (
            <View key={provider.id} style={styles.provider}>
              <Text style={styles.providerName}>{provider.isPrimary ? '* ' : ''}{provider.personName}</Text>
              <Text>{provider.type}{provider.role ? ` - ${provider.role}` : ''}</Text>
              {provider.organizationName ? <Text>{provider.organizationName}</Text> : null}
              {provider.phone ? <Text>Phone: {provider.phone}</Text> : null}
              {provider.afterHoursPhone ? <Text>After-hours: {provider.afterHoursPhone}</Text> : null}
              <Text>Location: {formatAddress(provider.address)}</Text>
              {provider.officeHours ? <Text>Hours: {provider.officeHours}</Text> : null}
              {provider.type === 'pharmacy' && provider.portalUrl ? <Text>Refill portal/app: {provider.portalUrl}</Text> : null}
              {provider.type === 'pharmacy' && provider.acceptsElectronicPrescriptions !== undefined ? <Text>E-prescriptions: {provider.acceptsElectronicPrescriptions ? 'yes' : 'no'}</Text> : null}
              {provider.type === 'pharmacy' && provider.preferredForRefills ? <Text>Preferred refill pharmacy</Text> : null}
            </View>
          ))}

          <Text style={styles.section}>School</Text>
          {child.school ? (
            <>
              <Text>{child.school.schoolName}{child.school.grade ? ` - ${child.school.grade}` : ''}</Text>
              {child.school.districtName ? <Text>District: {child.school.districtName}</Text> : null}
              {child.school.teacherName ? <Text>Teacher: {child.school.teacherName}</Text> : null}
              {child.school.mainPhone ? <Text>Main phone: {child.school.mainPhone}</Text> : null}
              {child.school.attendancePhone ? <Text>Attendance: {child.school.attendancePhone}</Text> : null}
              {child.school.websiteUrl ? <Text>Website: {child.school.websiteUrl}</Text> : null}
              {child.school.calendarUrl ? <Text>Calendar: {child.school.calendarUrl}</Text> : null}
              {child.school.officeHours ? <Text>Office hours: {child.school.officeHours}</Text> : null}
              {child.school.schoolHours ? <Text>School hours: {child.school.schoolHours}</Text> : null}
              <Text>Location: {formatAddress(child.school.address)}</Text>
              {child.school.pickupInstructions ? <Text>Pickup: {child.school.pickupInstructions}</Text> : null}
              {child.school.calendarDates?.length ? <Text>Saved calendar dates: {child.school.calendarDates.length}</Text> : null}
            </>
          ) : <Text>Not set</Text>}

          <Text style={styles.section}>Emergency contacts</Text>
          {child.contacts.map(contact => <Text key={contact.id}>- {contact.name}, {contact.relationship} {contact.phone || ''}{contact.allowedPickup ? ' - pickup allowed' : ''}</Text>)}

          <Text style={styles.section}>Insurance</Text>
          {child.insurance.length ? child.insurance.map(policy => (
            <View key={policy.id} style={styles.provider}>
              <Text style={styles.providerName}>- {policy.providerName}{policy.planName ? ` - ${policy.planName}` : ''}</Text>
              {policy.policyHolderName ? <Text>Policy holder: {policy.policyHolderName}{policy.relationshipToChild ? ` (${policy.relationshipToChild})` : ''}</Text> : null}
              {policy.phone ? <Text>Main phone: {policy.phone}</Text> : null}
              {policy.nurseLinePhone ? <Text>Nurse line: {policy.nurseLinePhone}</Text> : null}
              {policy.pharmacyBenefitsPhone ? <Text>Pharmacy benefits: {policy.pharmacyBenefitsPhone}</Text> : null}
              {policy.portalUrl ? <Text>Portal: {policy.portalUrl}</Text> : null}
              {policy.copayNotes ? <Text>Copay: {policy.copayNotes}</Text> : null}
              {policy.priorAuthorizationNotes ? <Text>Prior auth: {policy.priorAuthorizationNotes}</Text> : null}
            </View>
          )) : <Text>Not set</Text>}

          <Text style={styles.section}>Bot checklist</Text>
          {topGaps.map(gap => <Text key={gap.id}>- {gap.question}</Text>)}
          {!gaps.length ? <Text>Major baseline details are filled. The bot will keep watching for stale or missing info.</Text> : null}
          <PrimaryButton tone="quiet" onPress={() => showFillPlan(child.id)}>{planExpanded ? 'Hide fill plan' : 'Show fill plan'}</PrimaryButton>
          {planExpanded ? (
            <View style={styles.planBox}>
              {topGaps.length ? topGaps.map(gap => (
                <View key={gap.id} style={styles.planItem}>
                  <Text style={styles.planTitle}>{gap.category.toUpperCase()} - {gap.severity.replace(/_/g, ' ')}</Text>
                  <Text style={styles.planQuestion}>{gap.question}</Text>
                  <Text style={styles.planAction}>{gap.suggestedAction}</Text>
                </View>
              )) : <Text style={styles.help}>No major missing details for enabled vault sections.</Text>}
            </View>
          ) : null}
        </Card>
        );
      })}
      <PrimaryButton onPress={addProfileDraft}>Add profile draft</PrimaryButton>
      {profileStatus ? <Text style={styles.status}>{profileStatus}</Text> : null}
      <View style={styles.privacyCard}><Text style={styles.privacyText}>Sensitive identifiers are masked by default. Keep exports focused on only the details you need to share.</Text></View>
    </ScrollView>
  );
}

// Screen-specific styles. Keeping them in this file makes the Profiles tab self-contained.
const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 30, fontWeight: '800', color: theme.text },
  subtitle: { color: theme.muted, marginBottom: 16 },
  name: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  nannyRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  nannyAvatar: { width: 64, height: 64, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef3c7', borderWidth: 2, borderColor: '#fbbf24' },
  nannyFace: { fontSize: 36 },
  nannyBubble: { flex: 1, backgroundColor: theme.primarySoft, borderRadius: 18, padding: 12, borderWidth: 1, borderColor: theme.border },
  nannyName: { color: theme.primary, fontWeight: '900', marginBottom: 2 },
  nannyEyebrow: { color: theme.subtle, fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  nannyTitle: { color: theme.text, fontWeight: '900', fontSize: 17, marginTop: 4 },
  nannyBody: { color: theme.muted, marginTop: 6, lineHeight: 20 },
  progressDots: { flexDirection: 'row', gap: 6, marginTop: 12, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#cbd5e1' },
  activeDot: { backgroundColor: theme.primary, width: 18 },
  onboardingButtons: { marginTop: 8 },
  section: { fontWeight: '800', marginTop: 14, marginBottom: 4 },
  help: { color: theme.muted, marginBottom: 10 },
  input: { minHeight: 44 },
  rowInputs: { flexDirection: 'row', gap: 8 },
  flexInput: { flex: 1 },
  stateInput: { width: 90 },
  provider: { borderLeftWidth: 3, borderLeftColor: theme.primary, paddingLeft: 10, marginTop: 8 },
  providerName: { fontWeight: '800' },
  completionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  completionTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: theme.border, overflow: 'hidden' },
  completionFill: { height: 8, borderRadius: 4, backgroundColor: theme.primary },
  completionText: { color: theme.subtle, fontSize: 12, fontWeight: '800' },
  planBox: { borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 10, marginTop: 10 },
  planItem: { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 8, marginTop: 8 },
  planTitle: { color: theme.primary, fontSize: 12, fontWeight: '900' },
  planQuestion: { color: theme.text, fontWeight: '800', marginTop: 3 },
  planAction: { color: theme.muted, marginTop: 3 },
  privacyCard: { backgroundColor: theme.primarySoft, borderRadius: 8, padding: 12, marginTop: 10 },
  privacyText: { color: theme.primary, marginTop: 6, fontWeight: '800' },
  warningText: { color: theme.warning, marginTop: 6, fontWeight: '800' },
  status: { color: theme.primary, fontWeight: '800', marginTop: 8 }
});
