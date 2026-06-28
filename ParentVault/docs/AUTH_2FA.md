# Authentication and Two-Factor Security

ParentVault should require strong account security because the app stores child identity, medical, custody, school, insurance, pharmacy, journal, and media data.

## Recommended login model

1. Account login with email/password or passkey.
2. Required second factor for every account.
3. Local vault unlock with biometrics/device passcode before showing sensitive data.
4. Step-up verification for high-risk actions.

## Supported second factors

Priority order:

1. Passkey / security key
2. Authenticator app TOTP
3. Recovery codes
4. SMS fallback
5. Email fallback

SMS and email are convenient but weaker. They should be fallback options, not the preferred method.

## Step-up actions

Require a fresh second-factor check before:

- Revealing full SSN or encrypted identity fields
- Exporting data
- Deleting vault data
- Opening custody/legal documents
- Viewing raw OCR/imported documents
- Adding a trusted device
- Changing password, passkey, phone, or 2FA methods
- Turning off local unlock
- Switching cloud/self-host pairing

## Local device security

The mobile app should support:

- Biometric unlock where available
- Device passcode fallback
- Optional app PIN
- Auto-lock after inactivity
- Lock when app backgrounds
- Generic notification previews by default

## Current MVP implementation

- Shared auth/security types in `packages/shared/src/index.ts`.
- Mobile `Security` tab with 2FA method preferences and local unlock settings.
- Mobile security settings persisted locally with AsyncStorage as a demo only.
- API demo endpoints:
  - `GET /auth/security-settings`
  - `POST /auth/2fa/challenge`
  - `POST /auth/2fa/verify`

## Production blockers

The current code is a scaffold, not production auth. Before launch:

- Use a real auth provider or hardened custom auth.
- Store recovery codes hashed and shown only once.
- Implement real TOTP enrollment/verification.
- Implement passkeys/WebAuthn.
- Add rate limits and lockouts for login/2FA attempts.
- Add account/device audit logs.
- Never return demo 2FA codes from the API.
- Encrypt local settings and vault data.
