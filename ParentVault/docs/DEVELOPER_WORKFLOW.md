# ParentVault Developer Workflow

This is the standard safe workflow for changing ParentVault.

## Rule 1: small changes win

Do not change ten things at once.

Good change size:

- rename a label
- move one helper function
- split one section into a component
- fix one TypeScript error
- add one small feature

Bad change size:

- rewrite three screens at once
- change the data store and UI and navigation together
- add a feature without running checks

## Rule 2: know where the change belongs

Use this quick map:

| Change | Start here |
|---|---|
| Change tab label/order | `apps/mobile/src/navigation/tabs.tsx` |
| Change a page | `apps/mobile/src/screens/<PageName>Screen.tsx` |
| Change reusable button/card styling | `apps/mobile/src/components/` |
| Change saved app data/actions | `apps/mobile/src/store/vaultStore.ts` |
| Change import logic | `apps/mobile/src/services/aiImport.ts` or `ImportScreen.tsx` |
| Change privacy/security behavior | `apps/mobile/src/services/security.ts`, `privacySettings.ts`, or `SecurityScreen.tsx` |
| Change shared data types | `packages/shared/src/` |
| Change docs | `docs/` |

## Rule 3: use comments as road signs

Comments should explain:

- why the code exists
- what data it changes
- what safety/privacy rule matters
- where to edit related behavior

Comments should not just repeat the code.

Bad comment:

```ts
// Set status
setStatus('Saved');
```

Better comment:

```ts
// Tell the parent the reviewed draft was saved; imports never save silently.
setStatus('Saved reviewed school details.');
```

## Rule 4: split large files

If a file is around 250-300 lines, pause before adding more code.

Split into:

```text
screens/example/
  exampleTypes.ts
  exampleHelpers.ts
  exampleCopy.ts
  ExampleSection.tsx
```

Keep the main screen file focused on layout and flow.

## Rule 5: run checks before committing

From the root project folder:

```bash
npm run typecheck
```

If this fails, do not push.

## Rule 6: commit messages should be plain English

Good commit messages:

```text
Split onboarding helpers from screen
Add beginner troubleshooting docs
Fix schedule reminder typecheck error
```

Bad commit messages:

```text
stuff
changes
fix
```

## Rule 7: protect sensitive data

ParentVault deals with child/family data.

Never add real personal data to:

- source code
- screenshots committed to GitHub
- test fixtures
- docs
- logs

Use fake/sample data only.

## Rule 8: platform awareness

ParentVault should eventually run on both iPhone and Android.

Avoid adding platform-specific behavior directly inside large screen files.

If platform-specific code is needed, isolate it in a helper/service and explain why.

## Standard change checklist

Before editing:

- [ ] Know what file owns the change.
- [ ] Start from an up-to-date `main` branch.
- [ ] Create a short-lived feature branch for meaningful work.
- [ ] Make a rollback snapshot for larger changes.
- [ ] Keep the change small.

After editing:

- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Confirm the edited screen still makes sense.
- [ ] Update docs if structure changed.
- [ ] Commit with a clear message.
- [ ] Push to GitHub only after checks pass.

For branch, tag, rollback, and portfolio-GitHub practices, see `docs/VERSION_CONTROL.md`.
