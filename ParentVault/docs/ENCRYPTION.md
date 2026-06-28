# Encryption Policy

ParentVault must not persist sensitive child data in plaintext.

## Rule

Sensitive data may exist as plaintext only briefly in runtime memory while the authorized parent is actively viewing or editing it. It must be encrypted before persistence, sync, backup, logs, analytics, crash reports, exports, or AI/OCR processing queues.

## Sensitive data

Encrypt at rest:

- Full SSN and identity fields
- Medical notes, allergies, conditions, medication details, Rx numbers, refill details
- Insurance member ID, group number, Rx BIN/PCN/group, card images
- Custody/legal case numbers, decree summaries, exchange rules, legal documents
- Journal notes and screenshots/text evidence
- Uploaded documents, OCR text, AI extraction chunks, thumbnails
- Attachment/media metadata and private URLs
- Chat questions/answers when they contain child data
- Calendar/schedule details involving custody, meds, school, or appointments

## Acceptable plaintext

Limited non-sensitive metadata may be stored plaintext only if it cannot expose private child details by itself. Examples may include internal IDs, schema versions, and encrypted-record metadata. Even names and school/provider details should be treated as sensitive in ParentVault’s threat model.

## Recommended architecture

- Use TLS in transit.
- Use envelope encryption at rest.
- Use per-account data encryption keys.
- Store wrapped keys in cloud KMS or parent-owned self-host key store.
- On mobile, protect local keys with iOS Keychain / Android Keystore.
- Rotate keys and support device revocation.
- Keep encrypted local offline cache; wipe on logout/device removal.
- Encrypt media separately from metadata.
- Never log plaintext or decrypted objects.

## Field model

Shared code defines:

- `EncryptedValue`
- `EncryptionScope`
- `SensitivePlaintext`
- `SENSITIVE_FIELD_POLICY`

Encrypted fields include SSN, insurance IDs, Rx IDs, and legal case numbers. More fields should move to encrypted wrappers as persistence becomes real.

## AI/OCR rule

AI import queues must not store raw sensitive plaintext. Flow should be:

1. Parent consents.
2. File is encrypted immediately.
3. OCR/AI worker decrypts only inside controlled runtime.
4. High-risk identifiers are redacted before third-party AI unless parent explicitly opts in.
5. Extracted facts are saved only after parent review.
6. Temporary plaintext/cache is destroyed.

## Current implementation status

This repo now includes encryption types, policy docs, and a mobile `secureStorage` boundary that refuses to persist sensitive data without production encryption. The app still uses demo in-memory state. Real persistence must be encrypted before real family data is used.

## Production blockers

- Select crypto library and key management strategy.
- Add encrypted database/storage layer.
- Replace AsyncStorage demo usage for any sensitive data.
- Add log redaction tests.
- Add migration path for encrypted fields.
- Add backup/export encryption.
- Threat-model cloud and self-host key recovery.
