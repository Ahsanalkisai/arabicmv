# ArabicMV — Phase 4B Audio Generation Setup

How to prepare Azure and run the Unit 1 pilot generation. Nothing here is
required until audio generation is approved; the dry run works today with no
account at all.

## What will be generated (Unit 1 pilot)

- **125 utterances** from `data/book1/unit01.json`, byte-exact, nothing invented:
  42 vocabulary words, 11 plural forms, 48 dialogue lines,
  18 speaking Q/A utterances, 6 grammar examples.
- **250 MP3 files** (each utterance in both voices) into `audio/book1/u01/`.
- Voices: **ar-SA-HamedNeural** (male, file suffix `-m`) and
  **ar-SA-ZariyahNeural** (female, suffix `-f`).
- Format: 24 kHz / 48 kbps mono MP3 (≈ 6 KB per second of speech;
  the whole pilot should be roughly 3–5 MB).
- Cost: **4,946 billed characters ≈ 1% of the Azure free tier's monthly
  500,000 neural characters. $0.**
- The exact text of every file is listed in `manifest-u01.json` (regenerated
  by every dry run) — review it before approving generation.

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
cd c:\Users\Admin\Music\arabicmv\arabicmv
node prototype/audio/generate.js --unit 1
```

Writes `prototype/audio/manifest-u01.json` and prints the counts and the
free-tier usage. No audio is produced.

## 3. Real generation (only after approval)

In the same PowerShell window:

```powershell
$env:AZURE_SPEECH_KEY = "<paste Key 1>"
$env:AZURE_SPEECH_REGION = "southeastasia"   # the region you chose
node prototype/audio/generate.js --unit 1 --run
```

- Files are created one at a time with a 250 ms pause between requests.
- Re-running **skips files that already exist** (safe to resume after an
  interruption); add `--force` to regenerate everything.
- `--voice m` or `--voice f` generates one voice only.
- `--only vocab` (or `dialogues,speak,grammar` in any combination) limits
  the content types — useful for a first small listening batch, e.g.:
  `node prototype/audio/generate.js --unit 1 --only vocab --voice m --run`
- `--rate -10%` slows delivery slightly if normal speed sounds fast for
  learners (decide after listening to the defaults).

The environment variable lasts only for that PowerShell window; closing it
forgets the key.

## 4. Listening QA checklist (after generation)

Play a sample of files from `audio/book1/u01/` and check, in both voices:

- [ ] Fatha / damma / kasra all audibly correct (e.g. `u01-v001` السَّلَامُ عَلَيْكُمْ)
- [ ] Shadda doubled correctly (السَّلَام، عَلِيٌّ)
- [ ] Tanween pronounced (اِسْمٌ in `u01-v003`)
- [ ] Question intonation on مَا اسْمُكَ؟ / كَيْفَ حَالُكَ؟
- [ ] Dialogue lines sound conversational, not robotic
- [ ] Consistent loudness between the male and female voice
- [ ] Modern Standard Arabic throughout — no dialect drift

If both voices pass, approve Phase 4C (player integration). If delivery is too
fast, regenerate with `--rate -10%` and `--force`.

## File naming convention (the app will derive paths from this — JSON unchanged)

| Content | Pattern | Example |
|---|---|---|
| Vocabulary word | `uNN-vIII-<voice>.mp3` | `u01-v001-m.mp3` |
| Plural form | `uNN-vIII-pl-<voice>.mp3` | `u01-v003-pl-f.mp3` |
| Imperative form | `uNN-vIII-cm-<voice>.mp3` | (none in unit 1) |
| Dialogue line | `uNN-dDD-lLL-<voice>.mp3` | `u01-d01-l02-m.mp3` |
| Speak question / answer | `uNN-sSS-q/a-<voice>.mp3` | `u01-s01-q-f.mp3` |
| Grammar example | `uNN-gGG-eEE-<voice>.mp3` | `u01-g01-e01-m.mp3` |

Indices are 1-based positions in the unit JSON arrays, so the mapping is fully
deterministic and `data/book1/*.json` never needs an audio field.
**Consequence to be aware of:** if an item is ever inserted into or removed
from the middle of a JSON array, later indices shift and those files must be
regenerated (cheap: pennies even for a full unit). Appending at the end is
always safe.
