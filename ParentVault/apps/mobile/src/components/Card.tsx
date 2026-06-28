/**
 * PARENTVAULT-COMMENTARY
 *
 * Reusable visual container for grouped UI content across screens.
 *
 * Cards keep the interface consistent and make dark-mode styling easier to maintain.
 *
 * Use this instead of ad-hoc boxes when presenting profile, schedule, import, journal, or settings sections.
 *
 * Reading guide:
 * - Comments in this project explain product intent, privacy/security boundaries, and why a flow exists.
 * - They are deliberately more detailed than normal production comments because this prototype is being shared for learning, review, and handoff.
 * - If code and comments ever disagree, fix both together; stale privacy/security comments are dangerous.
 */

import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme';

export function Card({ children }: PropsWithChildren) {
  // Pull the active theme so cards adapt automatically to dark/light mode.
  const theme = useTheme();
  // Caller supplies the content; Card supplies only shared surface styling.
  return <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow, borderColor: theme.border }]}>{children}</View>;
}

const styles = StyleSheet.create({
  // Subtle bordered surface with mobile-friendly spacing.
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  }
});
