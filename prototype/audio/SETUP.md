# ArabicMV — Listening/Speaking Audio Generation Setup

How to prepare Azure and generate the Listening/Speaking audio for all 17 units
(16 textbook units + Bonus Lesson 17). Nothing here is required until audio
generation is approved; the dry run works today with no account at all.

## Scope (policy 2026-11-01, reaffirmed 2026-11-04)

**Audio is permitted ONLY in Listening and Speaking activities**: the `speak[]`
questions and answers (the Speaking tab's Q/A and "Say it" modes, and the
Listening tab built on them). Vocabulary cards, dialogues, roleplays, grammar
examples and quizzes get **no audio**, and the script cannot generate them.

## What will be generated

- **312 utterances** (`speak[]` question + answer in every unit), byte-exact.
- **306 MP3 files** — identical text in the same voice is recorded once and
  reused (6 reuses, e.g. «مَا جِنْسِيَّتُكَ؟» in Unit 1 and Lesson 17).
- **≈ 9,200 Arabic characters ≈ 1.8%** of the Azure free tier's monthly
  500,000 neural characters — $0. About 2–3 MB of audio.
- One recording per utterance, no pitch changes. Voices:
  **ar-SA-HamedNeural** (suffix `-m`) and **ar-SA-ZariyahNeural** (suffix `-f`):
  - Units 1–16 — **answers → Hamed** (many contain masculine self-reference);
    **questions → Zariyah**, except `u05-s04` and `u06-s09`, whose answers
    address the asker as a man (مِنْ فَضْلِكَ / اِنْتَظِرْ ... مَعَكَ) → Hamed.
    No question in units 1–16 addresses a woman (the dry run re-checks this).
  - Lesson 17 — **officer → Zariyah**, **passenger → Hamed**; the four
    "to a woman" drills (answer = the card's form for a woman) are both spoken by
    the officer → Zariyah.
- Format: 24 kHz / 48 kbps mono MP3.
- The exact text, voice, file and fingerprint of every item is listed in
  `manifest-uNN.json` (rewritten by every dry run) — review before approving.

## 1. Create the Azure Speech resource (one-time, ~10 minutes)

1. Sign in / sign up at https://portal.azure.com (a free account is enough;
   no paid subscription is needed for the F0 tier).
2. **Create a resource** → search for **"Speech"** (Azure AI services | Speech)
   → **Create**.
3. Choose:
   - **Subscription / Resource group**: any (create a group like `arabicmv`).
   - **Region**: pick one close to the Maldives, e.g. **Southeast Asia**
     (`southeastasia`) or **UAE North** (`uaenorth`). Note the region id —
     the script needs it.
   - **Pricing tier**: **Free (F0)** — 0.5M neural TTS characters/month.
4. After deployment, open the resource → **Keys and Endpoint** → copy **Key 1**
   and the **Region**.

The key stays on this PC only: it is passed to the script through an
environment variable, is never written to any file, never committed, and never
appears in frontend JavaScript. If it ever leaks, regenerate it from the same
portal page ("Regenerate Key 1").

## 2. Dry run (no credentials, no network — works now)

```powershell
cd c:UsersAdminMusicarabicmvarabicmv
node prototype/audio/generate.js --all          # or --unit 11
```

Writes `prototype/audio/manifest-uNN.json` for every selected unit and prints,
per unit: utterances, files, reused recordings, and the status of each file —
**ok** (already generated from the current text), **to make**, or **stale**
(generated from text that has since changed — it will be regenerated, never
silently reused). It also prints policy warnings (e.g. a question that
addresses a woman while its answer uses the male voice). No audio is produced
and no network module is loaded.

## 3. Real generation (only after approval)

In the same PowerShell window:

```powershell
$env:AZURE_SPEECH_KEY = "<paste Key 1>"
$env:AZURE_SPEECH_REGION = "southeastasia"   # the region you chose
node prototype/audio/generate.js --unit 1 --run   # pilot first, then --all --run
```

- Files are created one at a time with a 250 ms pause between requests.
- Failed requests are retried up to **3 times** (1 s, 2 s, 4 s, or the server's
  Retry-After) for timeouts, 408, 429 and 5xx. A 401/403 (bad key or region)
  stops the run at once.
- After each success the file is written atomically and recorded in
  `audio/book1/ledger.json` (fingerprint of voice + format + rate + text).
  **Re-running resumes**: files whose ledger entry matches are skipped; missing,
  corrupted or stale files are (re)made. `--force` regenerates everything selected.
- Every run writes `audio/book1/report.json` (generated, stale replaced, failed
  with reasons) and `audio/book1/ready.json` — the list the app plays from.
- `--voice m` / `--voice f` generates only that voice's share; `--rate -10%`
  slows delivery (changing the rate changes the fingerprints, so files regenerate).
- `--index` rebuilds `ready.json` from the ledger without synthesizing anything.
- Testing without Azure: `--mock <dir>` writes fake MP3s into `<dir>` (never the
  project), with `--mock-fail id,…` / `--mock-flaky id,…` to exercise retries.

The environment variable lasts only for that PowerShell window; closing it
forgets the key. The key is never written to any file or sent to the browser.

## 4. Listening QA checklist (after generation)

Play a sample from each `audio/book1/uNN/` and check:

- [ ] Fatha / damma / kasra all audibly correct (`u01-s01-q` السَّلَامُ عَلَيْكُمْ)
- [ ] Shadda doubled correctly (السَّلَامُ)
- [ ] Tanween pronounced (بِخَيْرٍ in `u01-s03-a`, جِدًّا later)
- [ ] Question intonation on مَا اسْمُكَ؟ / كَيْفَ حَالُكَ؟ (Zariyah files)
- [ ] Answers sound conversational, not robotic (Hamed files)
- [ ] Consistent loudness between the Zariyah questions and Hamed answers
- [ ] Modern Standard Arabic throughout — no dialect drift
- [ ] Words to listen for: سِرِيلَانْكِيٌّ (`u11-s04-a`), مَالِيه (Units 10–16),
      اللهُ, and the Lesson 17 forms for a woman (`u17-s06/07/09/12-a`)

## 5. Switching audio on in the app

`AUDIO_READY` in `js/app.js` is the master switch and stays `false` until the
generated files have passed the checklist. When it is `true` the app fetches
`audio/book1/ready.json` once and shows a play button only for items that are
listed **and** whose text fingerprint (`t`) matches the Arabic on screen —
missing, stale or unplayable items fall back to the text-only exercise. Files
are loaded only when the play button is tapped; one shared player; no autoplay.

## File naming convention

| Content | Pattern | Example |
|---|---|---|
| Speak question | `uNN-sSS-q-<voice>.mp3` | `u01-s01-q-f.mp3` |
| Speak answer | `uNN-sSS-a-<voice>.mp3` | `u01-s01-a-m.mp3` |

`SS` is the 1-based position in the unit's `speak` array. A reused recording
keeps the file name of its first occurrence (e.g. Lesson 17 question 1 plays
`u01/u01-s05-q-f.mp3`). The app never derives file names: it plays only what
`ready.json` lists, so inserting or reordering `speak` items cannot play the
wrong file — the next run simply regenerates what changed.
