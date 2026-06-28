# ParentVault Beginner Start Here Guide

This guide explains ParentVault like you are opening the project for the first time.

Goal: someone should be able to run, read, and safely fix this app without guessing where things live.

## 1. What ParentVault is

ParentVault is a mobile app for parents. It helps organize important child and family information:

- child profiles
- school details
- custody and pickup schedules
- medication and appointment reminders
- journal notes
- screenshots/photos/documents
- privacy and security settings

The app is being built with **React Native + Expo**, which means the same mobile app code can eventually run on:

- iPhone / iOS
- Android

## 2. The big folder map

From the main project folder:

```text
ParentVault/
  apps/
    mobile/        The phone app. This is where most visual app work happens.
    api/           Backend/server skeleton for later cloud features.
  packages/
    shared/        Shared TypeScript types used by mobile and API.
  docs/            Human-readable project documentation.
  exports/         PDFs, presentation files, and review artifacts.
  scripts/         Helper scripts for generating exports or project assets.
```

If you are changing what the app looks like, you probably want:

```text
apps/mobile/src/
```

## 3. How to run the project

Open a terminal in the main project folder:

```bash
cd ParentVault
npm install
npm run mobile
```

Expo will start the mobile app tools.

Then:

- Press `a` for Android.
- Press `i` for iPhone/iOS simulator. This usually requires macOS/Xcode.
- Scan the QR code with Expo Go if using a real phone and the project supports that flow.

## 4. How to check if the code is broken

Before and after changing code, run:

```bash
npm run typecheck
```

If it finishes without errors, TypeScript did not find broken types.

For only the mobile app:

```bash
cd apps/mobile
npm run typecheck
```

## 5. Where each app tab lives

Each main tab has its own file.

```text
apps/mobile/src/screens/
  ProfilesScreen.tsx      Profiles tab
  ScheduleScreen.tsx      Schedule tab
  ChatScreen.tsx          Chat tab
  ImportScreen.tsx        Import tab
  JournalScreen.tsx       Journal tab
  SecurityScreen.tsx      Settings tab
  OnboardingScreen.tsx    First-time setup before tabs open
```

If you want to edit a page, start with the matching `Screen.tsx` file.

## 6. Where tab names and order live

Tab order and labels live here:

```text
apps/mobile/src/navigation/tabs.tsx
```

Use that file if you want to:

- rename a tab
- reorder tabs
- add a tab
- remove a tab
- connect a tab to a different screen

## 7. How to read a screen file

Most screen files follow this pattern:

1. Imports at the top.
2. Small helper types or constants.
3. The main screen function, such as `ProfilesScreen()`.
4. Store data and state.
5. Helper functions that run when buttons are pressed.
6. The `return (...)` section that displays the page.
7. `createStyles(...)` at the bottom for layout and colors.

Simple rule:

- The **top** says what the file needs.
- The **middle** says what the screen does.
- The **return** says what the user sees.
- The **bottom styles** say how it looks.

## 8. How to safely edit a page

Example: change text on the Schedule tab.

1. Open:

```text
apps/mobile/src/screens/ScheduleScreen.tsx
```

2. Search for the text you want to change.
3. Edit only that text first.
4. Save the file.
5. Run:

```bash
npm run typecheck
```

6. If it passes, run the app and look at the screen.

## 9. What not to touch unless you know why

Be careful with these areas:

```text
apps/mobile/src/store/vaultStore.ts
```

This controls app data and actions. A mistake here can affect many screens.

```text
apps/mobile/src/services/
```

These files handle logic like imports, notifications, privacy, security, and exports.

```text
packages/shared/
```

These are shared data types. Changing them may require changes in both mobile and API code.

## 10. Safety rule for real family data

ParentVault is still a prototype. Do **not** use real sensitive child, medical, legal, custody, SSN, or insurance data until production security is finished.

Production still needs:

- real authentication
- encryption
- secure deletion
- secure export
- safe cloud storage
- stronger testing
- privacy review

## 11. The current cleanup direction

The code is being moved away from giant files.

Target structure:

```text
screens/
  SomeScreen.tsx          main page layout
  someScreen/
    SomeSection.tsx       smaller page section
    someHelpers.ts        helper logic
    someTypes.ts          page-specific types
    someCopy.ts           words shown to the user
```

This makes it easier to fix one part without hunting through a huge file.

## 12. Golden rule

Before pushing code to GitHub:

```bash
npm run typecheck
```

If the change is bigger than a text edit, also make a rollback snapshot first.
