# Version Control and GitHub Workflow

This document explains how ParentVault should be kept on GitHub so the project remains easy to review, easy to roll back, and useful as a portfolio artifact.

## Repository Roles

- `main` is the stable portfolio branch. It should build, typecheck, and lint.
- Feature work should happen on short-lived branches named like `feature/calendar-polish` or `fix/import-validation`.
- Archive branches preserve experiments that may be useful later but should not be mixed into stable `main`.
- Tags mark important rollback/demo points.

## Current Branches

- `main`: stable current ParentVault work.
- `archive/calendar-ui-experiments-20260628`: preserved older calendar UI experiment branch from the local machine before branch cleanup.

## Standard Workflow

1. Start from the latest `main`.
2. Create a feature branch for meaningful work.
3. Make a small, focused change.
4. Run checks:

```bash
npm run typecheck
npm run lint
```

5. Commit with a clear message.
6. Push the branch.
7. Merge into `main` only after checks pass.
8. Tag important demo/rollback points.

## Commit Message Standard

Use plain English:

```text
Add calendar event color legend
Document schedule reminder flow
Fix import draft save guard
```

Avoid vague messages:

```text
stuff
changes
fix
```

## Rollback Strategy

Use Git history before manually deleting code.

Helpful commands:

```bash
git log --oneline --decorate --graph --all
git switch main
git switch -c restore-from-known-good <commit-or-tag>
git diff <old-commit>..<new-commit>
```

For important demo points, create a tag:

```bash
git tag -a v0.2.0 -m "Portfolio-ready commented ParentVault baseline"
git push origin v0.2.0
```

## What Belongs in Git

Commit:

- Source code
- Project documentation
- Config files needed to build/run
- Small reviewed example data
- Portfolio-ready assets intentionally referenced by docs

Do not commit:

- `.env` files
- Real child/family data
- SSNs, medical records, custody documents, screenshots, or private notes
- Local Expo logs
- `node_modules`
- Build output unless intentionally needed as a reviewed artifact

## GitHub Portfolio Checklist

Before sharing this repository with an employer or instructor:

- README explains the project in plain English.
- `SECURITY.md` clearly warns against real sensitive data until production controls exist.
- `CHANGELOG.md` shows progress over time.
- `docs/` explains architecture, workflow, roadmap, and production blockers.
- GitHub Actions checks run typecheck and lint.
- Commit messages show consistent progress.
- Tags mark important stable milestones.
