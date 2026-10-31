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

## Progress

Saved in the browser only (`aby-mode`, `aby-unit`, `aby-last`, `aby-done`).
Accounts and Supabase sync are planned for Stage 7.

## Sections

Dashboard, Textbook, Practice, Communication (placeholder), Reference (placeholder), My progress.
Audio controls are hidden until recordings exist.
