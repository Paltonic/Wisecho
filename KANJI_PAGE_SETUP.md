# Kanji Study inside the Dashboard

Adds the kanji study (flashcards, JLPT 問題1/問題2-style quizzes, browse) as a section of `/dashboard`,
styled like the dashboard cards (#242424 panel, red top border).

## 1. Copy these files into the repo (same paths)

```
components/KanjiStudy.tsx          ← the study app ("use client")
components/KanjiStudy.module.css   ← its styles
public/kanji/data.json             ← 479 kanji, quiz sentences and your word list
```

No new npm packages are needed.

## 2. Edit `app/dashboard/page.tsx` (two additions)

At the top, under `import Link from "next/link";`:

```tsx
import KanjiStudy from "@/components/KanjiStudy";
```

Then inside the content wrapper (`max-w-6xl mx-auto ...`), right after the closing `</div>` of the
Recent Activity panel (`mt-10 bg-[#242424] border border-[#333333] p-8`), add:

```tsx
<section id="kanji">
  <KanjiStudy embedded />
</section>
```

The dashboard can stay a server component: `KanjiStudy` has `"use client"` itself.

Optional: make the "Materials" card jump to it by wrapping its content in
`<Link href="#kanji">…</Link>`.

If your `tsconfig.json` has no `@/*` alias, import with `../../components/KanjiStudy` instead.

## 3. Run

```bash
npm run dev
# open http://localhost:3000/dashboard
```

## Notes

- Progress ("known" kanji), the chosen set and the quiz type are saved in the browser (localStorage),
  per device. They are not tied to the logged-in account yet.
- `<KanjiStudy />` without `embedded` renders as a full standalone page if you ever want one.

## Updating the word list later

Everything comes from `public/kanji/data.json`. Each kanji looks like:

```json
{"n":1,"k":"政","m":"politics, government","on":"セイ、ショウ","kun":"まつりごと",
 "ex":[["政治","せいじ","politics"]],
 "s":"日本の[政治|せいじ]についてレポートを書いた。",
 "u":[["政府","せいふ","pemerintah"]]}
```

- `s` is the quiz sentence; the tested word goes in `[word|reading]`.
- `u` is your own list (Indonesian meanings). Add words there.
- Extra kanji (not N3) have `"x":1` and `"s":""`.
