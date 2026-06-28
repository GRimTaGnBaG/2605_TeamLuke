/**
 * PARENTVAULT-COMMENTARY
 *
 * Chat command center where parents type natural-language updates and factual questions.
 *
 * It feeds messages into the vault store so commands can draft reminders or answer from stored knowledge.
 *
 * The assistant should organize facts and draft changes only; legal/medical advice and silent sensitive mutations are out of bounds.
 *
 * Reading guide:
 * - Comments in this project explain product intent, privacy/security boundaries, and why a flow exists.
 * - They are deliberately more detailed than normal production comments because this prototype is being shared for learning, review, and handoff.
 * - If code and comments ever disagree, fix both together; stale privacy/security comments are dangerous.
 */

import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { ThemedTextInput } from '../components/ThemedTextInput';
import { useVaultStore } from '../store/vaultStore';
import { useTheme } from '../theme';

interface Message { role: 'parent' | 'assistant'; text: string }

const quickPrompts = [
  'What am I missing from the child profile?',
  'Add custody pickup tomorrow at 5 PM',
  'Add medication dose in one hour',
  'Where is the pharmacy phone number?'
];

export function ChatScreen() {
  // Theme/styles first so visual behavior is easy to locate.
  const theme = useTheme();
  const styles = createStyles(theme);

  // Local state holds the unsent composer text and the visible conversation history.
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Tell me what changed: "Add custody pickup Friday at 5", "med dose at 8 PM", or paste a note.' }
  ]);

  // Store action interprets the parent's message and drafts/saves supported updates.
  const applyChatText = useVaultStore(s => s.applyChatText);

  // Send protects against blank messages, adds the parent's message, then appends the assistant reply.
  const sendMessage = (messageText: string) => {
    const cleanText = messageText.trim();
    if (!cleanText) return;
    const reply = applyChatText(cleanText);
    setMessages(prev => [...prev, { role: 'parent', text: cleanText }, { role: 'assistant', text: reply }]);
    setText('');
  };

  const send = () => sendMessage(text);

  // Render order: guidance card, message cards, then sticky composer at the bottom.
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Nanny Bot</Text>
        <Text style={styles.subtitle}>A calm command center for quick schedule changes, medication reminders, and notes you want captured before they slip away.</Text>
        <Card>
          <Text style={styles.helperEyebrow}>Nanny guide</Text>
          <Text style={styles.helperTitle}>Say it like you would text a trusted helper.</Text>
          <Text style={styles.helperCopy}>Try: "Add pickup Friday at 5 PM", "Log meds at 8 PM", or "Remind me to pack the blue folder tomorrow."</Text>
          <View style={styles.quickGrid}>
            {quickPrompts.map(prompt => (
              <PrimaryButton key={prompt} tone="quiet" onPress={() => sendMessage(prompt)}>{prompt}</PrimaryButton>
            ))}
          </View>
        </Card>
        {messages.map((message, index) => (
          <Card key={index}>
            <Text style={message.role === 'assistant' ? styles.assistant : styles.parent}>{message.role === 'assistant' ? 'Nanny Bot' : 'Parent'}</Text>
            <Text>{message.text}</Text>
          </Card>
        ))}
      </ScrollView>
      <View style={styles.composer}>
        <ThemedTextInput value={text} onChangeText={setText} placeholder="Tell Nanny Bot what changed..." style={styles.input} multiline />
        <PrimaryButton onPress={send}>Send</PrimaryButton>
      </View>
    </KeyboardAvoidingView>
  );
}

// Screen-specific styles for the Chat tab only.
const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, paddingBottom: 120 },
  title: { fontSize: 30, fontWeight: '800', color: theme.text },
  subtitle: { color: theme.muted, marginBottom: 16 },
  helperEyebrow: { color: theme.primary, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  helperTitle: { color: theme.text, fontSize: 18, fontWeight: '800', marginTop: 4 },
  helperCopy: { color: theme.muted, marginTop: 8, lineHeight: 20 },
  quickGrid: { gap: 4, marginTop: 10 },
  assistant: { color: theme.primary, fontWeight: '800', marginBottom: 4 },
  parent: { color: theme.text, fontWeight: '800', marginBottom: 4 },
  composer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 14, backgroundColor: theme.app, borderTopWidth: 1, borderTopColor: theme.border },
  input: { minHeight: 48, maxHeight: 120 }
});
