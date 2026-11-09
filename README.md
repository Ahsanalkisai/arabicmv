# ArabicMV

Arabic-learning companion for *العربية بين يديك* (Book 1), in Dhivehi and English.
Plain HTML, CSS and JavaScript; no build step. Deployed on Vercel from this repository.

## Structure

```
index.html            app shell (sidebar, header, main, bottom nav)
css/app.css           design tokens, shell, screens
js/i18n.js            interface strings: [English, Dhivehi]
js/exercises.js       reusable exercise engines (flashcards, quiz, match, arrange, speed)
js/views.js           one function per screen
js/app.js             state, content loading, actions, start-up
data/book1/index.json unit list for Book 1
data/book1/unitNN.json one file per unit: lessons, vocab, dialogues, speak, grammar
fonts/                Faruma (Dhivehi)
```

## Content model (data/book1/unitNN.json)

- `source`: `"textbook"` or `"supplementary"`. All current dialogues, speak items,
  grammar notes and tasks are supplementary (written for this site); the vocabulary
  lists follow the book.
- `lessons[]`: `num` (book lesson number), `title_ar`, `task_dv`, `task_en`
- `vocab[]`: `lesson`, `ar`, optional `pl` / `present` / `command`, `en`, `dv`
- `dialogues[]`: `lesson`, `audio` (null until a recording exists; later an object with
  file, speakers, language, recorded_at), `lines[] {who, ar, en, dv}`
- `speak[]`: `lesson`, `q {ar,en,dv}`, `a {ar,en,dv}`
- `grammar[]`: `lesson`, `title_dv`, `body_dv`, `title_en`, `body_en`, `examples[] {ar,en,dv}`
- `letters[]` (optional; Bonus Lesson 17 only for now): `lesson`, `ar` (a whole word, fully
  vowelled, copied from a vocabulary item), `src` (that vocabulary item's `ar`). Drives the
  Practice tab "Letters" (تَرْتِيبُ الْحُرُوفِ), which appears only in units that have this list;
  the meaning shown is the source item's `en`/`dv`.

## Progress

Saved in the browser only (`aby-mode`, `aby-unit`, `aby-last`, `aby-done`).
Accounts and Supabase sync are planned for Stage 7.

## Sections

Main navigation (bottom bar on phones, sidebar on desktop): **Home, Lessons, Practice, My progress**.

- **Home**: the ArabicMV title and tagline, Continue learning (the most recently opened lesson) or a prompt to choose a lesson, and Books 1–3 (Book 1 is available; Books 2–3 are marked coming soon), followed by recent progress.
- **Lessons**: Book 1 → all units (Units 1–16 and Bonus Lesson 17) → lessons. Every lesson is open; there are no locks or prerequisites.
- **Lesson**: four activities, open in any order: Read (dialogue, vocabulary), Practise (grammar, cards, quiz, match, arrange, speed, and letters where a unit has them), Listen and Speak.
- **Practice**: choose book, unit and lesson, then Vocabulary, Grammar, Exercises, Listening or Speaking. Listening and Speaking open inside the chosen lesson.
- **My progress**: simple counts, recently opened lessons, lessons practised and per-unit progress.
- **Menu**: Reference (vocabulary library with search and saved words), Your class, language choice and teacher login.

## Audio

Listening/Speaking audio (speak[] questions and answers) plays for the units listed in `audio/book1/ready.json`: **Units 1–16**, in `audio/book1/u01/` to `u16/`. Recordings play only when tapped and are never preloaded; an item plays only if its listed text fingerprint matches the Arabic on screen, otherwise it falls back to the text-only exercise.
**Bonus Lesson 17 is text-only**: it is not listed in `ready.json` and has no recordings.
