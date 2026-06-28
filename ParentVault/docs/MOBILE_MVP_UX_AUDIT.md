# Mobile MVP UX audit

Reviewed: 2026-05-11

## Improved in scaffold

- Bottom-tab MVP keeps all core surfaces reachable without adding navigation packages.
- Schedule now sorts chronologically, shows child ownership, formats alert offsets, and confirms local alert scheduling results.
- Import review now infers likely source type from file metadata/name, shows a parent safety checklist, saves all valid reviewed schedule suggestions, and disables save when no valid proposal exists.
- Primary button now supports disabled/accessibility state for safer review flows.

## MVP gaps to close before Android/iOS beta

1. **Persistent encrypted storage**: Zustand state is in memory only. Add encrypted local persistence and define cloud sync conflict handling before storing SSNs or medical data.
2. **Real navigation**: The hand-rolled tab switcher is fine for demo, but beta needs deep-linkable routes, modal edit flows, back handling, and Android hardware-back behavior.
3. **Editable forms**: Current “draft” buttons create placeholder records. Add validated create/edit forms for child profile, medication, emergency contact, schedule item, and journal entry.
4. **Notification lifecycle**: Local alert IDs are not persisted, editable, or cancellable. Add per-item notification status and reschedule/cancel behavior.
5. **AI import backend**: Import is a placeholder. Need OCR/parser service, structured diff review, confidence per field, consent, retention/deletion controls, and safe failure states.
6. **Medication safety**: Mark-as-taken is one-tap with no dose validation, caregiver attribution, undo, or missed-dose handling.
7. **Journal evidence UX**: Attachments are metadata only. Add previews, redaction, original-file retention policy, export, and tamper-evident timestamps if legal evidence is in scope.
8. **Accessibility/i18n**: Add screen-reader labels for all controls, dynamic type checks, minimum touch targets, color-contrast review, and date/time locale/time-zone handling.
9. **Auth/privacy gate**: Add biometric/PIN lock, session timeout, app switcher privacy blur, audit logs, and explicit “hide sensitive fields” defaults.
10. **Testing**: Add unit tests for parser/store logic plus device smoke tests for notification permissions, file pickers, keyboard behavior, and offline startup.

## Suggested next implementation slice

Build the child profile and schedule edit forms first, backed by encrypted local persistence. That unlocks realistic beta testing while keeping AI import and cloud sync behind reviewable seams.
