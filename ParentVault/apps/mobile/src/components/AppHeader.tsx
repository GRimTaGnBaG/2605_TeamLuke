/**
 * AppHeader
 *
 * Shared top banner for the ParentVault mobile shell.
 * Keeping this outside App.tsx makes the root app easier to read and keeps global warning copy
 * in one small component instead of mixed into navigation logic.
 */

import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';

export function AppHeader() {
  // Header colors come from the active theme so it stays readable in dark/light mode.
  const theme = useTheme();

  return (
    // Brand row is visual only; navigation lives in BottomTabBar.
    <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <View style={styles.brandRow}>
        <View style={[styles.logo, { backgroundColor: theme.primarySoft }]}>
          <Text style={[styles.logoText, { color: theme.primary }]}>PV</Text>
        </View>
        <View style={styles.brandText}>
          <Text style={[styles.brand, { color: theme.text }]}>ParentVault</Text>
          <Text style={[styles.tagline, { color: theme.subtle }]}>Family command center</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Header spacing and divider separate global chrome from screen content.
  header: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 10, borderBottomWidth: 1, gap: 8 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontWeight: '900', fontSize: 14 },
  brandText: { flex: 1 },
  brand: { fontSize: 22, fontWeight: '900' },
  tagline: { marginTop: 1, fontSize: 12, fontWeight: '700' }
});
