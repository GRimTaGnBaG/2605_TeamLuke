import { ComponentProps } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { useTheme } from '../theme';

// Reuse the exact prop surface from React Native's TextInput.
// That keeps this wrapper flexible: every normal TextInput prop still works.
type ThemedTextInputProps = ComponentProps<typeof TextInput>;

// Shared text input wrapper for ParentVault forms.
// The purpose is to keep light/dark theme behavior consistent across screens,
// especially placeholder color, selected cursor color, border color, and typed text color.
export function ThemedTextInput({ style, placeholderTextColor, ...props }: ThemedTextInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      // Callers can override placeholderTextColor, but the theme's subtle color is the safe default.
      placeholderTextColor={placeholderTextColor ?? theme.subtle}
      // selectionColor controls the cursor/selection highlight on supported platforms.
      selectionColor={theme.primary}
      style={[
        // Base shape/spacing shared by all ParentVault inputs.
        styles.input,
        // Theme-driven colors keep dark mode readable.
        {
          backgroundColor: theme.input,
          borderColor: theme.inputBorder,
          color: theme.text
        },
        // Caller styles come last so a screen can adjust height/flex/margins without replacing theme colors by accident.
        style
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  // Compact mobile input with enough height for touch and readability.
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8
  }
});
