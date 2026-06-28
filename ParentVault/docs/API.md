# ParentVault API Skeleton

The API is a Fastify TypeScript service under `apps/api`. It is backend-mode agnostic: route handlers depend on a `VaultBackend` interface, and `createBackendFromEnv()` selects the current adapter.

## Backend mode

- Default: `PARENTVAULT_BACKEND_MODE=cloud`
- Self-host shell: `PARENTVAULT_BACKEND_MODE=self-hosted`
- Current storage: in-memory only (`storage: "memory"`) for safe MVP development.

`GET /backend` and `GET /health` expose the active mode so the mobile client can verify cloud vs self-host behavior.

## Endpoints

- `GET /health` — health, active backend mode, server time.
- `GET /backend` — backend mode metadata.
- `GET /profiles`, `POST /profiles`, `GET/PATCH/DELETE /profiles/:id`.
- `GET /schedule`, `POST /schedule`, `GET/PATCH/DELETE /schedule/:id`.
- `POST /schedule/:id/mark-taken` — records medication/event completion timestamp.
- `GET /journal`, `POST /journal`, `GET/PATCH/DELETE /journal/:id`.
- `POST /imports` — creates a consent-gated placeholder `ImportSuggestion`.

## Profile payload coverage

Profiles now support the detailed child vault model:

- Identity: display/legal/preferred names, birthdate, encrypted SSN, SSN last four.
- Medical: allergies, conditions, medications, dietary restrictions, sensory needs, care instructions.
- Care providers: doctor/provider name, provider type, office, phone, after-hours phone, email, portal, location/address, hours, notes.
- Emergency contacts with pickup authorization.
- Insurance policies with encrypted member/group identifiers.
- School details.
- Custody/legal summary fields with source document links.

## Production blockers

- Replace in-memory storage with encrypted persistence.
- Add authentication/session middleware and per-parent authorization checks.
- Add audit metadata and audit log writes for every mutation.
- Add redaction rules before OCR/AI processing, especially for SSNs, insurance IDs, medical details, and legal documents.
- Implement server-side RAG over approved/redacted knowledge chunks.
- Implement self-host pairing (QR code payload, public key pinning, one-time token).
