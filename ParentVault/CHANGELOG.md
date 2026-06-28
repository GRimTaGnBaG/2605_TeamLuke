# Changelog

All notable ParentVault changes are tracked here so the project has a readable history for rollback, demos, and portfolio review.

This project uses plain-English version notes:

- `Added` for new features.
- `Changed` for behavior, UX, or structure updates.
- `Fixed` for bugs.
- `Security` for privacy, encryption, auth, or sensitive-data work.
- `Docs` for documentation and code-commentary updates.

## [0.2.0] - 2026-06-28

### Added

- Added expanded code commentary across API, mobile app shell, components, screens, services, shared models, reminders, retrieval, validation, encryption, and onboarding helpers.
- Added visible Calendar color legend, stronger event markers, and colored upcoming-event badges.
- Added production-minded version-control documentation and GitHub workflow checks.
- Added an archive branch for earlier calendar UI experiments: `archive/calendar-ui-experiments-20260628`.

### Changed

- ParentVault `main` is treated as the stable portfolio branch.
- Development guidance now emphasizes small commits, clear rollback points, tags, and CI checks.

### Security

- Existing security comments and docs continue to warn that real child/family data must not be stored until encrypted persistence, auth, authorization, redaction, and audit controls are production-ready.

### Docs

- Added this changelog so future reviewers can understand progress without reading every commit.
- Added detailed layman-friendly comments throughout the codebase to explain what each part does and why it matters.

## [0.1.0] - 2026-06-27

### Added

- Built ParentVault mobile MVP scaffold with Calendar, Profiles, Chat, Import, Journal, and Settings tabs.
- Added child vault demo data, schedule reminders, medication mark-as-taken, journal export preview, guided imports, and security/privacy settings scaffold.
- Added API scaffold, shared domain models, encryption boundary types, retrieval/Q&A helpers, and Nanny-style reminder planning.

### Docs

- Added product, architecture, API, encryption, privacy, roadmap, launch checklist, school enrichment, journal evidence, RAG assistant, and beginner-start documentation.
