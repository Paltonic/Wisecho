"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
/* All styles live in this file (no CSS module) so they always load. Classes are prefixed "ks-". */
const styles = new Proxy({} as Record<string, string>, { get: (_t, k) => "ks-" + String(k) });

/* ---------- Types ---------- */
type Example = [word: string, reading: string, meaning: string];
export type Kanji = {
  n: number; // list number (N3 = 1–366, extra kanji after that)
  k: string; // kanji
  m: string; // English meaning
  on: string; // on'yomi (katakana)
  kun: string; // kun'yomi (hiragana)
  ex: Example[]; // N3 example words (English meanings)
  s: string; // example sentence: "…[word|reading]…" ("" for extra kanji)
  u?: Example[]; // words from the student's own list (Indonesian meanings)
  x?: 1; // extra kanji (not in the N3 list)
};
type View = "cards" | "quiz" | "browse";
type QType = "read" | "write" | "mean";
type QMode = QType | "mix";
type Question = {
  t: QType;
  d: Kanji;
  pre: string;
  w: string;
  r: string;
  post: string;
  m?: string;
  ans: string;
  opts: string[];
  n: number;
  picked?: string;
};

const DATA_URL = "/kanji/data.json";
const BATCH_SIZE = 50;

/* ---------- Small helpers ---------- */
const shuffle = <T,>(a: T[]): T[] => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
const pick = <T,>(a: T[], n: number): T[] => shuffle(a).slice(0, n);
const load = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem("n3k_" + key);
    return v == null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
};
const save = (key: string, v: unknown) => {
  try {
    localStorage.setItem("n3k_" + key, JSON.stringify(v));
  } catch {
    /* storage unavailable */
  }
};
const parseS = (s: string) => {
  const m = s.match(/^(.*)\[([^|\]]+)\|([^\]]+)\](.*)$/);
  return m ? { pre: m[1], w: m[2], r: m[3], post: m[4] } : null;
};

/* ---------- JLPT-style wrong readings (問題1) ---------- */
const DK: Record<string, string> = {
  か: "が", き: "ぎ", く: "ぐ", け: "げ", こ: "ご", さ: "ざ", し: "じ", す: "ず", せ: "ぜ", そ: "ぞ",
  た: "だ", ち: "ぢ", つ: "づ", て: "で", と: "ど", は: "ば", ひ: "び", ふ: "ぶ", へ: "べ", ほ: "ぼ",
};
const UD: Record<string, string> = Object.fromEntries(Object.entries(DK).map(([a, b]) => [b, a]));
const SM: Record<string, string> = { ゃ: "や", ゅ: "ゆ", ょ: "よ" };
const OU = "おこそとのほもよろごぞどぼぽょゅうくすつぬふむゆるぐずづぶぷ";
const GEMINATE = /[かきくけこさしすせそたちつてとぱぴぷぺぽ]/;

function mutate(r: string): string[] {
  const c = [...r];
  const out = new Set<string>();
  const put = (a: string[]) => {
    const x = a.join("");
    if (x !== r && !/[ぢづ]/.test(x) && !/^[っゃゅょー]/.test(x) && !/っ$/.test(x) && !/っ[あいうえおっゃゅょ]/.test(x)) out.add(x);
  };
  c.forEach((ch, i) => {
    if (DK[ch]) { const a = c.slice(); a[i] = DK[ch]; put(a); }
    if (ch === "ゅ" || ch === "ょ") { const a = c.slice(); a[i] = ch === "ゅ" ? "ょ" : "ゅ"; put(a); }
    if (ch === "い" && i > 0 && "えけせてねへめれげぜでべぺ".includes(c[i - 1])) put(c.filter((_, j) => j !== i));
    if (i > 0 && ch === "い" && "あかさたなはまやらわがざだばぱ".includes(c[i - 1])) { const a = c.slice(); a[i] = "え"; put(a); }
    if (ch === "ん" && i < c.length - 1) put(c.filter((_, j) => j !== i));
    if (i > 0 && ch === c[i - 1] && "あいうえお".includes(ch)) put(c.filter((_, j) => j !== i));
    if (UD[ch]) { const a = c.slice(); a[i] = UD[ch]; put(a); }
    if (ch === "ぢ" || ch === "づ") return;
    if (ch === "う" && i > 0 && OU.includes(c[i - 1])) put(c.filter((_, j) => j !== i));
    if (i < c.length - 1 && ch !== "う" && OU.includes(ch) && !"うんっ".includes(c[i + 1]) && !SM[c[i + 1]]) {
      const a = c.slice(); a.splice(i + 1, 0, "う"); put(a);
    }
    if (ch === "っ") { const a = c.slice(); a[i] = "つ"; put(a); put(c.filter((_, j) => j !== i)); }
    if (SM[ch]) { const a = c.slice(); a[i] = SM[ch]; put(a); }
    if (i > 0 && i < c.length - 1 && /[くきちつ]/.test(ch) && GEMINATE.test(c[i + 1])) { const a = c.slice(); a[i] = "っ"; put(a); }
  });
  return [...out];
}

/* ---------- JLPT-style wrong kanji (問題2) ---------- */
const LOOK = ["待持特", "険検験", "復複", "責積績", "識職織", "未末", "間問聞", "側測則", "低底", "健建", "案安", "温湿", "痛病疲", "遅違", "情清晴精静", "講構", "適敵", "録緑", "鳴鳥", "祖組相", "官館管", "怒努", "幸辛", "際祭", "議義", "解改", "決結", "輸論", "求球救", "働動", "園遠", "員貝", "借昔", "困因", "式試", "到倒", "暮墓", "授受", "票標", "貧貨", "若苦", "勤動", "絵給", "係系", "断継", "残浅", "役投", "徒走", "頭題", "増憎"];
const LK: Record<string, string> = {};
LOOK.forEach((g) => [...g].forEach((ch) => (LK[ch] = (LK[ch] || "") + g.replace(ch, ""))));

function makeKanjiTools(D: Kanji[]) {
  const byK = new Map(D.map((d) => [d.k, d]));
  const onOf = (k: string) =>
    (byK.get(k)?.on || "").split("、").map((o) => o.replace(/\s*\(.*\)/, "").trim()).filter((o) => o && o !== "–");
  const ON: Record<string, string[]> = {};
  D.forEach((d) => onOf(d.k).forEach((o) => (ON[o] = ON[o] || []).push(d.k)));
  const allWords = D.flatMap((d) => [...d.ex, ...(d.u || [])]);
  const real = new Set([...allWords.map((e) => e[0]), ...D.map((d) => parseS(d.s)?.w).filter(Boolean) as string[]]);
  const readings = [...new Set(allWords.map((e) => e[1]))];

  const fakeSpellings = (w: string): string[] => {
    const chars = [...w];
    const out = new Set<string>();
    chars.forEach((ch, i) => {
      if (/[ぁ-んァ-ン]/.test(ch)) return;
      const subs = new Set([...(LK[ch] || "")]);
      onOf(ch).forEach((o) => (ON[o] || []).forEach((x) => x !== ch && subs.add(x)));
      subs.forEach((x) => {
        const a = chars.slice(); a[i] = x;
        const f = a.join("");
        if (!real.has(f)) out.add(f);
      });
    });
    if (out.size < 3) {
      const idx = chars.findIndex((ch) => byK.has(ch));
      const tk = chars[idx];
      const td = byK.get(tk);
      if (td) {
        const kata = (ch: string) => String.fromCharCode(ch.charCodeAt(0) + 96);
        const heads = new Set([...onOf(tk).map((o) => o[0]), ...td.kun.split("、").map((x) => x.trim()[0]).filter((x) => x && x !== "–")]);
        const near = D.filter((x) => x.k !== tk && (onOf(x.k).some((o) => heads.has(o[0])) || x.kun.split("、").some((y) => { const h = y.trim()[0]; return !!h && (heads.has(h) || heads.has(kata(h))); })));
        for (const x of shuffle(near.length >= 3 ? near : D.filter((y) => y.k !== tk))) {
          if (out.size >= 3) break;
          const a = chars.slice(); a[idx] = x.k;
          const f = a.join("");
          if (!real.has(f)) out.add(f);
        }
      }
    }
    return [...out];
  };

  const wrongReadings = (ans: string): string[] => {
    const tr = pick(mutate(ans), 3);
    if (tr.length < 3) {
      const near = readings.filter((r) => r !== ans && !tr.includes(r) && Math.abs(r.length - ans.length) <= 1 && r[0] === ans[0]);
      tr.push(...pick(near, 3 - tr.length));
    }
    if (tr.length < 3) tr.push(...pick(readings.filter((r) => r !== ans && !tr.includes(r)), 3 - tr.length));
    return tr;
  };
  return { fakeSpellings, wrongReadings };
}

const QHEAD: Record<QType, [string, string]> = {
  read: ["問題1", "＿＿＿のことばの読み方として最もよいものを、1・2・3・4から一つえらびなさい。"],
  write: ["問題2", "＿＿＿のことばを漢字で書くとき、最もよいものを、1・2・3・4から一つえらびなさい。"],
  mean: ["Meaning", "Choose the meaning of the kanji."],
};
const QMODES: [QMode, string][] = [
  ["read", "問題1 漢字読み: kanji → hiragana"],
  ["write", "問題2 表記: hiragana → kanji"],
  ["mix", "問題1 + 問題2 mixed"],
  ["mean", "Kanji → meaning"],
];

/* ---------- Component ---------- */
export default function KanjiStudy({ embedded = false }: { embedded?: boolean }) {
  const [D, setD] = useState<Kanji[] | null>(null);
  const [error, setError] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [batch, setBatch] = useState("all");
  const [view, setView] = useState<View>("cards");
  const [unknownOnly, setUnknownOnly] = useState(false);
  const [doShuffle, setDoShuffle] = useState(true);
  const [deck, setDeck] = useState<Kanji[]>([]);
  const [di, setDi] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [qmode, setQmode] = useState<QMode>("read");
  const [q, setQ] = useState<Question | null>(null);
  const [score, setScore] = useState({ r: 0, t: 0 });
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Kanji | null>(null);

  // Load data + saved progress
  useEffect(() => {
    setKnown(new Set(load<string[]>("known", [])));
    setBatch(load("batch", "all"));
    setQmode(load<QMode>("qmode3", "read"));
    const h = embedded ? load<string>("view", "cards") : location.hash.slice(1);
    if (h === "cards" || h === "quiz" || h === "browse") setView(h);
    fetch(DATA_URL)
      .then((r) => r.json())
      .then((d: Kanji[]) => setD(d))
      .catch(() => setError(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tools = useMemo(() => (D ? makeKanjiTools(D) : null), [D]);
  const n3Count = useMemo(() => (D ? D.filter((d) => !d.x).length : 0), [D]);

  const pool = useMemo(() => {
    if (!D) return [];
    let p = D;
    if (batch === "extra") p = p.filter((d) => d.x);
    else if (batch === "pdf") p = p.filter((d) => d.u?.length);
    else if (batch !== "all") {
      const [a, b] = batch.split("-").map(Number);
      p = p.filter((d) => d.n >= a && d.n <= b);
    }
    if (unknownOnly) p = p.filter((d) => !known.has(d.k));
    return p;
  }, [D, batch, unknownOnly, known]);

  const toggleKnown = useCallback((k: string, force?: boolean) => {
    setKnown((prev) => {
      const next = new Set(prev);
      const on = force ?? !next.has(k);
      if (on) next.add(k); else next.delete(k);
      save("known", [...next]);
      return next;
    });
  }, []);

  /* --- Flashcards --- */
  const newDeck = useCallback(() => {
    setDeck(doShuffle ? shuffle(pool) : pool.slice());
    setDi(0);
    setFlipped(false);
  }, [pool, doShuffle]);
  useEffect(() => { newDeck(); }, [D, batch, unknownOnly, doShuffle]); // eslint-disable-line react-hooks/exhaustive-deps

  const answerCard = (knowIt: boolean) => {
    const d = deck[di];
    if (!d) return;
    toggleKnown(d.k, knowIt);
    setDi((i) => i + 1);
    setFlipped(false);
  };

  /* --- Quiz --- */
  const newQ = useCallback(
    (mode: QMode = qmode) => {
      if (!D || !tools) return;
      const t: QType = mode === "mix" ? (Math.random() < 0.5 ? "read" : "write") : mode;
      const ok = pool.filter((d) => (d.s && batch !== "pdf") || d.u?.length);
      const src = t === "mean" ? pool : ok;
      if (!src.length) { setQ(null); return; }
      const d = pick(src, 1)[0];
      const useS = !!d.s && batch !== "pdf" && (!d.u?.length || Math.random() < 0.6);
      const u = t === "mean" || useS ? null : pick(d.u || [], 1)[0];
      const S = u ? { pre: "", w: u[0], r: u[1], post: "", m: u[2] } : parseS(d.s) || { pre: "", w: d.k, r: "", post: "" };
      let ans: string, wrong: string[];
      if (t === "read") { ans = S.r; wrong = tools.wrongReadings(ans); }
      else if (t === "write") { ans = S.w; wrong = pick(tools.fakeSpellings(ans), 3); }
      else { ans = d.m; wrong = pick(D.filter((x) => x.k !== d.k).map((x) => x.m), 3); }
      setQ((prev) => ({ t, d, ...S, ans, opts: shuffle([...new Set([ans, ...wrong])].slice(0, 4)), n: (prev?.n || 0) + 1 }));
    },
    [D, tools, pool, batch, qmode]
  );
  useEffect(() => { if (view === "quiz") newQ(); }, [view, D, batch, unknownOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  const answerQ = (o: string) => {
    if (!q || q.picked) return;
    setScore((s) => ({ r: s.r + (o === q.ans ? 1 : 0), t: s.t + 1 }));
    setQ({ ...q, picked: o });
  };

  /* --- Navigation & keyboard --- */
  const go = (v: View) => {
    setView(v);
    if (embedded) save("view", v);
    else history.replaceState(null, "", "#" + v);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.matches("input,select,textarea") || detail) return;
      if (view === "quiz" && q) {
        if (!q.picked && /^[1-4]$/.test(e.key) && q.opts[+e.key - 1]) answerQ(q.opts[+e.key - 1]);
        else if (q.picked && e.key === "Enter" && el.tagName !== "BUTTON") newQ();
      } else if (view === "cards") {
        if (e.key === " ") { e.preventDefault(); setFlipped(true); }
        else if (flipped && e.key === "ArrowRight") answerCard(true);
        else if (flipped && e.key === "ArrowLeft") answerCard(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const chooseBatch = (b: string) => { setBatch(b); save("batch", b); setScore({ r: 0, t: 0 }); };

  /* ---------- Render ---------- */
  if (error) return <p className={styles.empty}>Could not load the kanji data. Please reload the page.</p>;
  if (!D) return <p className={styles.empty}>Loading kanji…</p>;

  const batches = ["all"];
  for (let a = 1; a <= n3Count; a += BATCH_SIZE) batches.push(`${a}-${Math.min(a + BATCH_SIZE - 1, n3Count)}`);
  batches.push("pdf", "extra");
  const label = (b: string) =>
    b === "all" ? `All ${D.length}` : b === "pdf" ? "My list words" : b === "extra" ? `Extra kanji (${D.length - n3Count})` : b.replace("-", "–");
  const wordCount = D.reduce((a, d) => a + (d.u?.length || 0), 0);
  const card = deck[di];

  return (
    <div className={`${styles.root} ${embedded ? styles.embedded : styles.page}`}>
      <style>{KANJI_CSS}</style>
      <header className={styles.head}>
        <p className={styles.kicker}>JLPT N3 · 漢字</p>
        {embedded ? (
          <h2 className={styles.title}>Kanji <span>Study</span></h2>
        ) : (
          <h1 className={styles.title}>Kanji <span>Study</span></h1>
        )}
        <p className={styles.sub}>
          {n3Count} N3 kanji + {D.length - n3Count} extra kanji · {wordCount} words from your list · JLPT-style quizzes
        </p>
        <div className={styles.prog}>
          <div className={styles.bar}><i style={{ width: `${(known.size / D.length) * 100}%` }} /></div>
          <span>{known.size} / {D.length} known</span>
        </div>
      </header>

      <nav className={styles.tabs} aria-label="Study mode">
        {(["cards", "quiz", "browse"] as View[]).map((v) => (
          <button key={v} className={view === v ? styles.on : ""} onClick={() => go(v)}>
            {v === "cards" ? "Flashcards" : v === "quiz" ? "Quiz" : "Browse"}
          </button>
        ))}
      </nav>

      <div className={styles.chips}>
        {batches.map((b) => (
          <button key={b} className={`${styles.chip} ${b === batch ? styles.chipOn : ""} ${b === "pdf" || b === "extra" ? styles.mine : ""}`} onClick={() => chooseBatch(b)}>
            {label(b)}
          </button>
        ))}
      </div>
      <div className={styles.opts}>
        <label><input type="checkbox" checked={unknownOnly} onChange={(e) => setUnknownOnly(e.target.checked)} /> Only kanji I don&apos;t know yet</label>
        <label><input type="checkbox" checked={doShuffle} onChange={(e) => setDoShuffle(e.target.checked)} /> Shuffle</label>
      </div>

      {/* Flashcards */}
      {view === "cards" &&
        (!deck.length ? (
          <p className={styles.empty}>No kanji in this set{unknownOnly ? " — you know them all! Untick the box above to review." : "."}</p>
        ) : !card ? (
          <div className={styles.sheet} style={{ display: "block", textAlign: "center" }}>
            <p className={styles.meaning}>Set finished</p>
            <p className={styles.sub}>{deck.filter((d) => known.has(d.k)).length} of {deck.length} marked as known.</p>
            <button className={`${styles.btn} ${styles.primary}`} onClick={newDeck}>Go again</button>
          </div>
        ) : (
          <div className={styles.sheet}>
            <div>
              <button className={styles.sq} onClick={() => setFlipped(true)} aria-label="Flip card">
                <span className={styles.kan}>{card.k}</span>
                {known.has(card.k) && <span className={styles.stamp}>覚え<br />た</span>}
              </button>
              <p className={styles.hint}>Card {di + 1} of {deck.length} · tap the square or press Space to flip</p>
            </div>
            <div>
              {flipped ? <Info d={card} /> : (
                <>
                  <p className={styles.meaning}>What do you remember?</p>
                  <p className={styles.sub} style={{ marginBottom: 16 }}>Recall the meaning, the on’yomi and kun’yomi, and a word that uses it, then flip.</p>
                </>
              )}
              <div className={styles.row}>
                <button className={styles.btn} onClick={() => { if (di > 0) { setDi(di - 1); setFlipped(false); } }}>← Back</button>
                {flipped ? (
                  <>
                    <button className={`${styles.btn} ${styles.red}`} onClick={() => answerCard(false)}>Still learning</button>
                    <button className={`${styles.btn} ${styles.primary}`} onClick={() => answerCard(true)}>I know it ✓</button>
                  </>
                ) : (
                  <button className={`${styles.btn} ${styles.primary}`} onClick={() => setFlipped(true)}>Show answer</button>
                )}
              </div>
            </div>
          </div>
        ))}

      {/* Quiz */}
      {view === "quiz" && (
        <>
          <div className={styles.row} style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <label className={styles.selLabel}>
              Question type
              <select value={qmode} onChange={(e) => { const m = e.target.value as QMode; setQmode(m); save("qmode3", m); newQ(m); }}>
                {QMODES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <span className={styles.score}>Score <b>{score.r}</b> / {score.t}</span>
          </div>
          {!q ? <p className={styles.empty}>No words in this set.</p> : (
            <div className={styles.paper}>
              <p className={styles.mon}><b>{QHEAD[q.t][0]}</b> {QHEAD[q.t][1]}</p>
              <div className={styles.qline}>
                <span className={styles.qno}>{q.n}</span>
                {q.t === "mean" ? (
                  <div className={styles.sq} style={{ maxWidth: 220 }}><span className={styles.kan}>{q.d.k}</span></div>
                ) : (
                  <p className={styles.sent}>{q.pre}<u>{q.t === "read" ? q.w : q.r}</u>{q.post}</p>
                )}
              </div>
              <div className={styles.choices}>
                {q.opts.map((o, i) => (
                  <button key={o} disabled={!!q.picked} onClick={() => answerQ(o)}
                    className={`${styles.ans} ${q.picked ? (o === q.ans ? styles.good : o === q.picked ? styles.bad : "") : ""}`}>
                    <span className={styles.cn}>{i + 1}</span>{o}
                  </button>
                ))}
              </div>
              {q.picked ? (
                <>
                  <div className={`${styles.fb} ${q.picked === q.ans ? styles.fbGood : styles.fbBad}`}>
                    {q.picked === q.ans ? "正解！ Correct." : <>Not quite. The answer is <b>{q.opts.indexOf(q.ans) + 1}. {q.ans}</b></>}
                    <br />
                    <span className={styles.jp}>{q.w}</span>{q.r && <> = {q.r}</>}{q.m && <> · {q.m}</>}
                    {q.t === "write" && " · the other choices use wrong kanji (same sound or similar shape)"}
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.kanSmall}>{q.d.k}</span>
                    <Info d={q.d} />
                  </div>
                  <button className={`${styles.btn} ${styles.primary}`} onClick={() => newQ()} autoFocus>Next question →</button>
                </>
              ) : <p className={styles.hint} style={{ textAlign: "left" }}>Tip: press 1–4 on a keyboard</p>}
            </div>
          )}
        </>
      )}

      {/* Browse */}
      {view === "browse" && (
        <Browse D={D} pool={pool} search={search} setSearch={setSearch} known={known} onOpen={setDetail} />
      )}

      {detail && (
        <div className={styles.overlay} onClick={() => setDetail(null)} role="dialog" aria-modal="true">
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <div>
              <div className={styles.sq}><span className={styles.kan} style={{ fontSize: 110 }}>{detail.k}</span></div>
              <p className={styles.hint}>{detail.x ? "Extra kanji" : `#${detail.n}`}</p>
            </div>
            <div>
              <Info d={detail} />
              <div className={styles.row}>
                <button className={`${styles.btn} ${known.has(detail.k) ? "" : styles.primary}`} onClick={() => toggleKnown(detail.k)}>
                  {known.has(detail.k) ? "Unmark known" : "Mark as known"}
                </button>
                <button className={styles.btn} onClick={() => setDetail(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className={styles.foot}>
        Kanji set: the widely used Tanos (J. Waller) unofficial N3 list, new-at-N3 kanji only (N5/N4 excluded); the JLPT has
        published no official list since 2010. Words from your own list are shown in red with Indonesian meanings. Progress is
        saved in this browser only.
      </p>
    </div>
  );
}

/* ---------- Sub-components ---------- */
function Info({ d }: { d: Kanji }) {
  return (
    <div>
      <p className={styles.meaning}>{d.m}</p>
      <dl className={styles.rd}>
        <dt>On&apos;yomi</dt><dd>{d.on}</dd>
        <dt>Kun&apos;yomi</dt><dd>{d.kun}</dd>
      </dl>
      <div className={styles.exs}>
        {d.ex.map((e) => (
          <div key={e[0]} className={styles.ex}>
            <span className={styles.w}>{e[0]}</span><span className={styles.r}>{e[1]}</span><span className={styles.m}>{e[2]}</span>
          </div>
        ))}
      </div>
      {!!d.u?.length && (
        <>
          <p className={styles.ulab}>From your list (Bahasa Indonesia)</p>
          <div className={styles.exs}>
            {d.u.map((e) => (
              <div key={e[0] + e[1]} className={`${styles.ex} ${styles.exMine}`}>
                <span className={styles.w}>{e[0]}</span><span className={styles.r}>{e[1]}</span><span className={styles.m}>{e[2]}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Browse({ D, pool, search, setSearch, known, onOpen }: {
  D: Kanji[]; pool: Kanji[]; search: string; setSearch: (s: string) => void; known: Set<string>; onOpen: (d: Kanji) => void;
}) {
  const s = search.trim().toLowerCase();
  const list = s
    ? D.filter((d) => [d.k, d.m, d.on, d.kun, ...d.ex.flat(), ...(d.u || []).flat()].join(" ").toLowerCase().includes(s))
    : pool;
  return (
    <>
      <input className={styles.search} type="search" value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search kanji, meaning, reading or word (e.g. 予約, よやく, police)" />
      {list.length ? (
        <div className={styles.grid}>
          {list.map((d) => (
            <button key={d.k} className={styles.tile} onClick={() => onOpen(d)}>
              <span className={styles.no}>{d.x ? "+" : d.n}</span>
              {known.has(d.k) && <span className={styles.seal}>覚</span>}
              <span className={styles.tileKan}>{d.k}</span>
              <small>{d.m.split(",")[0]}</small>
            </button>
          ))}
        </div>
      ) : <p className={styles.empty}>No matches.</p>}
    </>
  );
}

/* ---------- Styles ---------- */
const KANJI_CSS = `
/* Kanji Study — matches Wisdom Echo's dark #1A1A1A / red #E52B2B look */
.ks-root {
  --bg: #1a1a1a;
  --card: #222222;
  --card2: #2a2a2a;
  --line: #333333;
  --ink: #ffffff;
  --soft: #888888;
  --red: #e52b2b;
  --red-dark: #c41e1e;
  --redbg: #3a1d1d;
  --ok: #3ecf8e;
  --okbg: #16301f;
  --grid: #5a2a2a;
  --jp: "Hiragino Mincho ProN", "Yu Mincho", "YuMincho", "Noto Serif JP", "Noto Serif CJK JP", "MS Mincho", serif;
  --jp-sans: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", "Noto Sans JP", "Noto Sans CJK JP", sans-serif;
  color: var(--ink);
  font-family: Arial, Helvetica, var(--jp-sans);
}
.ks-root * { box-sizing: border-box; min-width: 0; }
.ks-page { max-width: 1200px; margin: 0 auto; padding: 120px max(5vw, 16px) 64px; }
.ks-embedded { margin-top: 40px; background: #242424; border: 1px solid var(--line); border-top: 4px solid var(--red); padding: clamp(18px, 3vw, 32px); scroll-margin-top: 24px; }
.ks-embedded .ks-title { font-size: clamp(26px, 4vw, 40px); }
.ks-embedded .ks-sheet, .ks-embedded .ks-paper, .ks-embedded .ks-tile, .ks-embedded .ks-chip:not(.ks-chipOn), .ks-embedded .ks-search { background: #1d1d1d; }
.ks-embedded .ks-ans, .ks-embedded .ks-btn:not(.ks-primary):not(.ks-red) { background: #2a2a2a; }

/* Header */
.ks-head { margin-bottom: 8px; }
.ks-kicker { color: var(--red); font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; margin: 0 0 8px; }
.ks-title { font-size: clamp(36px, 6vw, 64px); line-height: 1; font-weight: 900; text-transform: uppercase; margin: 0 0 10px; letter-spacing: -.01em; }
.ks-title span { color: var(--red); }
.ks-sub { color: var(--soft); font-size: 15px; margin: 0; }
.ks-prog { display: flex; align-items: center; gap: 12px; margin: 16px 0 4px; font-size: 14px; color: var(--soft); }
.ks-bar { flex: 1; max-width: 420px; height: 8px; background: var(--line); overflow: hidden; }
.ks-bar i { display: block; height: 100%; background: var(--red); transition: width .4s; }

/* Tabs, chips, options */
.ks-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--line); margin: 20px 0 16px; flex-wrap: wrap; }
.ks-tabs button { background: none; border: 0; color: var(--soft); font: inherit; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; font-size: 14px; padding: 12px 16px; min-height: 44px; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -1px; }
.ks-tabs button:hover { color: var(--ink); }
.ks-tabs .ks-on { color: var(--ink); border-color: var(--red); }
.ks-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.ks-chip { border: 1px solid var(--line); background: var(--card); color: var(--ink); padding: 7px 14px; font: inherit; font-size: 14px; min-height: 38px; cursor: pointer; }
.ks-chip:hover { border-color: var(--soft); }
.ks-chipOn { background: var(--ink); color: #111; border-color: var(--ink); }
.ks-mine { border-color: var(--red); color: var(--red); }
.ks-mine.ks-chipOn { background: var(--red); color: #fff; }
.ks-opts { display: flex; gap: 18px; flex-wrap: wrap; font-size: 14px; color: var(--soft); margin-bottom: 16px; }
.ks-opts label { display: flex; gap: 8px; align-items: center; min-height: 40px; cursor: pointer; }
.ks-opts input { accent-color: var(--red); width: 16px; height: 16px; }

/* Buttons */
.ks-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.ks-btn { border: 1px solid var(--line); background: var(--card2); color: var(--ink); padding: 11px 20px; min-height: 44px; font: inherit; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; cursor: pointer; transition: background .2s; }
.ks-btn:hover { background: #333; }
.ks-primary { background: var(--red); border-color: var(--red); }
.ks-primary:hover { background: var(--red-dark); }
.ks-red { background: transparent; border-color: var(--red); color: var(--red); }
.ks-root button:focus-visible, .ks-root select:focus-visible, .ks-root input:focus-visible { outline: 2px solid var(--red); outline-offset: 2px; }

/* Flashcard sheet with genkō-yōshi practice square */
.ks-sheet { display: grid; grid-template-columns: minmax(0, 340px) minmax(0, 1fr); gap: clamp(16px, 4vw, 40px); align-items: start; background: var(--card); border: 1px solid var(--line); padding: clamp(16px, 3vw, 32px); }
.ks-sq { position: relative; width: 100%; aspect-ratio: 1; border: 2px solid var(--grid); display: grid; place-items: center; cursor: pointer; color: var(--ink); padding: 0;
  background:
    repeating-linear-gradient(90deg, var(--grid) 0 6px, transparent 6px 12px) center / 100% 1px no-repeat,
    repeating-linear-gradient(0deg, var(--grid) 0 6px, transparent 6px 12px) center / 1px 100% no-repeat,
    #1d1d1d; }
.ks-kan { position: relative; font-family: var(--jp); font-size: clamp(120px, 24vw, 210px); line-height: 1; font-weight: 500; }
.ks-stamp { position: absolute; right: 10px; bottom: 10px; width: 54px; height: 54px; border: 3px solid var(--red); color: var(--red); display: grid; place-items: center; font: 700 15px/1.05 var(--jp); transform: rotate(-8deg); text-align: center; animation: ks-stamp .25s ease-out; }
@keyframes ks-stamp { from { transform: rotate(-8deg) scale(1.6); opacity: 0; } }
.ks-hint { font-size: 13px; color: var(--soft); text-align: center; margin: 8px 0 0; }

/* Kanji info */
.ks-meaning { font-size: 24px; font-weight: 800; margin: 0 0 10px; line-height: 1.25; }
.ks-rd { display: grid; grid-template-columns: auto 1fr; gap: 4px 14px; margin: 0 0 16px; font-size: 17px; font-family: var(--jp-sans); }
.ks-rd dt { color: var(--soft); font-size: 13px; padding-top: 3px; text-transform: uppercase; letter-spacing: .06em; font-family: Arial, Helvetica, sans-serif; }
.ks-rd dd { margin: 0; }
.ks-exs { display: grid; gap: 8px; margin-bottom: 16px; }
.ks-ex { border-left: 3px solid #555; padding: 3px 0 3px 12px; }
.ks-exMine { border-left-color: var(--red); }
.ks-w { font-family: var(--jp); font-size: 22px; margin-right: 8px; }
.ks-r { color: #f3b0b0; font-family: var(--jp-sans); font-size: 15px; }
.ks-exMine .ks-w, .ks-exMine .ks-r { color: #ff8a8a; }
.ks-m { display: block; color: var(--soft); font-size: 14px; }
.ks-ulab { font-size: 12px; font-weight: 700; color: var(--red); text-transform: uppercase; letter-spacing: .08em; margin: 0 0 6px; }
.ks-jp { font-family: var(--jp-sans); }

/* Quiz — laid out like the JLPT test booklet */
.ks-selLabel { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; font-size: 14px; color: var(--soft); }
.ks-selLabel select { background: var(--card); color: var(--ink); border: 1px solid var(--line); padding: 8px 10px; min-height: 42px; font: inherit; font-family: var(--jp-sans); }
.ks-score { font-size: 15px; color: var(--soft); }
.ks-score b { color: var(--ink); font-size: 22px; }
.ks-paper { background: var(--card); border: 1px solid var(--line); padding: clamp(16px, 3vw, 32px); max-width: 880px; }
.ks-mon { font-family: var(--jp-sans); font-size: 16px; margin: 0 0 22px; line-height: 1.7; }
.ks-mon b { color: var(--red); margin-right: 8px; }
.ks-qline { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 20px; }
.ks-qno { flex: none; border: 1.5px solid var(--ink); min-width: 30px; height: 30px; display: grid; place-items: center; font-weight: 700; font-size: 15px; margin-top: 7px; padding: 0 4px; }
.ks-sent { font-family: var(--jp-sans); font-size: clamp(22px, 3.4vw, 28px); margin: 0; line-height: 1.7; }
.ks-sent u { text-decoration: none; border-bottom: 2px solid var(--red); padding-bottom: 1px; }
.ks-choices { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px; }
.ks-ans { display: flex; align-items: center; gap: 10px; text-align: left; min-height: 60px; border: 1px solid var(--line); background: var(--card2); color: var(--ink); font-family: var(--jp-sans); font-size: 19px; padding: 8px 12px; cursor: pointer; }
.ks-ans:hover:not(:disabled) { border-color: var(--red); }
.ks-ans:disabled { cursor: default; }
.ks-cn { flex: none; font-size: 13px; font-weight: 700; color: var(--soft); }
.ks-good { border-color: var(--ok); background: var(--okbg); }
.ks-bad { border-color: var(--red); background: var(--redbg); }
.ks-fb { padding: 12px 14px; margin-bottom: 14px; font-size: 15px; line-height: 1.6; }
.ks-fbGood { background: var(--okbg); border-left: 3px solid var(--ok); }
.ks-fbBad { background: var(--redbg); border-left: 3px solid var(--red); }
.ks-infoRow { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 16px; align-items: start; }
.ks-kanSmall { font-family: var(--jp); font-size: 56px; line-height: 1; }

/* Browse */
.ks-search { width: 100%; max-width: 520px; padding: 12px 14px; border: 1px solid var(--line); background: var(--card); color: var(--ink); font: inherit; font-size: 16px; }
.ks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; margin-top: 14px; }
.ks-tile { position: relative; background: var(--card); border: 1px solid var(--line); padding: 10px 6px 8px; text-align: center; cursor: pointer; color: var(--ink); font: inherit; transition: border-color .2s; }
.ks-tile:hover { border-color: var(--red); }
.ks-tileKan { display: block; font-family: var(--jp); font-size: 40px; line-height: 1.1; }
.ks-tile small { display: block; font-size: 12px; color: var(--soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ks-no { position: absolute; top: 4px; left: 6px; font-size: 11px; color: var(--soft); }
.ks-seal { position: absolute; top: 5px; right: 5px; width: 18px; height: 18px; background: var(--red); color: #fff; font: 11px/18px var(--jp); }

/* Detail dialog */
.ks-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, .75); display: grid; place-items: center; padding: 16px; z-index: 60; }
.ks-dialog { background: var(--card); border: 1px solid var(--line); width: min(720px, 100%); max-height: 90vh; overflow: auto; padding: clamp(16px, 3vw, 28px); display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 20px; }

.ks-empty { color: var(--soft); padding: 30px 0; }
.ks-foot { color: #666; font-size: 13px; margin-top: 32px; max-width: 70ch; line-height: 1.6; }

@media (max-width: 760px) {
  .ks-sheet { grid-template-columns: minmax(0, 1fr); }
  .ks-sheet .ks-sq { max-width: 220px; margin: 0 auto; }
  .ks-sheet .ks-kan { font-size: 150px; }
  .ks-choices { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ks-ans { font-size: 17px; }
  .ks-dialog { grid-template-columns: minmax(0, 1fr); }
  .ks-dialog .ks-sq { max-width: 150px; }
}
@media (max-width: 420px) {
  .ks-choices { grid-template-columns: minmax(0, 1fr); }
}
@media (prefers-reduced-motion: reduce) {
  .ks-stamp { animation: none; }
  .ks-bar i { transition: none; }
}
`;
