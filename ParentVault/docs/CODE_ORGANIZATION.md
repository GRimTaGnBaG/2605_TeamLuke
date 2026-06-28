# ParentVault code organization

ParentVault is organized so each major app tab is easy to find and edit.

For a beginner walkthrough, read `BEGINNER_START_HERE.md` first.
For the safe edit/check/commit process, read `DEVELOPER_WORKFLOW.md`.
For common errors, read `TROUBLESHOOTING.md`.

## Main app entry

`apps/mobile/App.tsx`

Use this file for global app shell behavior only:

- Theme provider
- Onboarding gate
- Active tab state
- Header and bottom navigation layout

Do **not** place a whole tab's UI here. If a tab grows, keep it inside its own screen file.

## Tab registry

`apps/mobile/src/navigation/tabs.tsx`

Use this file when you want to:

- Rename a bottom tab
- Reorder tabs
- Add a new tab
- Remove a tab
- Connect a tab to a different screen component

## Screen files by tab

- `apps/mobile/src/screens/ProfilesScreen.tsx` — child profile, school, medical, emergency, custody details
- `apps/mobile/src/screens/ScheduleScreen.tsx` — calendar, appointments, custody, medications, reminders
- `apps/mobile/src/screens/ChatScreen.tsx` — quick natural-language updates and assistant-style replies
- `apps/mobile/src/screens/ImportScreen.tsx` — document/image/text import and review flow
- `apps/mobile/src/screens/JournalScreen.tsx` — factual notes, incidents, tags, evidence-style records
- `apps/mobile/src/screens/SecurityScreen.tsx` — privacy, security, theme, and prototype settings
- `apps/mobile/src/screens/OnboardingScreen.tsx` — first-run setup flow

## Shared shell components

- `apps/mobile/src/components/AppHeader.tsx` — ParentVault title and prototype warning
- `apps/mobile/src/components/AppLoading.tsx` — loading message while onboarding state loads
- `apps/mobile/src/components/BottomTabBar.tsx` — reusable bottom navigation buttons

## First split: onboarding

The onboarding tab is being broken into smaller parts first because it was the largest file.

- `apps/mobile/src/screens/OnboardingScreen.tsx` — main setup screen layout and save flow
- `apps/mobile/src/screens/onboarding/onboardingTypes.ts` — setup wizard TypeScript types
- `apps/mobile/src/screens/onboarding/onboardingSteps.ts` — Nanny Bot step labels, titles, messages, and upload hints
- `apps/mobile/src/screens/onboarding/onboardingHelpers.ts` — small helper functions for lists, IDs, file type detection, uploaded text reading, and draft defaults

## iPhone and Android target

ParentVault is a React Native / Expo mobile app, so the long-term target is one codebase that can run on both:

- iPhone / iOS
- Android phones/tablets

As the app matures, each feature should be checked for both platforms when possible. Platform-specific code should be isolated instead of mixed directly into large screen files.

## Simple rule

If you are changing what a tab **does or shows**, edit the matching file in `src/screens` or that tab's folder.

If you are changing where a tab **appears or what it is called**, edit `src/navigation/tabs.tsx`.

If a file grows past roughly 250-300 lines, split it into smaller pieces before adding more features.

## Documentation standard

Every important folder should eventually have a short README or doc explaining:

- what the folder is for
- which file to edit for common changes
- how the pieces connect
- what safety/privacy rule matters
- how to verify changes

Code comments should act like road signs. A beginner should be able to read down the file and understand what each major block does.
