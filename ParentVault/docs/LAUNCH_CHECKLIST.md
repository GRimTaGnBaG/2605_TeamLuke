# ParentVault Launch Checklist

## Product readiness

- [ ] Onboarding explains sensitive data, AI review, cloud storage, export, and deletion.
- [ ] Child profile create/edit/delete works for multiple children.
- [ ] SSN and medical fields are masked in normal views.
- [ ] Schedule create/edit/delete works for custody, school, event, and medication items.
- [ ] Notification offsets work: day before, day of, hour before, custom minutes.
- [ ] Medication reminders support “mark as taken” with timestamp.
- [ ] Journal entries support child, occurred time, title, notes, tags, and attachment metadata.
- [ ] Import review flow never saves AI suggestions without explicit approval.
- [ ] Chat command flow proposes changes and asks clarifying questions when dates/times are ambiguous.
- [ ] Empty, loading, error, and offline states are understandable.

## Cloud backend readiness

- [ ] Hosted auth is implemented and tested.
- [ ] Vault records are encrypted at rest; sensitive fields get stricter handling.
- [ ] Logs exclude plaintext SSNs, medical details, document text, and private notes.
- [ ] Audit metadata exists for create/update/delete/import actions.
- [ ] Backups, restore test, monitoring, alerting, and incident runbook are in place.
- [ ] Rate limits and abuse controls exist for auth and import jobs.
- [ ] Data export and account deletion are operational, not just promised.

## Mobile readiness

- [ ] Android build tested on physical device.
- [ ] iOS build tested on physical device.
- [ ] App lock via biometric/PIN is implemented.
- [ ] Push/local notification permissions and fallback copy are tested.
- [ ] Crash reporting is configured without sensitive breadcrumbs.
- [ ] Accessibility pass for core flows.
- [ ] App Store privacy labels and Google Play data safety forms are prepared.

## AI/import safety

- [ ] Import consent is explicit per source.
- [ ] Parent can delete original source files after extraction.
- [ ] Suggestions include confidence/warnings.
- [ ] AI prompts and outputs avoid legal/medical advice.
- [ ] Redaction rules prevent unnecessary SSN/medical transmission.
- [ ] Failed import jobs degrade to manual entry.

## Legal/privacy/compliance

- [ ] Privacy policy reviewed.
- [ ] Terms of service reviewed.
- [ ] Child data, custody record, health data, and state privacy considerations reviewed by qualified counsel.
- [ ] Support policy defines what staff can and cannot access.
- [ ] Incident notification procedure is documented.
- [ ] Marketing copy avoids legal or medical claims.

## Business launch

- [ ] Pricing and free trial selected.
- [ ] Billing provider integrated.
- [ ] Entitlement checks tested.
- [ ] Website/landing page published.
- [ ] Support email/help center live.
- [ ] Cancellation and refund policy documented.
- [ ] Beta feedback channel established.

## Self-host preservation before launch

- [ ] `BackendClient` interface remains cleanly separated from cloud implementation.
- [ ] Records use portable IDs and schemas.
- [ ] Export format can become migration input later.
- [ ] No mobile screen assumes cloud-only concepts that self-host cannot satisfy.
- [ ] Pairing/key ownership notes remain in architecture docs.
