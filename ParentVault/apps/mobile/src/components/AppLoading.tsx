/**
 * AppLoading
 *
 * Small loading state shown while ParentVault checks whether onboarding is complete.
 * It is intentionally plain because no sensitive data should render before the app state is ready.
 */

import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';

export function AppLoading() {
  // Use theme text color so the loading state works in both themes.
  const theme = useTheme();

  return (
    <View style={styles.loading}>
      <Text style={[styles.loadingText, { color: theme.muted }]}>Loading ParentVault...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Center the loading message in the available content area.
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  loadingText: { fontWeight: '700' }
});
