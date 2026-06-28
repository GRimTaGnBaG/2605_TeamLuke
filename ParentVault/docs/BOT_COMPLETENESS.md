# Bot Completeness Assistant

## Goal

Parents often do not know how detailed to be. ParentVault should act like a careful checklist assistant that notices missing child details and guides the parent to fill them in.

The bot should answer stored facts, but it should also ask useful follow-up questions such as:

- “Who is the child’s insurance provider?”
- “Is there a pharmacy benefits number on the insurance card?”
- “Where do they fill medications?”
- “What is the pharmacy phone number and address?”
- “Does the pharmacy have a refill portal or app?”
- “Who prescribed this medication?”
- “How many refills are left?”
- “When is the next refill due?”
- “Who is allowed to pick up the child?”

## Current implementation

`packages/shared/src/completeness.ts` exports:

- `findChildVaultGaps(child)` — returns structured prompts with category, question, reason, suggested action, and severity.
- `summarizeChildVaultGaps(child)` — returns a parent-readable checklist summary.

The mobile chatbot responds to questions like:

- “What am I missing?”
- “What details should I add?”
- “Help me fill this out.”
- “Complete profile.”

## Design rules

- Ask for the few highest-impact gaps first.
- Prefer finding public information automatically when safe, especially school/provider/pharmacy address and phone.
- Confirm before saving any enriched data.
- Never infer sensitive private details like insurance member ID, Rx BIN/PCN, custody case number, or SSN from public web search.
- Encourage card/photo import for insurance and prescription labels, but require review and redaction.

## Priority fields

Required baseline:

1. Birthdate
2. Allergies
3. Primary doctor/pediatrician
4. Doctor phone
5. Preferred pharmacy
6. Pharmacy phone
7. Insurance provider
8. Emergency contacts

Recommended enrichment:

1. Doctor address/portal/hours
2. Pharmacy address/refill portal/hours/e-prescription support
3. Insurance pharmacy benefits phone
4. Insurance policy holder and plan
5. School address/phone/hours/calendar dates
6. Medication refill count/last filled/next refill due

## Future UX

Add a “Vault completeness” card with progress by category:

- Identity
- Medical
- Doctors
- Pharmacy
- Insurance
- School
- Emergency contacts
- Custody/legal

Each missing item should have one-tap actions: ask parent, scan card/label, search web, or skip.
