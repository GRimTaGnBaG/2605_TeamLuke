/**
 * PARENTVAULT-COMMENTARY
 *
 * Generates static HTML used to print individual dark-mode PDFs for each app tab/page.
 *
 * These exports are review artifacts so the product can be explained without launching the mobile app.
 *
 * Keep the copy aligned with the actual app screens and docs when product scope changes.
 *
 * Reading guide:
 * - Comments in this project explain product intent, privacy/security boundaries, and why a flow exists.
 * - They are deliberately more detailed than normal production comments because this prototype is being shared for learning, review, and handoff.
 * - If code and comments ever disagree, fix both together; stale privacy/security comments are dangerous.
 */

const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '..', 'exports', 'page-pdfs-20260517-0923');
const htmlDir = path.join(outDir, 'html');
fs.mkdirSync(htmlDir, { recursive: true });

const tabs = [
  { key: 'profiles', label: 'Profiles' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'chat', label: 'Chat' },
  { key: 'import', label: 'Import' },
  { key: 'journal', label: 'Journal' },
  { key: 'security', label: 'Settings' }
];

const pages = {
  profiles: {
    title: 'Profiles',
    subtitle: 'Child profile, medical/care details, providers, emergency contacts, insurance, school, and custody information.',
    cards: [
      ['Sample Child', ['Preferred name: Sam', 'Birthdate: 2018-03-12', 'Medical: Peanut allergy, seasonal asthma', 'Care instruction: Keep rescue inhaler available during sports or heavy outdoor activity.']],
      ['Medication', ['Amoxicillin — 5 mL oral', 'Schedule: 8 AM and 8 PM', 'Refill due: 2026-05-15', 'Watch for: rash, stomach upset']],
      ['Care providers', ['Dr. Elena Rivera — Riverbend Pediatrics', 'Smile Grove Dental', 'Family Care Pharmacy']],
      ['School', ['Maple Ridge Elementary — 2nd grade', 'Teacher: Ms. Carter', 'Pickup: Use west entrance car line. ID required.', 'Bus 14, afternoon dropoff approx. 3:42 PM.']],
      ['Custody', ['Demo placeholder: review decree before relying on this.', 'Court: Example County Court', 'Decree date: 2025-06-01']]
    ]
  },
  schedule: {
    title: 'Schedule',
    subtitle: 'Custody, school, events, therapy, medication reminders, journal prompts, and monthly calendar prep.',
    cards: [
      ['Nanny-style notification rules', ['Day-before: 7:00 PM', 'Day-of: 7:00 AM, or 4:57 AM for early events', 'One hour before event start', 'Pickup: 3:45 PM school days / 5:45 PM no-school days', 'Journal prompt: 8:45 PM', 'Monthly calendar prep: 28th at 7:00 PM']],
      ['Amoxicillin dose', ['Type: Medication', 'Child: Sample Child', 'Starts: one hour from app launch demo time', 'Legacy alerts: hour before, 10 min before', 'Action: Mark as taken / Schedule local alerts']]
    ]
  },
  chat: {
    title: 'Chat',
    subtitle: 'Ask ParentVault questions and draft structured updates from plain language.',
    cards: [
      ['Vault assistant examples', ['“What am I missing from this profile?”', '“Who is the pediatrician?”', '“Add a medication reminder.”', 'Answers include source titles when using stored vault knowledge.']],
      ['Safety note', ['Prototype mode: review AI-created reminders, extracted facts, and any legal/medical details before relying on them.']]
    ]
  },
  import: {
    title: 'Import',
    subtitle: 'Pull details from documents, images, school files, custody notes, and pasted text.',
    cards: [
      ['Import options', ['Pick document', 'Pick image', 'Paste text', 'Run AI import preview']],
      ['Review before saving', ['Imported items are draft data.', 'Confidence/source tracking should be reviewed before creating reminders or profile changes.']]
    ]
  },
  journal: {
    title: 'Journal',
    subtitle: 'Capture custody notes, medication logs, school updates, incidents, and daily child context.',
    cards: [
      ['Journal entry fields', ['Child', 'Title', 'Note', 'Tags', 'Source', 'Timestamp']],
      ['Exports', ['Journal export service exists for sharing or backup.', 'Best used after privacy review and deletion/export controls are production-ready.']]
    ]
  },
  security: {
    title: 'Settings',
    subtitle: 'Theme, privacy controls, prototype warnings, and security posture.',
    cards: [
      ['Theme', ['Dark mode is the default.', 'Light Mode toggle persists with AsyncStorage key parentvault:themeMode.']],
      ['Privacy/security', ['Sample data only until auth, encryption, export, and deletion are production-ready.', 'Security/privacy controls live under Settings.']],
      ['Prototype warning', ['Do not store live SSNs, medical records, legal documents, or private custody records in the prototype build.']]
    ]
  }
};

function htmlFor(key) {
  const page = pages[key];
  const nav = tabs.map(t => `<span class="tab ${t.key === key ? 'active' : ''}">${t.label}</span>`).join('');
  const cards = page.cards.map(([heading, items]) => `<section class="card"><h2>${heading}</h2><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul></section>`).join('\n');
  return `<!doctype html><html><head><meta charset="utf-8"><title>ParentVault ${page.title}</title><style>
    @page { size: letter; margin: 0.45in; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, Arial, sans-serif; background: #07111f; color: #e5edf7; }
    .phone { max-width: 430px; min-height: 760px; margin: 0 auto; background: #0b1220; border: 1px solid #233044; border-radius: 24px; overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,.35); }
    header { padding: 22px 22px 16px; background: #111827; border-bottom: 1px solid #253247; }
    .brand { font-size: 26px; font-weight: 900; margin: 0; }
    .tagline { color: #94a3b8; margin: 3px 0 0; }
    .notice { color: #fbbf24; font-size: 12px; line-height: 1.35; font-weight: 700; margin-top: 10px; }
    main { padding: 22px; }
    h1 { font-size: 32px; margin: 0 0 6px; letter-spacing: -0.03em; }
    .subtitle { color: #94a3b8; line-height: 1.45; margin: 0 0 18px; }
    .card { background: #172033; border: 1px solid #26364d; border-radius: 18px; padding: 16px; margin-bottom: 14px; }
    h2 { font-size: 19px; margin: 0 0 9px; }
    ul { margin: 0; padding-left: 20px; }
    li { margin: 6px 0; line-height: 1.38; }
    .tabs { display: flex; gap: 6px; padding: 10px; background: #111827; border-top: 1px solid #253247; }
    .tab { flex: 1; text-align: center; border-radius: 12px; padding: 10px 2px; font-size: 10.5px; font-weight: 800; color: #94a3b8; }
    .tab.active { background: rgba(96,165,250,.18); color: #60a5fa; }
    footer { color: #64748b; font-size: 11px; text-align: center; margin-top: 8px; }
  </style></head><body><div class="phone"><header><p class="brand">ParentVault</p><p class="tagline">Secure family operations</p><p class="notice">Prototype mode: use sample data only until auth, encryption, export, and deletion are production-ready.</p></header><main><h1>${page.title}</h1><p class="subtitle">${page.subtitle}</p>${cards}<footer>Generated from ParentVault prototype screen content — ${new Date().toLocaleString()}</footer></main><nav class="tabs">${nav}</nav></div></body></html>`;
}

for (const tab of tabs) {
  fs.writeFileSync(path.join(htmlDir, `ParentVault-${tab.key}.html`), htmlFor(tab.key), 'utf8');
}
console.log(htmlDir);
