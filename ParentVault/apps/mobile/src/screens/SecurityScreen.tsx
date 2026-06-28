/**
 * PARENTVAULT-COMMENTARY
 *
 * Settings/trust-center screen for theme, privacy controls, guided setup, 2FA/vault-unlock direction, export/delete posture, and security notes.
 *
 * This is where parents should understand and control how private data is handled.
 *
 * Do not bury risks here; this screen should be blunt about security, privacy, and production readiness.
 *
 * Reading guide:
 * - Comments in this project explain product intent, privacy/security boundaries, and why a flow exists.
 * - They are deliberately more detailed than normal production comments because this prototype is being shared for learning, review, and handoff.
 * - If code and comments ever disagree, fix both together; stale privacy/security comments are dangerous.
 */

import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import type { AuthSecuritySettings, ParentVaultFeature, PrivacyFeatureSettings, SecondFactorMethod } from '@parentvault/shared';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { useVaultStore } from '../store/vaultStore';
import { useTheme } from '../theme';
import { createStepUpChallenge, defaultSecuritySettings, describeSecondFactor, loadSecuritySettings, saveSecuritySettings, setSecondFactorEnabled, setTwoFactorRequired } from '../services/security';
import { defaultPrivacyFeatureSettings, isFeatureEnabled, loadPrivacyFeatureSettings, savePrivacyFeatureSettings, scheduleOnlyPrivacySettings, setFeatureEnabled } from '../services/privacySettings';

// Display order prefers stronger factors first and fallback factors last.
const factorOrder: SecondFactorMethod[] = ['passkey', 'totp', 'sms', 'email', 'recovery_code'];
// Labels/descriptions for every privacy feature toggle shown in Settings.
const featureLabels: { feature: ParentVaultFeature; label: string; description: string }[] = [
  { feature: 'schedule_reminders', label: 'Schedule reminders', description: 'Use events and notifications without detailed child data.' },
  { feature: 'child_profile', label: 'Child profile', description: 'Names, birthdate, contacts, basic profile.' },
  { feature: 'medical', label: 'Medical details', description: 'Allergies, meds, conditions, care instructions.' },
  { feature: 'providers', label: 'Doctors/pharmacy', description: 'Doctor, dentist, pharmacy, provider contacts.' },
  { feature: 'insurance', label: 'Insurance', description: 'Insurance provider, plan, card, Rx benefits.' },
  { feature: 'school', label: 'School', description: 'School info, attendance, calendar/no-school days.' },
  { feature: 'custody_legal', label: 'Custody/legal', description: 'Court/decree summaries and exchange rules.' },
  { feature: 'journal', label: 'Journal', description: 'Notes and event records.' },
  { feature: 'media_attachments', label: 'Photos/screenshots', description: 'Attach media to journal/imports.' },
  { feature: 'ai_imports', label: 'AI imports', description: 'AI extraction from images/docs after consent.' },
  { feature: 'web_enrichment', label: 'Web enrichment', description: 'Search official public sources for school/provider details.' }
];

export function SecurityScreen() {
  // Theme/styles first; this tab controls appearance plus security/privacy settings.
  const theme = useTheme();
  const styles = createStyles(theme);

  // Local state mirrors saved security/privacy settings after they load from storage.
  const [settings, setSettings] = useState<AuthSecuritySettings>(defaultSecuritySettings());
  const [privacy, setPrivacy] = useState<PrivacyFeatureSettings>(defaultPrivacyFeatureSettings());
  const [challengeText, setChallengeText] = useState('');
  const [securityStatus, setSecurityStatus] = useState('');

  // Theme mode is stored globally because it affects the whole app, not just Settings.
  const themeMode = useVaultStore(state => state.themeMode);
  const setThemeMode = useVaultStore(state => state.setThemeMode);
  const restartOnboarding = useVaultStore(state => state.restartOnboarding);

  // Load saved settings once when the screen opens. Fall back to safe defaults if storage fails.
  useEffect(() => {
    loadSecuritySettings().then(setSettings).catch(() => setSettings(defaultSecuritySettings()));
    loadPrivacyFeatureSettings().then(setPrivacy).catch(() => setPrivacy(defaultPrivacyFeatureSettings()));
  }, []);

  // Turn individual second-factor methods on/off in the saved security settings.
  const toggleFactor = async (method: SecondFactorMethod, enabled: boolean) => {
    const updated = await setSecondFactorEnabled(method, enabled);
    setSettings(updated);
    setSecurityStatus(`${describeSecondFactor(method)} ${enabled ? 'enabled' : 'disabled'}.`);
  };

  // Enable/disable optional app areas. Schedule reminders stay on because they are the minimal useful mode.
  const toggleFeature = async (feature: ParentVaultFeature, enabled: boolean) => {
    if (feature === 'schedule_reminders' && !enabled) {
      setSecurityStatus('Schedule reminders stay on because they are ParentVault\'s minimum useful mode.');
      return;
    }
    const updated = setFeatureEnabled(privacy, feature, enabled);
    await savePrivacyFeatureSettings(updated);
    setPrivacy(updated);
    setSecurityStatus(`${featureLabels.find(item => item.feature === feature)?.label ?? 'Feature'} ${enabled ? 'enabled' : 'disabled'}.`);
  };

  // Schedule-only mode reduces sensitive data collection while keeping reminders available.
  const enableScheduleOnly = async () => {
    const updated = scheduleOnlyPrivacySettings();
    await savePrivacyFeatureSettings(updated);
    setPrivacy(updated);
    setSecurityStatus('Schedule-only mode is on.');
  };

  // Full vault mode turns all feature categories back on.
  const enableFullVault = async () => {
    const updated = defaultPrivacyFeatureSettings();
    await savePrivacyFeatureSettings(updated);
    setPrivacy(updated);
    setSecurityStatus('Full vault features are enabled.');
  };

  // Optional prompts decide whether the app should ask for extra profile/care details.
  const toggleOptionalPrompts = async (enabled: boolean) => {
    const updated = { ...privacy, allowOptionalProfilePrompts: enabled, updatedAt: new Date().toISOString() };
    await savePrivacyFeatureSettings(updated);
    setPrivacy(updated);
    setSecurityStatus(`Optional profile prompts ${enabled ? 'enabled' : 'disabled'}.`);
  };

  const toggleTwoFactorRequired = async (enabled: boolean) => {
    // Keep storage and local state in sync when the global 2FA requirement changes.
    const updated = await setTwoFactorRequired(enabled);
    setSettings(updated);
    setSecurityStatus(`Two-factor requirement ${enabled ? 'enabled' : 'disabled'}.`);
  };

  // Local unlock controls whether sensitive screens should require device-level verification.
  const toggleLocalUnlock = async (enabled: boolean) => {
    const updated = { ...settings, localUnlockRequired: enabled };
    await saveSecuritySettings(updated);
    setSettings(updated);
    setSecurityStatus(`Local vault unlock ${enabled ? 'enabled' : 'disabled'}.`);
  };

  const previewStepUp = () => {
    // Demo-only preview of a sensitive-operation step-up challenge.
    const method = settings.preferredSecondFactor ?? settings.enabledSecondFactors[0] ?? 'totp';
    const challenge = createStepUpChallenge(method);
    setChallengeText(`Step-up check ready: ${describeSecondFactor(challenge.method)}. Expires at ${new Date(challenge.expiresAt).toLocaleTimeString()}.`);
  };

  const completeSecurityReview = async () => {
    // Records the current time as the last security review moment.
    const updated = { ...settings, lastSecurityReviewAt: new Date().toISOString() };
    await saveSecuritySettings(updated);
    setSettings(updated);
    setSecurityStatus('Security review marked complete.');
  };

  const rerunSetupGuide = async () => {
    // Clears onboarding completion so the root app shows the guide again.
    await restartOnboarding();
    setSecurityStatus('Setup guide reopened. Review the family details anytime.');
  };

  // Render order: theme, privacy mode, consent toggles, two-factor, and local unlock controls.
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Theme, security, privacy, and consent controls for ParentVault.</Text>

      <Card>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.section}>Light mode</Text>
            <Text style={styles.help}>Dark mode is the standard look. Turn this on if you want the lighter settings/app theme.</Text>
          </View>
          <Switch value={themeMode === 'light'} onValueChange={enabled => void setThemeMode(enabled ? 'light' : 'dark')} />
        </View>
        <Text style={styles.status}>{themeMode === 'light' ? 'Light mode is on.' : 'Dark mode is standard.'}</Text>
      </Card>

      <Card>
        <Text style={styles.section}>Setup guide</Text>
        <Text style={styles.help}>Run the guided setup again when family details, school contacts, care team, or custody routines change.</Text>
        <PrimaryButton tone="quiet" onPress={rerunSetupGuide}>Run setup guide again</PrimaryButton>
      </Card>

      <Card>
        <Text style={styles.section}>Privacy mode</Text>
        <Text style={styles.help}>Schedule-only mode keeps reminders usable without asking for optional child profile, medical, school, insurance, custody, journal, media, AI, or web enrichment data.</Text>
        <PrimaryButton onPress={enableScheduleOnly}>Use schedule reminders only</PrimaryButton>
        <PrimaryButton tone="quiet" onPress={enableFullVault}>Enable full vault features</PrimaryButton>
        <Text style={styles.status}>{privacy.minimalMode ? 'Minimal mode is on: only schedule reminders are enabled.' : 'Full/selected features mode is on.'}</Text>
      </Card>

      <Card>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.section}>Optional profile prompts</Text>
            <Text style={styles.help}>Turn this off if you do not want the bot asking for extra details like insurance, doctors, school, or custody info.</Text>
          </View>
          <Switch value={privacy.allowOptionalProfilePrompts} onValueChange={toggleOptionalPrompts} />
        </View>
      </Card>

      <Card>
        <Text style={styles.section}>Feature consent</Text>
        {featureLabels.map(item => (
          <View key={item.feature} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.help}>{item.description}</Text>
            </View>
            <Switch value={isFeatureEnabled(privacy, item.feature)} onValueChange={enabled => toggleFeature(item.feature, enabled)} />
          </View>
        ))}
        {securityStatus ? <Text style={styles.status}>{securityStatus}</Text> : null}
      </Card>

      <Card>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.section}>Require two-factor</Text>
            <Text style={styles.help}>Recommended: passkey or authenticator app. SMS/email should be fallback only.</Text>
          </View>
          <Switch value={settings.twoFactorRequired} onValueChange={toggleTwoFactorRequired} />
        </View>
      </Card>

      <Card>
        <Text style={styles.section}>Second-factor methods</Text>
        {factorOrder.map(method => (
          <View key={method} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.label}>{describeSecondFactor(method)}</Text>
              {method === 'recovery_code' ? <Text style={styles.help}>{settings.recoveryCodesRemaining} recovery codes remaining</Text> : null}
            </View>
            <Switch value={settings.enabledSecondFactors.includes(method)} onValueChange={enabled => toggleFactor(method, enabled)} />
          </View>
        ))}
        <PrimaryButton onPress={previewStepUp}>Start security check</PrimaryButton>
        {challengeText ? <Text style={styles.status}>{challengeText}</Text> : null}
      </Card>

      <Card>
        <Text style={styles.section}>Security review</Text>
        <Text style={styles.help}>Last reviewed: {settings.lastSecurityReviewAt ? new Date(settings.lastSecurityReviewAt).toLocaleString() : 'Not reviewed yet'}</Text>
        <PrimaryButton onPress={completeSecurityReview}>Mark review complete</PrimaryButton>
      </Card>

      <Card>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.section}>Local vault unlock</Text>
            <Text style={styles.help}>Use biometrics/device passcode before opening sensitive child data, even after account login.</Text>
          </View>
          <Switch value={settings.localUnlockRequired} onValueChange={toggleLocalUnlock} />
        </View>
        <Text style={styles.help}>Enabled methods: {settings.localUnlockMethods.join(', ')}</Text>
      </Card>

      <Card>
        <Text style={styles.section}>Production rules</Text>
        <Text>- Schedule reminders must work without optional profile data.</Text>
        <Text>- Every optional data category needs opt-in consent.</Text>
        <Text>- Skipped fields should stay skipped unless the parent re-enables prompts.</Text>
        <Text>- 2FA required for every account holding child data.</Text>
        <Text>- Step-up verification before exports, SSN reveal, custody/legal docs, or adding a new trusted device.</Text>
      </Card>
    </ScrollView>
  );
}

// Screen-specific styles for the Settings/Security tab only.
const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: { padding: 20, paddingBottom: 32 },
  title: { fontSize: 30, fontWeight: '800', color: theme.text },
  subtitle: { color: theme.muted, marginBottom: 16 },
  section: { fontSize: 17, fontWeight: '800', color: theme.text, marginBottom: 4 },
  help: { color: theme.subtle },
  label: { fontWeight: '700', color: theme.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center', paddingVertical: 8 },
  rowText: { flex: 1 },
  status: { color: theme.primary, fontWeight: '700', marginTop: 8 }
});


