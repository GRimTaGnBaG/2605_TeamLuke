# ParentVault Architecture

## Goals

1. Run cloud-first for early users.
2. Keep the mobile app backend-agnostic so a parent can later point it at a self-hosted PC backend.
3. Protect sensitive child data by design, not as an afterthought.

## System layout

```text
Mobile app (Expo React Native)
  ├─ local encrypted cache / offline queue
  ├─ notifications / med taken confirmations
  ├─ AI import UX: voice, text, images, PDFs, screenshots
  └─ BackendClient interface
        ├─ CloudBackendClient -> hosted API
        └─ SelfHostedBackendClient -> parent PC API

API backend
  ├─ auth/session service
  ├─ child profile vault
  ├─ schedule engine
  ├─ notification planner
  ├─ journal/media metadata service
  ├─ AI extraction pipeline
  └─ audit log
```

## Data sensitivity

Child profiles may contain SSNs, medical information, custody details, private communications, and images. Treat all data as high-sensitivity.

Recommended production controls:

- Encrypt SSN and medical fields separately from regular profile metadata.
- Never send SSNs to general AI models unless explicitly enabled and redacted by default.
- Store original uploaded documents in a private object store with short-lived signed URLs.
- Keep extracted structured data separate from source documents.
- Allow parent-owned key export/import.
- Add per-record audit metadata: createdBy, updatedBy, source, confidence, timestamp.

## AI extraction flow

1. Parent uploads image/PDF/calendar/decree/flyer/screenshot.
2. Client creates an `ImportJob` with explicit source type and consent.
3. Backend OCRs/parses document.
4. AI extracts proposed child profile fields, contacts, schedule events, medication instructions, or journal entries.
5. Parent reviews a diff before saving.
6. Source can be deleted immediately or retained per parent setting.

## Self-host path

The mobile app should treat the backend as a replaceable endpoint.

Self-hosted mode plan:

- Parent installs ParentVault Desktop/Server on their PC.
- PC backend exposes local HTTPS API.
- Pair mobile app via QR code containing server URL + public key + one-time pairing token.
- Use encrypted tunnel/relay only if parent wants remote access outside home.
- Cloud account can be downgraded to metadata-only or disabled.

## Compliance note

This is not legal or medical advice. Production launch should get dedicated security/privacy review, especially for COPPA-adjacent child data, custody documentation, health data, and state privacy laws.
