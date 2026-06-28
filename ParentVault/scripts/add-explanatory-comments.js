const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const marker = 'PARENTVAULT-COMMENTARY';

const explanations = {
  'apps/api/src/auth.ts': ['Defines the backend authentication and step-up verification scaffold.', 'This is not production auth yet; it documents the intended boundary for 2FA, recovery, and sensitive-operation checks.', 'Keep real auth provider secrets outside the repo and never log credentials, factors, recovery codes, or child data.'],
  'apps/api/src/backend.ts': ['Creates the backend adapter boundary for cloud-first and later self-hosted storage.', 'The point of this layer is to keep the mobile app from caring whether data lives in hosted infrastructure or a parent-owned server.', 'Production implementations must encrypt sensitive fields before persistence and enforce authorization on every read/write.'],
  'apps/api/src/routes.ts': ['Registers the API routes exposed by the Fastify backend scaffold.', 'Routes should stay thin: validate input, call backend/auth services, return safe DTOs, and avoid leaking sensitive details in errors.', 'When adding endpoints, consider audit logging, authorization, redaction, and export/delete behavior at the same time.'],
  'apps/api/src/server.ts': ['Bootstraps the Fastify server for the API scaffold.', 'This file should remain boring and predictable: configure server, register routes, start listening, and surface startup errors.', 'Do not put business logic or secrets here; keep them in dedicated services/config.'],
  'apps/api/src/validation.ts': ['Centralizes API request validation helpers and schemas.', 'Validation protects the backend from malformed data and prevents accidental sensitive fields from slipping through unexpected paths.', 'Whenever the shared domain model changes, update validation so API boundaries stay explicit.'],
  'apps/mobile/App.tsx': ['The root mobile app component: theme provider, app shell, header, onboarding gate, and bottom tabs.', 'It chooses which screen to render and keeps navigation intentionally simple for the MVP.', 'Privacy warning copy lives in the shell so prototype risk is visible across the app.'],
  'apps/mobile/index.ts': ['Expo entrypoint that registers the React Native app.', 'This file should stay tiny; app behavior belongs in App.tsx and src modules.', 'Only change this when Expo/bootstrap requirements change.'],
  'apps/mobile/src/components/Card.tsx': ['Reusable visual container for grouped UI content across screens.', 'Cards keep the interface consistent and make dark-mode styling easier to maintain.', 'Use this instead of ad-hoc boxes when presenting profile, schedule, import, journal, or settings sections.'],
  'apps/mobile/src/components/PrimaryButton.tsx': ['Reusable button component for primary and quiet actions.', 'Centralizing button styling keeps the app consistent and makes future accessibility/touch-target improvements easier.', 'Use the quiet tone for secondary/safe actions and the default tone for the main next action.'],
  'apps/mobile/src/screens/ChatScreen.tsx': ['Chat command center where parents type natural-language updates and factual questions.', 'It feeds messages into the vault store so commands can draft reminders or answer from stored knowledge.', 'The assistant should organize facts and draft changes only; legal/medical advice and silent sensitive mutations are out of bounds.'],
  'apps/mobile/src/screens/ImportScreen.tsx': ['Guided import/review screen for documents, images, screenshots, PDFs, flyers, custody notes, and pasted text.', 'It treats AI/OCR output as draft suggestions that must be reviewed before saving.', 'Consent, redaction, source retention, and deletion controls are required before real sensitive imports are allowed.'],
  'apps/mobile/src/screens/JournalScreen.tsx': ['Evidence-minded journal screen for factual notes, medical logs, custody events, school updates, communication records, and attachments.', 'It encourages neutral wording and stores metadata needed for later export.', 'Production journal/media storage must protect attachment URIs and avoid logging sensitive plaintext.'],
  'apps/mobile/src/screens/OnboardingScreen.tsx': ['Friendly setup guide for introducing privacy choices and collecting optional child, school, medical/care, custody, and journal details.', 'The onboarding philosophy is skippable and calm: parents can start useful without entering every sensitive category.', 'Keep copy practical and reassuring; this screen sets the trust tone for the whole app.'],
  'apps/mobile/src/screens/ProfilesScreen.tsx': ['Child vault screen for identity, care, medical, provider, emergency, insurance, school, and custody details.', 'This page is where scattered critical information becomes structured and searchable.', 'Any production persistence from this screen must encrypt sensitive fields and mask high-risk values by default.'],
  'apps/mobile/src/screens/ScheduleScreen.tsx': ['Schedule/reminders screen for custody, school, events, therapy, medications, pickup timing, journal prompts, and monthly planning.', 'It previews Nanny-style reminder rules and lets parents schedule local alerts or mark medication as taken.', 'Sensitive reminder notifications should use generic lock-screen text unless a parent explicitly opts into details.'],
  'apps/mobile/src/screens/SecurityScreen.tsx': ['Settings/trust-center screen for theme, privacy controls, prototype warnings, 2FA/vault-unlock direction, export/delete posture, and security notes.', 'This is where parents should understand and control how private data is handled.', 'Do not bury risks here; the MVP should be blunt about prototype limits and production blockers.'],
  'apps/mobile/src/services/aiImport.ts': ['Stubbed AI import service that simulates turning messy source material into structured suggestions.', 'It exists to shape the review UX before real OCR/AI providers are connected.', 'Real implementations require explicit consent, redaction, retention controls, provider metadata, and parent approval before saving.'],
  'apps/mobile/src/services/journalExport.ts': ['Builds an export manifest preview for journal records and attachments.', 'The export design should be evidence-grade: timestamps, metadata, attachment counts, hashes, and clear structure.', 'Production export must avoid leaking plaintext through logs, temp files, or analytics.'],
  'apps/mobile/src/services/knowledge.ts': ['Builds searchable knowledge sources from profiles, schedules, and journal entries for factual Q&A.', 'This keeps chat answers grounded in stored vault data instead of free-form guessing.', 'Only include data the parent has consented to store/use, and cite sources where possible.'],
  'apps/mobile/src/services/notifications.ts': ['Defines local notification preview/scheduling helpers for Nanny-style reminders.', 'The service maps schedule items into practical reminders: day-before, day-of, hour-before, pickup, therapy, medication, journal, and monthly prep.', 'Production notification bodies should default to generic text for custody/medical privacy.'],
  'apps/mobile/src/services/privacySettings.ts': ['Models privacy settings and feature gates for optional data categories and AI/import behavior.', 'These settings help enforce schedule-only mode, consent-first imports, and skippable sensitive categories.', 'When adding new sensitive features, add a privacy setting before adding the data collection.'],
  'apps/mobile/src/services/schoolEnrichment.ts': ['Drafts school enrichment data such as address, phone, hours, website, calendar URL, and no-school dates.', 'This workflow should help parents fill gaps without treating web/AI guesses as truth.', 'All enriched school details must remain draft until a parent confirms them.'],
  'apps/mobile/src/services/secureStorage.ts': ['Placeholder boundary for secure device storage and encrypted local cache behavior.', 'The file documents where sensitive persistence should eventually route instead of plain AsyncStorage/in-memory demo state.', 'Do not store real child data here until encryption, unlock, wipe-on-logout, and redaction requirements are implemented.'],
  'apps/mobile/src/services/security.ts': ['Security helper models for 2FA, vault unlock, step-up checks, and risk posture.', 'These helpers are scaffolding: they make security requirements visible before production auth exists.', 'Treat every sensitive action as needing authorization, audit metadata, and safe error handling.'],
  'apps/mobile/src/store/vaultStore.ts': ['Central Zustand store holding demo child profiles, schedules, journal entries, onboarding state, theme mode, and command handlers.', 'This is currently in-memory/demo state used to make the prototype interactive.', 'Do not treat this as secure persistence; production must move sensitive data through encrypted storage/backend adapters.'],
  'apps/mobile/src/theme.tsx': ['Shared theme provider and color tokens for dark/light mode.', 'Centralizing tokens prevents scattered hard-coded colors and keeps accessibility improvements manageable.', 'Use useTheme() in components so future theme/security styling changes apply consistently.'],
  'packages/shared/src/completeness.ts': ['Computes missing child-vault details and suggests what parents may want to add next.', 'The goal is helpful completeness, not pressure: optional sensitive categories must stay skippable.', 'Keep recommendations practical, privacy-aware, and focused on parent usefulness.'],
  'packages/shared/src/encryption.ts': ['Defines encrypted-value and sensitive-plaintext boundary types.', 'These types make security expectations visible in code even before full cryptography is implemented.', 'Never weaken these boundaries to make development easier; production data must be encrypted before persistence.'],
  'packages/shared/src/index.ts': ['Shared domain model exports for child profiles, providers, schedules, journals, imports, schools, custody, insurance, privacy, and AI results.', 'This package is the contract between mobile, API, and future backend implementations.', 'Be careful changing field names because multiple app layers depend on this schema.'],
  'packages/shared/src/rag.ts': ['Grounded retrieval/answer helper for vault Q&A.', 'It ranks stored knowledge sources and builds conservative answers rather than inventing facts.', 'If confidence/source coverage is weak, the assistant should say what is missing instead of guessing.'],
  'packages/shared/src/reminders.ts': ['Shared reminder scheduling logic for Nanny-style notification timing.', 'This keeps timing rules consistent across mobile UI, local notifications, and future backend jobs.', 'Medication/custody reminders should balance usefulness with lock-screen privacy.'],
  'scripts/generate-page-pdf-html.js': ['Generates static HTML used to print individual dark-mode PDFs for each app tab/page.', 'These exports are review artifacts so the product can be explained without launching the mobile app.', 'Keep the copy aligned with the actual app screens and docs when product scope changes.'],
  'scripts/generate-parentvault-presentation.js': ['Generates the ParentVault product presentation deck source, PPTX package, and printable HTML/PDF narrative.', 'The deck explains each app page plus product purpose, MVP shape, privacy/security, architecture, and next build priorities.', 'Update this script when presentation content changes so artifacts can be regenerated reproducibly.']
};

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.expo', 'exports', 'snapshots'].includes(entry.name)) return [];
      return walk(full);
    }
    if (!['.ts', '.tsx', '.js'].includes(path.extname(entry.name))) return [];
    return [full];
  });
}

function rel(file) {
  return path.relative(root, file).replace(/\\/g, '/');
}

function commentFor(relative) {
  const lines = explanations[relative] || ['ParentVault-owned source file.', 'This file participates in the app/API/shared package implementation.', 'Keep comments updated when behavior changes so future maintainers can understand the intent.'];
  return `/**\n * ${marker}\n *\n * ${lines.join('\n *\n * ')}\n *\n * Reading guide:\n * - Comments in this project explain product intent, privacy/security boundaries, and why a flow exists.\n * - They are deliberately more detailed than normal production comments because this prototype is being shared for learning, review, and handoff.\n * - If code and comments ever disagree, fix both together; stale privacy/security comments are dangerous.\n */\n`;
}

const files = walk(root).filter(file => rel(file) in explanations || rel(file).startsWith('apps/') || rel(file).startsWith('packages/') || rel(file).startsWith('scripts/'));
for (const file of files) {
  const relative = rel(file);
  let text = fs.readFileSync(file, 'utf8');
  if (text.includes(marker)) continue;
  let prefix = '';
  if (text.charCodeAt(0) === 0xfeff) {
    prefix = '\ufeff';
    text = text.slice(1);
  }
  fs.writeFileSync(file, `${prefix}${commentFor(relative)}\n${text}`, 'utf8');
  console.log(`commented ${relative}`);
}
console.log(`Processed ${files.length} owned code files.`);
