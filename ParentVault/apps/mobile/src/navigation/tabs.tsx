/**
 * ParentVault tab registry
 *
 * This is the one place to add, remove, rename, or reorder bottom tabs.
 * Each tab points to exactly one screen file in ../screens so future edits are easy to find.
 *
 * Quick guide:
 * - Change the Profiles tab UI: edit ../screens/ProfilesScreen.tsx
 * - Change the Schedule tab UI: edit ../screens/ScheduleScreen.tsx
 * - Change the tab label/order: edit the appTabs array below
 */

import type { ComponentType } from 'react';
import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ChatScreen } from '../screens/ChatScreen';
import { ImportScreen } from '../screens/ImportScreen';
import { JournalScreen } from '../screens/JournalScreen';
import { ProfilesScreen } from '../screens/ProfilesScreen';
import { ScheduleScreen } from '../screens/ScheduleScreen';
import { SecurityScreen } from '../screens/SecurityScreen';

export type TabKey = 'profiles' | 'schedule' | 'chat' | 'import' | 'journal' | 'security';
// Ionicons type keeps tab icon names checked by TypeScript.
export type TabIconName = ComponentProps<typeof Ionicons>['name'];

export interface AppTab {
  /** Internal ID used by navigation state. Keep this stable once data/routes depend on it. */
  key: TabKey;
  /** Human-readable label shown in the bottom tab bar. */
  label: string;
  /** Icon shown in the bottom tab bar. */
  icon: TabIconName;
  /** The screen component rendered when this tab is selected. */
  Screen: ComponentType;
}

export const appTabs: AppTab[] = [
  // Calendar is first because it is the practical home screen for daily use.
  { key: 'schedule', label: 'Calendar', icon: 'calendar-number-outline', Screen: ScheduleScreen },
  { key: 'profiles', label: 'Profiles', icon: 'happy-outline', Screen: ProfilesScreen },
  { key: 'chat', label: 'Chat', icon: 'sparkles-outline', Screen: ChatScreen },
  { key: 'import', label: 'Import', icon: 'file-tray-full-outline', Screen: ImportScreen },
  { key: 'journal', label: 'Journal', icon: 'heart-outline', Screen: JournalScreen },
  { key: 'security', label: 'Settings', icon: 'lock-closed-outline', Screen: SecurityScreen }
];

// Used by App.tsx to initialize navigation state.
export const defaultTab: TabKey = 'schedule';
