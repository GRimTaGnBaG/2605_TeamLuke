# ParentVault RAG Assistant MVP

## Goal

Give a parent a conservative chatbot that answers questions from the family vault without inventing facts. It should handle day-to-day questions such as:

- “Who is her pediatrician?”
- “What is the doctor’s after-hours phone number?”
- “Where is the dentist office?”
- “What allergies are listed?”
- “What school pickup rules are saved?”
- “Who is the child’s insurance provider?”
- “Where do they fill medication?”
- “What is the pharmacy phone number?”
- “When is the next refill due?”
- “What meds are active?”
- “What happened the last time I journaled about fever?”
- “What does the custody note say about holiday exchanges?”

The assistant is an organizer and retrieval layer, not a medical, legal, or custody advisor.

## MVP data sources

The MVP indexes source cards from existing structured records plus approved imports:

| Source | Included fields | Notes |
| --- | --- | --- |
| Child profile | display/legal/preferred name, birthdate, SSN last 4 only, notes | Full SSN/encrypted values are never indexed as plain text. |
| Medical profile | allergies, conditions, medications, dosage, instructions, schedule text, refill details, prescribing provider, pharmacy, care instructions, dietary/sensory needs | Medical answers must include a verify-with-provider warning. |
| Care providers | type, person, role, organization, phone, after-hours phone, email, portal/refill app, address, hours, e-prescription support, preferred refill flag, notes | Good for “who/where/call/fill/refill” questions. |
| School/childcare | school, teacher, attendance phone, location, pickup instructions, bus info | Lock-screen answers should remain generic. |
| Insurance | carrier, plan, policy holder, phone, nurse line, pharmacy benefits phone, portal, copay notes, prior authorization notes | Member/group/Rx IDs stay encrypted and are not indexed. |
| Legal/custody | decree date, court, custody summary, exchange rules, holiday rules, linked source document IDs | Must cite source documents; no legal advice. |
| Schedule | custody, school, event, medication, appointment items, times, location, notes, taken-at | Imported items include source type/confidence. |
| Journal | title, occurred-at, notes, tags, redacted attachment metadata, linked documents | Attachment URIs are not shown to the model/logs. |
| Imported documents | parent-approved OCR/extracted text chunks | Source files and OCR text require consent and retention controls. |

## Current local implementation

Shared no-dependency TypeScript helpers live in `packages/shared/src/rag.ts`:

- `buildKnowledgeSources(input)` turns vault records into small `KnowledgeSource` cards.
- `retrieveKnowledgeSources(query, sources, options)` does lightweight keyword/intent scoring.
- `answerFromSources(query, sources, options)` returns a `RagAnswer` with citations, confidence, and warnings.
- `answerFromKnowledge(query, input, options)` builds cards and answers in one call.

The mobile app uses `apps/mobile/src/services/knowledge.ts` as an adapter so later cloud/vector retrieval can replace the local helper without changing screens.

## Answer contract

Every answer must:

1. Use only retrieved source text.
2. Include source references (`RagAnswer.sources`) and display source titles in the UI.
3. Return `confidence: "unknown"` and a plain “I don’t know from saved data” response when no source matches.
4. Include warnings for sensitive child data and medical/legal verification.
5. Avoid exposing full SSNs, insurance member IDs, court case numbers, attachment URIs, raw OCR dumps, or encrypted values.

For MVP, answer text may be extractive (snippets from the cited cards). A future LLM layer may summarize, but only with retrieved context and the same citation/unknown behavior.

## Privacy/security constraints

- Treat all RAG inputs and outputs as sensitive child data.
- Do not log questions, retrieved chunks, source text, generated answers, OCR text, attachment URIs, or child identifiers in plaintext.
- Redact SSNs before indexing; index only last 4 when the parent intentionally stores it.
- Never send custody documents, child images, medical details, SSNs, insurance IDs, or journal text to third-party AI/OCR without explicit per-import consent.
- Parent-approved extracted facts should be stored separately from original documents.
- Imported source files, OCR text, thumbnails, and derived chunks must follow retention/delete choices.
- Require auth, local vault unlock, authorization checks, and audit metadata before production use.
- Keep notification/chat previews generic unless the parent opts into detailed previews.

## Production RAG path

1. Keep structured vault records as the source of truth.
2. Store document OCR in encrypted per-document chunks with source IDs, page/region metadata, consent records, confidence, and retention status.
3. Redact high-risk identifiers before embedding or third-party processing.
4. Use hybrid retrieval: authorization filter → child/source filters → keyword + vector ranking → recency/source-confidence tie-breaks.
5. Send the LLM only the top approved chunks, with system rules requiring citations and unknown responses.
6. Return source cards with document title, field/source kind, updated date, and confidence; never return invisible uncited context.
7. Audit that an answer was generated and which source IDs were used, but not the sensitive text itself.

## Suggested tests before real data

- Unknown question returns no sources and does not invent an answer.
- SSN-like strings are redacted from source card text.
- Provider phone/address questions cite provider sources.
- Insurance provider/pharmacy benefits questions cite insurance sources.
- Pharmacy/refill questions cite pharmacy provider and medication sources.
- Medication/allergy questions cite medical/profile sources and include warnings.
- Custody questions cite legal/document sources and include no-advice warnings.
- Child filter prevents cross-child source leakage.
- Logs/crash reports do not include query text, answer text, source text, or attachment URIs.
