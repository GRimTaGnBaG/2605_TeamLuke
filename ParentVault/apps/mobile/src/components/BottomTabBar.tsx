/**
 * BottomTabBar
 *
 * Reusable tab buttons for the ParentVault app shell.
 * The tab definitions come from ../navigation/tabs.tsx, so this component only worries about
 * display and user interaction.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { AppTab, TabKey } from '../navigation/tabs';
import { useTheme } from '../theme';

interface BottomTabBarProps {
  // Ordered tab definitions from the central registry.
  tabs: AppTab[];
  // Currently selected tab key.
  activeTab: TabKey;
  // App shell callback that changes the selected tab.
  onChangeTab: (tab: TabKey) => void;
}

export function BottomTabBar({ tabs, activeTab, onChangeTab }: BottomTabBarProps) {
  const theme = useTheme();
  // Accent colors make each selected tab easy to distinguish at a glance.
  const cuteColors = ['#38bdf8', '#fb7185', '#a78bfa', '#f59e0b', '#f472b6', '#34d399'];

  return (
    <View style={[styles.shell, { backgroundColor: theme.app, borderTopColor: theme.border }]}>
      <View style={[styles.tabs, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadow }]}>
      {tabs.map((item, index) => {
        // Each tab decides its selected color from position so the registry controls order and color pairing.
        const selected = activeTab === item.key;
        const accent = cuteColors[index % cuteColors.length];

        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={`Open ${item.label}`}
            onPress={() => onChangeTab(item.key)}
            style={({ pressed }) => [
              styles.tab,
              selected && { backgroundColor: theme.mode === 'dark' ? '#111f3c' : '#f8fafc' },
              pressed && { opacity: 0.82 }
            ]}
          >
            <View style={[
              styles.iconWrap,
              { backgroundColor: selected ? accent : 'transparent' },
              selected && styles.iconWrapSelected
            ]}>
              <Ionicons name={item.icon} size={21} color={selected ? '#ffffff' : theme.subtle} />
            </View>
            <Text style={[styles.tabText, { color: selected ? accent : theme.subtle }]}>{item.label}</Text>
          </Pressable>
        );
      })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Shell creates the top border and bottom safe spacing around the tab pill.
  shell: { borderTopWidth: 1, paddingHorizontal: 10, paddingTop: 8, paddingBottom: 10 },
  tabs: {
    flexDirection: 'row',
    padding: 4,
    gap: 2,
    borderWidth: 1,
    borderRadius: 8,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  tab: {
    flex: 1,
    minHeight: 58,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2
  },
  iconWrap: {
    width: 34,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconWrapSelected: {
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  tabText: { fontSize: 10, fontWeight: '900' }
});
