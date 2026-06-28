/**
 * ParentVault mobile app root
 *
 * This file should stay small. It wires together global app concerns only:
 * - theme setup
 * - onboarding gate
 * - selected tab state
 * - app shell layout
 *
 * If you want to change one tab, do not hunt through this file.
 * Go to apps/mobile/src/screens/<TabName>Screen.tsx instead.
 *
 * If you want to add, remove, rename, or reorder tabs, edit:
 * apps/mobile/src/navigation/tabs.tsx
 */

import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { AppHeader } from './src/components/AppHeader';
import { AppLoading } from './src/components/AppLoading';
import { BottomTabBar } from './src/components/BottomTabBar';
import { appTabs, defaultTab, type TabKey } from './src/navigation/tabs';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { useVaultStore } from './src/store/vaultStore';
import { ThemeProvider, useTheme } from './src/theme';

export default function App() {
  // Theme mode lives in the vault store so Settings can change it globally.
  const themeMode = useVaultStore(state => state.themeMode);

  return (
    <ThemeProvider mode={themeMode}>
      <ParentVaultApp />
    </ThemeProvider>
  );
}

function ParentVaultApp() {
  // activeTab is the only navigation state in this lightweight custom tab shell.
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);
  const theme = useTheme();
  const onboardingLoaded = useVaultStore(state => state.onboardingLoaded);
  const onboardingCompleted = useVaultStore(state => state.onboardingCompleted);
  const loadOnboardingStatus = useVaultStore(state => state.loadOnboardingStatus);

  // Look up the active tab's screen from the central tab registry.
  // If a tab key is ever missing, fall back to the first tab instead of crashing the shell.
  const ActiveScreen = useMemo(
    () => appTabs.find(item => item.key === activeTab)?.Screen ?? appTabs[0].Screen,
    [activeTab]
  );

  useEffect(() => {
    // Load persisted onboarding/theme status once when the shell mounts.
    void loadOnboardingStatus();
  }, [loadOnboardingStatus]);

  return (
    <SafeAreaView style={[styles.app, { backgroundColor: theme.app }]}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      {/* Global header stays visible on every main/onboarding screen. */}
      <AppHeader />
      <View style={styles.content}>
        {/* Gate the main tabs behind onboarding; show loading while AsyncStorage is being read. */}
        {!onboardingLoaded ? <AppLoading /> : onboardingCompleted ? <ActiveScreen /> : <OnboardingScreen />}
      </View>
      {/* Bottom tabs are hidden during onboarding so setup stays focused. */}
      {onboardingCompleted ? <BottomTabBar tabs={appTabs} activeTab={activeTab} onChangeTab={setActiveTab} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Root takes the whole safe area.
  app: { flex: 1 },
  // Content expands between header and bottom tabs.
  content: { flex: 1 }
});
