# Guided Import UX Notes

_Last updated: 2026-05-12_

## What changed

The Import tab is now a guided 3-step flow:

1. Choose what you are adding: school details, custody/exchange note, medication/appointment, or journal/evidence note.
2. Fill a short template or upload a source document.
3. Review extracted drafts before saving school details, schedule items, or journal notes.

## UX principles used

- Progressive disclosure: show the user one decision at a time instead of dumping every field at once.
- Visible labels and hints: do not rely on placeholder text alone.
- Review before save: file selection/extraction should not silently mutate sensitive records.
- File upload clarity: tell the user which file types work best and what current limitations exist.
- Templates reduce blank-page anxiety and make extraction more reliable.

## Next improvements

- Add OCR/backend extraction for PDFs and screenshots.
- Add a checklist/progress meter for profile completeness.
- Add inline edit controls on review cards before saving.
- Add official school search through a backend endpoint to avoid browser CORS and stale third-party data.
- Add saved-source metadata so users can trace where each detail came from.
