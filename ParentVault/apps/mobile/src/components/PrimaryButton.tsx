/**
 * PARENTVAULT-COMMENTARY
 *
 * Reusable button component for primary and quiet actions.
 *
 * Centralizing button styling keeps the app consistent and makes future accessibility/touch-target improvements easier.
 *
 * Use the quiet tone for secondary/safe actions and the default tone for the main next action.
 *
 * Reading guide:
 * - Comments in this project explain product intent, privacy/security boundaries, and why a flow exists.
 * - They are deliberately more detailed than normal production comments because this prototype is being shared for learning, review, and handoff.
 * - If code and comments ever disagree, fix both together; stale privacy/security comments are dangerous.
 */

import { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme';

interface Props extends PropsWithChildren {
  // Required action callback. Screens own the behavior; this component owns the presentation.
  onPress: () => void;
  // primary = main action, quiet = secondary action, danger = destructive confirmation.
  tone?: 'primary' | 'quiet' | 'danger';
  // Disabled blocks presses and changes the visual treatment.
  disabled?: boolean;
  // Optional label for icon/text combinations or cases where visible text is not descriptive enough.
  accessibilityLabel?: string;
}

export function PrimaryButton({ children, onPress, tone = 'primary', disabled = false, accessibilityLabel }: Props) {
  const theme = useTheme();

  // Pick the button background from current theme + intent.
  // Danger stays a fixed red so destructive actions remain recognizable in both themes.
  const backgroundColor = disabled ? '#334155' : tone === 'quiet' ? theme.primarySoft : tone === 'danger' ? '#be123c' : theme.primaryStrong;

  // Text color is paired with the selected background to keep contrast readable.
  const color = disabled ? theme.subtle : tone === 'quiet' ? (theme.mode === 'dark' ? '#bfdbfe' : '#1e3a8a') : '#ffffff';

  return (
    <Pressable
      // Accessibility metadata tells assistive tech this behaves like a button and whether it is disabled.
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      // React Native lets Pressable styles be a function so we can show a lightweight pressed state.
      style={({ pressed }) => [styles.button, { backgroundColor, opacity: pressed && !disabled ? 0.88 : 1 }]}
    >
      <Text style={[styles.text, { color }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // 46px minimum height keeps the button comfortable on mobile touch screens.
  button: { minHeight: 46, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  // Slightly heavy text helps button labels stand apart from body copy.
  text: { fontWeight: '800' }
});
