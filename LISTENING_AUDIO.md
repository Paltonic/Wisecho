# Listening audio on Google Drive

The Listening drill (`<ListeningDrill />`) reads its questions from `public/jlpt/n3-listening.json`.
The audio itself stays on Google Drive, so nothing is stored in the repo or in the student's browser.

## Until you upload recordings

Questions with an empty `"drive"` are read aloud by the browser's built-in Japanese voice
(Chrome, Edge and Safari have one; Firefox on some PCs does not). Students can pick Slow / Normal / Test speed.

## Adding a recording for a question

Your Drive folder is ready: **Wisecho - JLPT N3 Listening**
https://drive.google.com/drive/folders/19bwLsY40DTzwIlN7KgCBvz4ukIpbtGlp
It contains the Google Doc **Recording scripts (L1-1 to L5-5)** with exactly what to read for each file.

1. Record one MP3 per question, named like the script heading (`L1-1.mp3` … `L5-5.mp3`).
   Read the choices in the order written in the script: the site shows them in that same order
   when a recording is used.
2. Upload the MP3s into that folder.
3. Share **each MP3 file** (not the whole folder, because the scripts doc contains the answers):
   right-click → **Share → General access → Anyone with the link → Viewer → Copy link**.
4. Paste the link into that question's `"drive"` field in `public/jlpt/n3-listening.json`:

```json
{ "id": "L1-1", "t": 1, ..., "drive": "https://drive.google.com/file/d/1AbC...xyz/view?usp=sharing" }
```

The full share link or just the file ID both work. The page plays it from
`https://drive.google.com/uc?export=download&id=<FILE_ID>`.

If a Drive file can't be played (not shared, deleted, or blocked), the page falls back to the browser voice
automatically.

## Notes

- Keep each MP3 small (under ~20 MB). For bigger files Google shows a "can't scan for viruses" page and the
  audio won't play directly.
- Drive is fine for a class-sized site. If many students use it at once, Google can rate-limit downloads;
  then move the files to a storage bucket and put the full URL in `"drive"` instead of a Drive link
  (any direct audio URL works there).
- The listening scripts are original questions written in the five N3 formats (問題1–5); students can open
  the script after answering.
