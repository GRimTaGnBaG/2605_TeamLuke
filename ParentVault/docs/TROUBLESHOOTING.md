# ParentVault Troubleshooting Guide

Use this when something breaks or the app will not run.

## First question: what were you doing?

Before fixing anything, write down:

- What command did you run?
- What file did you edit?
- What error did you see?
- Did it work before your last change?

Small clues save a lot of time.

## 1. The safest first check

From the main project folder:

```bash
npm run typecheck
```

If this passes, the TypeScript code structure is probably okay.

If this fails, read the first error. Fix the first error before chasing the rest.

## 2. Common error: package not installed

Example error:

```text
Cannot find module ...
```

Try:

```bash
npm install
```

Then run:

```bash
npm run typecheck
```

## 3. Common error: TypeScript says a property does not exist

Example:

```text
Property 'exampleName' does not exist on type ...
```

This usually means one of these happened:

- You misspelled a field name.
- You changed a type but not the code using it.
- The data model in `packages/shared` does not match the screen code.

Where to look:

```text
packages/shared/src/
apps/mobile/src/store/vaultStore.ts
apps/mobile/src/screens/
```

## 4. Common error: app screen is blank

Check these in order:

1. Did TypeScript pass?

```bash
npm run typecheck
```

2. Did you recently edit a screen file?

```text
apps/mobile/src/screens/<ScreenName>.tsx
```

3. Did you accidentally remove a `return (...)` block?
4. Did you forget to import a component?
5. Did you rename a file but not update the import?

## 5. Common error: tab does not show up

Open:

```text
apps/mobile/src/navigation/tabs.tsx
```

Check:

- Is the tab in `appTabs`?
- Is the label spelled correctly?
- Is the screen imported at the top?
- Is the screen component exported from its file?

Example screen export:

```ts
export function ProfilesScreen() {
  // screen code
}
```

## 6. Common error: button does nothing

Find the button in the screen file.

Example:

```tsx
<PrimaryButton onPress={saveSomething}>Save</PrimaryButton>
```

Then find the function:

```ts
const saveSomething = () => {
  // logic here
};
```

Check:

- Is the function connected to `onPress`?
- Does the function return early?
- Does it call the right store action?
- Does it update local state or saved data?

## 7. Common error: text looks weird

If you see characters like this:

```text
â€™
â€¢
ðŸ§¸
```

That usually means there is an encoding issue from copied text or file conversion.

Fix by replacing them with normal characters:

```text
' or ’
- or •
emoji or plain text
```

After replacing, run:

```bash
npm run typecheck
```

## 8. Common error: Android or iPhone simulator does not start

Expo/mobile commands can fail for environment reasons.

Try from the mobile folder:

```bash
cd apps/mobile
npm run start
```

Then follow Expo's terminal instructions.

Android usually needs:

- Android Studio
- an emulator or connected Android phone
- USB debugging if using a real device

 iPhone/iOS simulator usually needs:

- macOS
- Xcode
- iOS Simulator

On Windows, Android is the easier local target. iPhone builds usually require a Mac or cloud build service later.

## 9. Common error: GitHub does not show my change

Check if the change is committed and pushed:

```bash
git status --short
git log -1 --oneline
```

If files are listed by `git status`, they are not committed yet.

Usual safe flow:

```bash
git add .
git commit -m "Describe the change"
git push origin main
```

Only push after checks pass.

## 10. Safe fix workflow

Use this every time:

1. Make a small change.
2. Save the file.
3. Run:

```bash
npm run typecheck
```

4. If it passes, test the screen.
5. Commit only the working change.
6. Push to GitHub.

## 11. Rollback plan

If a change breaks things badly:

1. Stop editing.
2. Check Git status:

```bash
git status --short
```

3. If the change is not committed, you can inspect or restore specific files.
4. If Jarvis made a snapshot, check:

```text
snapshots/
```

5. Copy the known-good file back from the snapshot.
6. Run typecheck again.

## 12. When to ask for help

Ask for help when:

- TypeScript errors do not make sense.
- A screen is blank and typecheck passes.
- A store/data model change affects multiple files.
- Anything touches authentication, encryption, child data, medical data, legal/custody data, or cloud storage.

Those areas need careful handling.
