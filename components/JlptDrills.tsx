"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

/*
  JLPT N3 drills (original questions, official test formats):
  - <VocabDrill />   文字・語彙 問題3 文脈規定, 問題4 言い換え類義, 問題5 用法
  - <GrammarDrill /> 文法 問題1 文法形式の判断, 問題2 文の組み立て, 問題3 文章の文法
  - <ListeningDrill /> 聴解 問題1–5 (audio from Google Drive, or the browser's Japanese voice)
  - <ReadingDrill /> 読解 問題4 内容理解(短文), 問題5 (中文), 問題6 (長文), 問題7 情報検索
  Data: /public/jlpt/n3-vocab.json, n3-grammar.json and n3-reading.json
  Every question stores the correct option first ("a": 0); options are shuffled on screen.
*/

type VocabQ = { t: "ctx" | "para" | "use"; q: string; o: string[]; a: number; e: string };
type RQ = { q: string; o: string[]; a: number; e: string };
type Passage = {
  id: string;
  k: "short" | "medium" | "long" | "info";
  title: string;
  text?: string;
  table?: { head: string[]; rows: string[][] };
  notes?: string[];
  qs: RQ[];
};

const shuffle = <T,>(a: T[]): T[] => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
const load = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem("jd_" + key);
    return v == null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
};
const save = (key: string, v: unknown) => {
  try {
    localStorage.setItem("jd_" + key, JSON.stringify(v));
  } catch {
    /* storage unavailable */
  }
};
function useJson<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    fetch(url)
      .then((r) => r.json())
      .then((d: T) => setData(d))
      .catch(() => setError(true));
  }, [url]);
  return { data, error };
}

/* Show "[underlined]" parts of a sentence as underlined text */
function Underline({ s }: { s: string }) {
  const parts = s.split(/(\[[^\]]+\])/);
  return (
    <>
      {parts.map((p, i) => (p.startsWith("[") ? <u key={i}>{p.slice(1, -1)}</u> : <span key={i}>{p}</span>))}
    </>
  );
}

function Frame({ kicker, title, sub, children }: { kicker: string; title: [string, string]; sub: string; children: ReactNode }) {
  return (
    <div className="jd-root">
      <style>{DRILL_CSS}</style>
      <p className="jd-kicker">{kicker}</p>
      <h2 className="jd-title">
        {title[0]} <span>{title[1]}</span>
      </h2>
      <p className="jd-sub">{sub}</p>
      {children}
    </div>
  );
}

/* ================= Vocabulary ================= */
const VHEAD: Record<VocabQ["t"], [string, string, string]> = {
  ctx: ["問題3", "文脈規定", "（　　）に入れるのに最もよいものを、1・2・3・4から一つえらびなさい。"],
  para: ["問題4", "言い換え類義", "＿＿＿の言葉に意味が最も近いものを、1・2・3・4から一つえらびなさい。"],
  use: ["問題5", "用法", "つぎの言葉の使い方として最もよいものを、1・2・3・4から一つえらびなさい。"],
};
type VMode = VocabQ["t"] | "all";

export function VocabDrill() {
  const { data, error } = useJson<VocabQ[]>("/jlpt/n3-vocab.json");
  const [mode, setMode] = useState<VMode>("all");
  const [deck, setDeck] = useState<{ item: VocabQ; opts: string[] }[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<VocabQ[]>([]);

  useEffect(() => setMode(load<VMode>("vmode", "all")), []);

  const start = useCallback(
    (m: VMode, only?: VocabQ[]) => {
      if (!data) return;
      const list = only ?? data.filter((q) => m === "all" || q.t === m);
      setDeck(shuffle(list).map((item) => ({ item, opts: shuffle(item.o) })));
      setI(0);
      setPicked(null);
      setScore(0);
      setWrong([]);
    },
    [data]
  );
  useEffect(() => start(mode), [data, mode, start]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: data?.length || 0 };
    data?.forEach((q) => (c[q.t] = (c[q.t] || 0) + 1));
    return c;
  }, [data]);

  const cur = deck[i];
  const answer = (o: string) => {
    if (!cur || picked) return;
    setPicked(o);
    if (o === cur.item.o[cur.item.a]) setScore((s) => s + 1);
    else setWrong((w) => [...w, cur.item]);
  };
  const next = () => {
    setI((n) => n + 1);
    setPicked(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).matches("input,select,textarea")) return;
      if (cur && !picked && /^[1-4]$/.test(e.key)) answer(cur.opts[+e.key - 1]);
      else if (cur && picked && e.key === "Enter" && (e.target as HTMLElement).tagName !== "BUTTON") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <Frame kicker="JLPT N3 · 文字・語彙" title={["Vocabulary", "Drill"]} sub="Original practice questions in the official N3 formats (問題3–5). Kanji reading and writing (問題1–2) are in Kanji.">
      {error && <p className="jd-empty">Could not load the questions. Please reload the page.</p>}
      {!data && !error && <p className="jd-empty">Loading…</p>}
      {data && (
        <>
          <div className="jd-chips">
            {(["all", "ctx", "para", "use"] as VMode[]).map((m) => (
              <button key={m} className={`jd-chip ${m === mode ? "jd-on" : ""}`} onClick={() => { setMode(m); save("vmode", m); }}>
                {m === "all" ? "All" : `${VHEAD[m][0]} ${VHEAD[m][1]}`} <small>{counts[m] || 0}</small>
              </button>
            ))}
          </div>

          {cur ? (
            <div className="jd-paper">
              <div className="jd-top">
                <span>Question {i + 1} / {deck.length}</span>
                <span>Score <b>{score}</b> / {i + (picked ? 1 : 0)}</span>
              </div>
              <div className="jd-bar"><i style={{ width: `${(i / deck.length) * 100}%` }} /></div>
              <p className="jd-mon"><b>{VHEAD[cur.item.t][0]}</b> {VHEAD[cur.item.t][2]}</p>
              <div className="jd-qline">
                <span className="jd-qno">{i + 1}</span>
                {cur.item.t === "use" ? (
                  <p className="jd-word">{cur.item.q}</p>
                ) : (
                  <p className="jd-sent"><Underline s={cur.item.q} /></p>
                )}
              </div>
              <div className={`jd-choices ${cur.item.t === "use" ? "jd-col" : ""}`}>
                {cur.opts.map((o, n) => {
                  const right = o === cur.item.o[cur.item.a];
                  return (
                    <button key={o} disabled={!!picked} onClick={() => answer(o)}
                      className={`jd-ans ${picked ? (right ? "jd-good" : o === picked ? "jd-bad" : "") : ""}`}>
                      <span className="jd-cn">{n + 1}</span>
                      <span>{o}</span>
                    </button>
                  );
                })}
              </div>
              {picked ? (
                <>
                  <div className={`jd-fb ${picked === cur.item.o[cur.item.a] ? "jd-fbgood" : "jd-fbbad"}`}>
                    <b>{picked === cur.item.o[cur.item.a] ? "正解！ Correct." : `Answer: ${cur.opts.indexOf(cur.item.o[cur.item.a]) + 1}. ${cur.item.o[cur.item.a]}`}</b>
                    <br />
                    {cur.item.e}
                  </div>
                  <button className="jd-btn jd-primary" onClick={next} autoFocus>Next →</button>
                </>
              ) : (
                <p className="jd-hint">Tip: press 1–4 on a keyboard</p>
              )}
            </div>
          ) : deck.length ? (
            <div className="jd-paper jd-center">
              <p className="jd-big">{score} / {deck.length}</p>
              <p className="jd-sub">{Math.round((score / deck.length) * 100)}% correct</p>
              <div className="jd-row jd-centerrow">
                <button className="jd-btn jd-primary" onClick={() => start(mode)}>Try again</button>
                {wrong.length > 0 && (
                  <button className="jd-btn" onClick={() => start(mode, wrong)}>Retry my {wrong.length} mistakes</button>
                )}
              </div>
            </div>
          ) : (
            <p className="jd-empty">No questions in this set.</p>
          )}
        </>
      )}
    </Frame>
  );
}

/* ================= Reading ================= */
const RHEAD: Record<Passage["k"], [string, string, string]> = {
  short: ["問題4", "内容理解（短文）", "つぎの文章を読んで、質問に答えなさい。答えは、1・2・3・4から最もよいものを一つえらびなさい。"],
  medium: ["問題5", "内容理解（中文）", "つぎの文章を読んで、質問に答えなさい。答えは、1・2・3・4から最もよいものを一つえらびなさい。"],
  long: ["問題6", "内容理解（長文）", "つぎの文章を読んで、質問に答えなさい。答えは、1・2・3・4から最もよいものを一つえらびなさい。"],
  info: ["問題7", "情報検索", "右のページの案内を見て、下の質問に答えなさい。答えは、1・2・3・4から最もよいものを一つえらびなさい。"],
};

export function ReadingDrill() {
  const { data, error } = useJson<Passage[]>("/jlpt/n3-reading.json");
  const [openId, setOpenId] = useState<string | null>(null);
  const [opts, setOpts] = useState<string[][]>([]);
  const [chosen, setChosen] = useState<(string | null)[]>([]);
  const [checked, setChecked] = useState(false);
  const [best, setBest] = useState<Record<string, number>>({});

  useEffect(() => setBest(load<Record<string, number>>("rbest", {})), []);

  const p = data?.find((x) => x.id === openId) || null;
  const open = (x: Passage) => {
    setOpenId(x.id);
    setOpts(x.qs.map((q) => shuffle(q.o)));
    setChosen(x.qs.map(() => null));
    setChecked(false);
    document.getElementById("study")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const check = () => {
    if (!p) return;
    const sc = p.qs.reduce((s, q, n) => s + (chosen[n] === q.o[q.a] ? 1 : 0), 0);
    setChecked(true);
    const b = { ...best, [p.id]: Math.max(best[p.id] ?? 0, sc) };
    setBest(b);
    save("rbest", b);
  };

  if (error) return <Frame kicker="JLPT N3 · 読解" title={["Reading", "Drill"]} sub=""><p className="jd-empty">Could not load the passages. Please reload the page.</p></Frame>;
  if (!data) return <Frame kicker="JLPT N3 · 読解" title={["Reading", "Drill"]} sub=""><p className="jd-empty">Loading…</p></Frame>;

  if (!p) {
    const groups = (["short", "medium", "long", "info"] as Passage["k"][]).map((k) => [k, data.filter((x) => x.k === k)] as const);
    return (
      <Frame kicker="JLPT N3 · 読解" title={["Reading", "Drill"]} sub={`${data.length} original passages, ${data.reduce((a, x) => a + x.qs.length, 0)} questions, in the four N3 reading formats.`}>
        {groups.map(([k, list]) => (
          <div key={k} className="jd-group">
            <p className="jd-ghead"><b>{RHEAD[k][0]}</b> {RHEAD[k][1]}</p>
            <div className="jd-plist">
              {list.map((x) => (
                <button key={x.id} className="jd-pcard" onClick={() => open(x)}>
                  <span className="jd-ptitle">{x.title}</span>
                  <span className="jd-pmeta">
                    {x.qs.length} question{x.qs.length > 1 ? "s" : ""}
                    {best[x.id] != null && <> · best {best[x.id]}/{x.qs.length}</>}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </Frame>
    );
  }

  const sc = p.qs.reduce((s, q, n) => s + (chosen[n] === q.o[q.a] ? 1 : 0), 0);
  const idx = data.findIndex((x) => x.id === p.id);
  const nextP = data[idx + 1];

  return (
    <Frame kicker={`JLPT N3 · 読解 · ${RHEAD[p.k][0]}`} title={[RHEAD[p.k][1], ""]} sub={RHEAD[p.k][2]}>
      <button className="jd-link" onClick={() => setOpenId(null)}>← All passages</button>
      <div className="jd-reading">
        <article className="jd-passage">
          <h3>{p.title}</h3>
          {p.text?.split("\n").map((line, n) => (line ? <p key={n}>{line}</p> : <div key={n} className="jd-gap" />))}
          {p.table && (
            <div className="jd-scroll">
              <table className="jd-table">
                <thead><tr>{p.table.head.map((h, n) => <th key={n}>{h}</th>)}</tr></thead>
                <tbody>{p.table.rows.map((r, n) => <tr key={n}>{r.map((c, m) => <td key={m}>{c}</td>)}</tr>)}</tbody>
              </table>
            </div>
          )}
          {p.notes && <ul className="jd-notes">{p.notes.map((t, n) => <li key={n}>{t}</li>)}</ul>}
        </article>

        <div className="jd-qs">
          {p.qs.map((q, n) => {
            const right = q.o[q.a];
            return (
              <div key={n} className="jd-rq">
                <p className="jd-rqq"><span className="jd-qno">{n + 1}</span>{q.q}</p>
                <div className="jd-choices jd-col">
                  {opts[n]?.map((o, m) => (
                    <button key={o} disabled={checked}
                      onClick={() => setChosen((c) => c.map((v, j) => (j === n ? o : v)))}
                      className={`jd-ans ${chosen[n] === o ? "jd-sel" : ""} ${checked ? (o === right ? "jd-good" : chosen[n] === o ? "jd-bad" : "") : ""}`}>
                      <span className="jd-cn">{m + 1}</span>
                      <span>{o}</span>
                    </button>
                  ))}
                </div>
                {checked && <div className={`jd-fb ${chosen[n] === right ? "jd-fbgood" : "jd-fbbad"}`}>{q.e}</div>}
              </div>
            );
          })}
          {!checked ? (
            <button className="jd-btn jd-primary" disabled={chosen.some((c) => !c)} onClick={check}>
              Check answers
            </button>
          ) : (
            <div className="jd-row">
              <span className="jd-score">Score <b>{sc}</b> / {p.qs.length}</span>
              <button className="jd-btn" onClick={() => open(p)}>Try again</button>
              {nextP && <button className="jd-btn jd-primary" onClick={() => open(nextP)}>Next passage →</button>}
            </div>
          )}
        </div>
      </div>
    </Frame>
  );
}

/* ================= Grammar ================= */
type GForm = { q: string; o: string[]; a: number; e: string };
type GOrder = { pre: string; p: string[]; post: string; star: number; e: string };
type GCloze = { id: string; title: string; text: string; qs: RQ[] };
type GData = { form: GForm[]; order: GOrder[]; cloze: GCloze[] };
type GMode = "form" | "order" | "cloze" | "mix";
type GCard =
  | { kind: "form"; item: GForm; opts: string[]; right: string }
  | { kind: "order"; item: GOrder; opts: string[]; right: string };

const GHEAD = {
  form: ["問題1", "文法形式の判断", "つぎの文の（　　）に入れるのに最もよいものを、1・2・3・4から一つえらびなさい。"],
  order: ["問題2", "文の組み立て", "つぎの文の ★ に入る最もよいものを、1・2・3・4から一つえらびなさい。"],
  cloze: ["問題3", "文章の文法", "つぎの文章を読んで、文章全体の内容を考えて、（1）から（5）の中に入る最もよいものを、1・2・3・4から一つえらびなさい。"],
} as const;

export function GrammarDrill() {
  const { data, error } = useJson<GData>("/jlpt/n3-grammar.json");
  const [mode, setMode] = useState<GMode>("form");
  const [deck, setDeck] = useState<GCard[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<GCard[]>([]);
  const [ci, setCi] = useState(0); // cloze passage index
  const [copts, setCopts] = useState<string[][]>([]);
  const [chosen, setChosen] = useState<(string | null)[]>([]);
  const [checked, setChecked] = useState(false);

  useEffect(() => setMode(load<GMode>("gmode", "form")), []);

  const start = useCallback(
    (m: GMode, only?: GCard[]) => {
      if (!data) return;
      let cards: GCard[] = only ?? [];
      if (!only) {
        if (m === "form" || m === "mix")
          cards = cards.concat(data.form.map((item) => ({ kind: "form" as const, item, opts: shuffle(item.o), right: item.o[item.a] })));
        if (m === "order" || m === "mix")
          cards = cards.concat(data.order.map((item) => ({ kind: "order" as const, item, opts: shuffle(item.p), right: item.p[item.star] })));
      }
      setDeck(shuffle(cards).map((c) => ({ ...c, opts: shuffle(c.opts) })));
      setI(0);
      setPicked(null);
      setScore(0);
      setWrong([]);
    },
    [data]
  );
  const openCloze = useCallback(
    (n: number) => {
      if (!data) return;
      const c = data.cloze[n];
      setCi(n);
      setCopts(c.qs.map((q) => shuffle(q.o)));
      setChosen(c.qs.map(() => null));
      setChecked(false);
    },
    [data]
  );
  useEffect(() => {
    if (mode === "cloze") openCloze(0);
    else start(mode);
  }, [data, mode, start, openCloze]);

  const cur = mode !== "cloze" ? deck[i] : undefined;
  const answer = (o: string) => {
    if (!cur || picked) return;
    setPicked(o);
    if (o === cur.right) setScore((s) => s + 1);
    else setWrong((w) => [...w, cur]);
  };
  const next = () => {
    setI((n) => n + 1);
    setPicked(null);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).matches("input,select,textarea")) return;
      if (cur && !picked && /^[1-4]$/.test(e.key)) answer(cur.opts[+e.key - 1]);
      else if (cur && picked && e.key === "Enter" && (e.target as HTMLElement).tagName !== "BUTTON") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const head = mode === "cloze" ? GHEAD.cloze : cur ? GHEAD[cur.kind] : GHEAD.form;
  const cl = data?.cloze[ci];
  const csc = cl ? cl.qs.reduce((s, q, n) => s + (chosen[n] === q.o[q.a] ? 1 : 0), 0) : 0;

  return (
    <Frame kicker="JLPT N3 · 文法" title={["Grammar", "Drill"]} sub="Original practice questions in the official N3 grammar formats (問題1–3).">
      {error && <p className="jd-empty">Could not load the questions. Please reload the page.</p>}
      {!data && !error && <p className="jd-empty">Loading…</p>}
      {data && (
        <>
          <div className="jd-chips">
            {(["form", "order", "cloze", "mix"] as GMode[]).map((m) => (
              <button key={m} className={`jd-chip ${m === mode ? "jd-on" : ""}`} onClick={() => { setMode(m); save("gmode", m); }}>
                {m === "mix" ? "問題1 + 2 mixed" : `${GHEAD[m][0]} ${GHEAD[m][1]}`}{" "}
                <small>{m === "form" ? data.form.length : m === "order" ? data.order.length : m === "cloze" ? data.cloze.length * 5 : data.form.length + data.order.length}</small>
              </button>
            ))}
          </div>

          {mode === "cloze" && cl ? (
            <>
              <p className="jd-mon"><b>{GHEAD.cloze[0]}</b> {GHEAD.cloze[2]}</p>
              <div className="jd-row" style={{ marginBottom: 12 }}>
                {data.cloze.map((c, n) => (
                  <button key={c.id} className={`jd-chip ${n === ci ? "jd-on" : ""}`} onClick={() => openCloze(n)}>{c.title}</button>
                ))}
              </div>
              <div className="jd-reading">
                <article className="jd-passage">
                  <h3>{cl.title}</h3>
                  {cl.text.split("\n").map((line, n) =>
                    line ? (
                      <p key={n}>
                        {line.split(/(\{\d\})/).map((part, m) => {
                          const b = part.match(/^\{(\d)\}$/);
                          if (!b) return <span key={m}>{part}</span>;
                          const k = +b[1] - 1;
                          return <span key={m} className={`jd-blank ${checked ? (chosen[k] === cl.qs[k].o[cl.qs[k].a] ? "jd-bgood" : "jd-bbad") : chosen[k] ? "jd-bfill" : ""}`}>{chosen[k] ? `（${b[1]}）${chosen[k]}` : `（　${b[1]}　）`}</span>;
                        })}
                      </p>
                    ) : <div key={n} className="jd-gap" />
                  )}
                </article>
                <div className="jd-qs">
                  {cl.qs.map((q, n) => {
                    const right = q.o[q.a];
                    return (
                      <div key={n} className="jd-rq">
                        <p className="jd-rqq"><span className="jd-qno">{n + 1}</span></p>
                        <div className="jd-choices jd-two">
                          {copts[n]?.map((o, m) => (
                            <button key={o} disabled={checked}
                              onClick={() => setChosen((c) => c.map((v, j) => (j === n ? o : v)))}
                              className={`jd-ans ${chosen[n] === o ? "jd-sel" : ""} ${checked ? (o === right ? "jd-good" : chosen[n] === o ? "jd-bad" : "") : ""}`}>
                              <span className="jd-cn">{m + 1}</span><span>{o}</span>
                            </button>
                          ))}
                        </div>
                        {checked && <div className={`jd-fb ${chosen[n] === right ? "jd-fbgood" : "jd-fbbad"}`}>{chosen[n] === right ? "" : <><b>Answer: {right}</b><br /></>}{q.e}</div>}
                      </div>
                    );
                  })}
                  {!checked ? (
                    <button className="jd-btn jd-primary" disabled={chosen.some((c) => !c)} onClick={() => setChecked(true)}>Check answers</button>
                  ) : (
                    <div className="jd-row">
                      <span className="jd-score">Score <b>{csc}</b> / {cl.qs.length}</span>
                      <button className="jd-btn" onClick={() => openCloze(ci)}>Try again</button>
                      {ci + 1 < data.cloze.length && <button className="jd-btn jd-primary" onClick={() => openCloze(ci + 1)}>Next passage →</button>}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : cur ? (
            <div className="jd-paper">
              <div className="jd-top">
                <span>Question {i + 1} / {deck.length}</span>
                <span>Score <b>{score}</b> / {i + (picked ? 1 : 0)}</span>
              </div>
              <div className="jd-bar"><i style={{ width: `${(i / deck.length) * 100}%` }} /></div>
              <p className="jd-mon"><b>{head[0]}</b> {head[2]}</p>
              <div className="jd-qline">
                <span className="jd-qno">{i + 1}</span>
                {cur.kind === "form" ? (
                  <p className="jd-sent">{cur.item.q}</p>
                ) : (
                  <p className="jd-sent">
                    {cur.item.pre}
                    {cur.item.p.map((_, n) => (
                      <span key={n} className={`jd-slot ${n === cur.item.star ? "jd-star" : ""}`}>
                        {picked ? cur.item.p[n] : n === cur.item.star ? "★" : "　"}
                      </span>
                    ))}
                    {cur.item.post}
                  </p>
                )}
              </div>
              <div className="jd-choices">
                {cur.opts.map((o, n) => (
                  <button key={o} disabled={!!picked} onClick={() => answer(o)}
                    className={`jd-ans ${picked ? (o === cur.right ? "jd-good" : o === picked ? "jd-bad" : "") : ""}`}>
                    <span className="jd-cn">{n + 1}</span><span>{o}</span>
                  </button>
                ))}
              </div>
              {picked ? (
                <>
                  <div className={`jd-fb ${picked === cur.right ? "jd-fbgood" : "jd-fbbad"}`}>
                    <b>{picked === cur.right ? "正解！ Correct." : `Answer: ${cur.opts.indexOf(cur.right) + 1}. ${cur.right}`}</b>
                    <br />
                    {cur.kind === "order" && <>{cur.item.pre}{cur.item.p.join("")}{cur.item.post}<br /></>}
                    {cur.item.e}
                  </div>
                  <button className="jd-btn jd-primary" onClick={next} autoFocus>Next →</button>
                </>
              ) : (
                <p className="jd-hint">Tip: press 1–4 on a keyboard{cur.kind === "order" ? " · put the four pieces in order in your head, then choose the one for ★" : ""}</p>
              )}
            </div>
          ) : deck.length ? (
            <div className="jd-paper jd-center">
              <p className="jd-big">{score} / {deck.length}</p>
              <p className="jd-sub">{Math.round((score / deck.length) * 100)}% correct</p>
              <div className="jd-row jd-centerrow">
                <button className="jd-btn jd-primary" onClick={() => start(mode)}>Try again</button>
                {wrong.length > 0 && <button className="jd-btn" onClick={() => start(mode, wrong)}>Retry my {wrong.length} mistakes</button>}
              </div>
            </div>
          ) : (
            <p className="jd-empty">No questions in this set.</p>
          )}
        </>
      )}
    </Frame>
  );
}

/* ================= Listening ================= */
/*
  Audio comes from Google Drive. For each question in /public/jlpt/n3-listening.json put the Drive file
  (share link or file ID) in "drive". The file must be shared as "Anyone with the link – Viewer".
  Questions without a Drive file are read aloud with the browser's Japanese voice instead.
*/
type LLine = { s: "N" | "M" | "F"; x: string };
type LItem = { id: string; t: 1 | 2 | 3 | 4 | 5; lines: LLine[]; q: string | null; o: string[]; a: number; e: string; drive?: string };
type LMode = "all" | "1" | "2" | "3" | "4" | "5";

const LHEAD: Record<LItem["t"], [string, string, string]> = {
  1: ["問題1", "課題理解", "まず質問を聞いてください。それから話を聞いて、1から4の中から、最もよいものを一つえらんでください。"],
  2: ["問題2", "ポイント理解", "まず質問を聞いてください。そのあと、選択肢を読んでください。それから話を聞いて、最もよいものを一つえらんでください。"],
  3: ["問題3", "概要理解", "話の前に質問はありません。話を聞いて、それから質問と選択肢を聞いて、1から4の中から、最もよいものを一つえらんでください。"],
  4: ["問題4", "発話表現", "場面の説明を聞いてください。何と言いますか。1から3の中から、最もよいものを一つえらんでください。"],
  5: ["問題5", "即時応答", "まず文を聞いてください。それから、その返事を聞いて、1から3の中から、最もよいものを一つえらんでください。"],
};

const driveId = (v?: string) => {
  if (!v) return "";
  const m = v.match(/\/d\/([\w-]{10,})/) || v.match(/[?&]id=([\w-]{10,})/);
  return m ? m[1] : /^[\w-]{10,}$/.test(v.trim()) ? v.trim() : "";
};
const driveUrl = (id: string) => `https://drive.google.com/uc?export=download&id=${id}`;

/* What the narrator says, in test order */
function speechParts(it: LItem): LLine[] {
  const parts: LLine[] = [];
  const num = (o: string[]) => o.map((x, i) => ({ s: "N" as const, x: `${i + 1}、${x}` }));
  if (it.t <= 2) {
    parts.push(...it.lines);
    if (it.q) parts.push({ s: "N", x: it.q });
  } else if (it.t === 3) {
    parts.push(...it.lines);
    if (it.q) parts.push({ s: "N", x: it.q });
    parts.push(...num(it.o));
  } else {
    parts.push(...it.lines, ...num(it.o));
  }
  return parts;
}

const MALE = /otoya|ichiro|keita|daichi|naoki|takumi|male|男/i;
const FEMALE = /kyoko|haruka|ayumi|nanami|sayaka|mizuki|o-ren|female|女/i;

export function ListeningDrill() {
  const { data, error } = useJson<LItem[]>("/jlpt/n3-listening.json");
  const [mode, setMode] = useState<LMode>("all");
  const [deck, setDeck] = useState<LItem[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showText, setShowText] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(0.9);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [audioErr, setAudioErr] = useState(false);

  useEffect(() => setMode(load<LMode>("lmode", "all")), []);
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const upd = () => setVoices(speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("ja")));
    upd();
    speechSynthesis.addEventListener("voiceschanged", upd);
    return () => {
      speechSynthesis.removeEventListener("voiceschanged", upd);
      speechSynthesis.cancel();
    };
  }, []);

  const start = useCallback(
    (m: LMode) => {
      if (!data) return;
      const list = data.filter((x) => m === "all" || String(x.t) === m);
      setDeck(m === "all" ? list : shuffle(list));
      setI(0);
      setPicked(null);
      setScore(0);
    },
    [data]
  );
  useEffect(() => start(mode), [data, mode, start]);

  const cur = deck[i];
  const [opts, setOpts] = useState<string[]>([]);
  useEffect(() => {
    if (!cur) return;
    // With a recording, keep the JSON order (it matches the spoken numbers); otherwise shuffle.
    setOpts(driveId(cur.drive) ? cur.o.slice() : shuffle(cur.o));
    setShowText(cur.t <= 2);
    setShowScript(false);
    setAudioErr(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) speechSynthesis.cancel();
    setSpeaking(false);
  }, [cur]);
  const id = driveId(cur?.drive);

  const stop = () => {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    setSpeaking(false);
  };
  const speak = () => {
    if (!cur || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const male = voices.find((v) => MALE.test(v.name));
    const female = voices.find((v) => FEMALE.test(v.name));
    const base = voices[0];
    const it: LItem = { ...cur, o: opts };
    const parts = speechParts(it);
    parts.forEach((p, n) => {
      const u = new SpeechSynthesisUtterance(p.x);
      u.lang = "ja-JP";
      u.rate = rate;
      const v = p.s === "M" ? male || base : p.s === "F" ? female || base : base;
      if (v) u.voice = v;
      u.pitch = p.s === "M" ? (male ? 1 : 0.75) : p.s === "F" ? (female ? 1 : 1.35) : 1;
      if (n === parts.length - 1) u.onend = () => setSpeaking(false);
      speechSynthesis.speak(u);
    });
    setSpeaking(true);
  };

  const answer = (o: string) => {
    if (!cur || picked) return;
    setPicked(o);
    setShowText(true);
    if (o === cur.o[cur.a]) setScore((s) => s + 1);
  };
  const next = () => {
    setI((n) => n + 1);
    setPicked(null);
  };

  return (
    <Frame kicker="JLPT N3 · 聴解" title={["Listening", "Drill"]} sub="Original practice questions in the five N3 listening formats (問題1–5).">
      {error && <p className="jd-empty">Could not load the questions. Please reload the page.</p>}
      {!data && !error && <p className="jd-empty">Loading…</p>}
      {data && (
        <>
          <div className="jd-chips">
            {(["all", "1", "2", "3", "4", "5"] as LMode[]).map((m) => (
              <button key={m} className={`jd-chip ${m === mode ? "jd-on" : ""}`} onClick={() => { setMode(m); save("lmode", m); }}>
                {m === "all" ? "All" : `${LHEAD[+m as LItem["t"]][0]} ${LHEAD[+m as LItem["t"]][1]}`}{" "}
                <small>{m === "all" ? data.length : data.filter((x) => String(x.t) === m).length}</small>
              </button>
            ))}
          </div>

          {cur ? (
            <div className="jd-paper">
              <div className="jd-top">
                <span>Question {i + 1} / {deck.length}</span>
                <span>Score <b>{score}</b> / {i + (picked ? 1 : 0)}</span>
              </div>
              <div className="jd-bar"><i style={{ width: `${(i / deck.length) * 100}%` }} /></div>
              <p className="jd-mon"><b>{LHEAD[cur.t][0]}</b> {LHEAD[cur.t][2]}</p>

              <div className="jd-player">
                {id && !audioErr ? (
                  <audio key={id} controls preload="none" src={driveUrl(id)} onError={() => setAudioErr(true)} className="jd-audio" />
                ) : (
                  <>
                    {speaking ? (
                      <button className="jd-btn jd-primary" onClick={stop}>■ Stop</button>
                    ) : (
                      <button className="jd-btn jd-primary" onClick={speak} disabled={!voices.length}>▶ Play</button>
                    )}
                    <label className="jd-rate">
                      Speed
                      <select value={rate} onChange={(e) => setRate(+e.target.value)}>
                        <option value={0.75}>Slow</option>
                        <option value={0.9}>Normal</option>
                        <option value={1.05}>Test speed</option>
                      </select>
                    </label>
                    <span className="jd-hint">
                      {voices.length
                        ? audioErr ? "Drive audio couldn't load, using the browser voice." : "Browser Japanese voice (no recording uploaded yet)."
                        : "This browser has no Japanese voice. Use Chrome, Edge or Safari, or add a Drive recording."}
                    </span>
                  </>
                )}
              </div>

              {cur.t <= 2 && cur.q && <p className="jd-sent jd-lq"><span className="jd-qno">{i + 1}</span>{cur.q}</p>}

              <div className={`jd-choices ${cur.t >= 3 || opts.some((o) => o.length > 12) ? "jd-col" : ""}`}>
                {opts.map((o, n) => (
                  <button key={o} disabled={!!picked} onClick={() => answer(o)}
                    className={`jd-ans ${picked ? (o === cur.o[cur.a] ? "jd-good" : o === picked ? "jd-bad" : "") : ""}`}>
                    <span className="jd-cn">{n + 1}</span>
                    <span>{showText ? o : <span className="jd-muted">— listen —</span>}</span>
                  </button>
                ))}
              </div>
              {!picked && cur.t >= 3 && (
                <button className="jd-link" onClick={() => setShowText((v) => !v)}>
                  {showText ? "Hide choices" : "Show choices as text"} <span className="jd-muted">(in the real test they are only spoken)</span>
                </button>
              )}

              {picked && (
                <>
                  <div className={`jd-fb ${picked === cur.o[cur.a] ? "jd-fbgood" : "jd-fbbad"}`}>
                    <b>{picked === cur.o[cur.a] ? "正解！ Correct." : `Answer: ${opts.indexOf(cur.o[cur.a]) + 1}. ${cur.o[cur.a]}`}</b>
                    <br />
                    {cur.e}
                  </div>
                  <button className="jd-link" onClick={() => setShowScript((v) => !v)}>{showScript ? "Hide script" : "Show script (スクリプト)"}</button>
                  {showScript && (
                    <div className="jd-script">
                      {cur.lines.map((l, n) => (
                        <p key={n}><b>{l.s === "M" ? "男" : l.s === "F" ? "女" : ""}</b>{l.s !== "N" && "："}{l.x}</p>
                      ))}
                      {cur.q && cur.t <= 3 && <p><b /> {cur.q}</p>}
                    </div>
                  )}
                  <div><button className="jd-btn jd-primary" onClick={next} autoFocus>Next →</button></div>
                </>
              )}
            </div>
          ) : deck.length ? (
            <div className="jd-paper jd-center">
              <p className="jd-big">{score} / {deck.length}</p>
              <p className="jd-sub">{Math.round((score / deck.length) * 100)}% correct</p>
              <div className="jd-row jd-centerrow"><button className="jd-btn jd-primary" onClick={() => start(mode)}>Try again</button></div>
            </div>
          ) : (
            <p className="jd-empty">No questions in this set.</p>
          )}
        </>
      )}
    </Frame>
  );
}

const DRILL_CSS = `
.jd-root{background:#242424;border:1px solid #333;border-top:4px solid #E52B2B;padding:clamp(18px,3vw,32px);color:#fff;font-family:Arial,Helvetica,"Hiragino Sans","Yu Gothic","Meiryo","Noto Sans JP",sans-serif}
.jd-root *{box-sizing:border-box;min-width:0}
.jd-kicker{color:#E52B2B;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;margin:0 0 8px}
.jd-title{font-size:clamp(26px,4vw,40px);line-height:1.05;font-weight:900;text-transform:uppercase;margin:0 0 10px}
.jd-title span{color:#E52B2B}
.jd-sub{color:#888;font-size:15px;margin:0 0 18px;line-height:1.6}
.jd-empty{color:#888;padding:24px 0}
.jd-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px}
.jd-chip{border:1px solid #333;background:#1d1d1d;color:#fff;padding:8px 14px;font:inherit;font-size:14px;min-height:40px;cursor:pointer}
.jd-chip small{color:#888;margin-left:4px}
.jd-chip:hover{border-color:#888}
.jd-on{background:#fff;color:#111;border-color:#fff}.jd-on small{color:#555}
.jd-paper{background:#1d1d1d;border:1px solid #333;padding:clamp(16px,3vw,32px)}
.jd-top{display:flex;justify-content:space-between;color:#888;font-size:14px;margin-bottom:8px}
.jd-top b{color:#fff;font-size:18px}
.jd-bar{height:4px;background:#333;margin-bottom:20px}.jd-bar i{display:block;height:100%;background:#E52B2B;transition:width .3s}
.jd-mon{font-size:15px;line-height:1.7;margin:0 0 20px}.jd-mon b{color:#E52B2B;margin-right:8px}
.jd-qline{display:flex;gap:14px;align-items:flex-start;margin-bottom:20px}
.jd-qno{flex:none;border:1.5px solid #fff;min-width:28px;height:28px;display:inline-grid;place-items:center;font-weight:700;font-size:14px;margin-right:10px;padding:0 4px}
.jd-qline .jd-qno{margin-top:6px;margin-right:0}
.jd-sent{font-size:clamp(20px,3vw,26px);line-height:1.7;margin:0}
.jd-sent u{text-decoration:none;border-bottom:2px solid #E52B2B}
.jd-word{font-size:clamp(26px,4vw,34px);font-weight:700;margin:0}
.jd-choices{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px}
.jd-col{grid-template-columns:minmax(0,1fr)}
.jd-ans{display:flex;align-items:center;gap:10px;text-align:left;min-height:54px;border:1px solid #333;background:#2a2a2a;color:#fff;font:inherit;font-size:17px;line-height:1.5;padding:8px 14px;cursor:pointer}
.jd-ans:hover:not(:disabled){border-color:#E52B2B}
.jd-ans:disabled{cursor:default}
.jd-cn{flex:none;font-size:13px;font-weight:700;color:#888}
.jd-sel{border-color:#fff;background:#333}
.jd-good{border-color:#3ecf8e;background:#16301f}
.jd-bad{border-color:#E52B2B;background:#3a1d1d}
.jd-fb{padding:12px 14px;margin-bottom:14px;font-size:15px;line-height:1.6}
.jd-fbgood{background:#16301f;border-left:3px solid #3ecf8e}
.jd-fbbad{background:#3a1d1d;border-left:3px solid #E52B2B}
.jd-hint{color:#888;font-size:13px;margin:0}
.jd-btn{border:1px solid #333;background:#2a2a2a;color:#fff;padding:11px 20px;min-height:44px;font:inherit;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;cursor:pointer}
.jd-btn:hover{background:#333}
.jd-btn:disabled{opacity:.4;cursor:default}
.jd-primary{background:#E52B2B;border-color:#E52B2B}.jd-primary:hover{background:#c41e1e}
.jd-root button:focus-visible{outline:2px solid #E52B2B;outline-offset:2px}
.jd-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.jd-center{text-align:center}.jd-centerrow{justify-content:center;margin-top:16px}
.jd-big{font-size:56px;font-weight:900;margin:0}
.jd-score{color:#888;font-size:15px;margin-right:6px}.jd-score b{color:#fff;font-size:22px}
.jd-group{margin-bottom:22px}
.jd-ghead{font-size:15px;margin:0 0 10px}.jd-ghead b{color:#E52B2B;margin-right:6px}
.jd-plist{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}
.jd-pcard{display:flex;flex-direction:column;gap:6px;text-align:left;background:#1d1d1d;border:1px solid #333;color:#fff;padding:16px;font:inherit;cursor:pointer;min-height:84px}
.jd-pcard:hover{border-color:#E52B2B}
.jd-ptitle{font-size:16px;font-weight:700;line-height:1.4}
.jd-pmeta{font-size:13px;color:#888}
.jd-link{background:none;border:0;color:#888;font:inherit;font-size:14px;cursor:pointer;padding:6px 0;margin-bottom:12px}
.jd-link:hover{color:#E52B2B}
.jd-reading{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:20px;align-items:start}
.jd-passage{background:#f6f4ef;color:#1a1a1a;padding:clamp(16px,3vw,28px);font-size:17px;line-height:1.9}
.jd-passage h3{font-size:16px;margin:0 0 12px;color:#555;font-weight:700}
.jd-passage p{margin:0}
.jd-gap{height:.9em}
.jd-scroll{overflow-x:auto;margin:6px 0 12px}
.jd-table{border-collapse:collapse;width:100%;font-size:15px;line-height:1.5}
.jd-table th,.jd-table td{border:1px solid #bbb;padding:6px 8px;text-align:left;white-space:nowrap}
.jd-table th{background:#e7e3da}
.jd-notes{margin:0;padding-left:1.2em;font-size:15px}
.jd-rq{margin-bottom:20px}
.jd-rqq{font-size:17px;line-height:1.7;margin:0 0 10px}
.jd-slot{display:inline-block;min-width:3.2em;border-bottom:2px solid #888;text-align:center;margin:0 .25em;padding:0 .2em}
.jd-star{border-bottom-color:#E52B2B;color:#E52B2B;font-weight:700}
.jd-two{grid-template-columns:repeat(2,minmax(0,1fr))}
.jd-blank{display:inline-block;border-bottom:2px solid #999;padding:0 .3em;margin:0 .15em;font-weight:700;color:#555}
.jd-bfill{color:#1a1a1a;border-bottom-color:#1a1a1a}
.jd-bgood{color:#1f7a4d;border-bottom-color:#1f7a4d}
.jd-bbad{color:#c41e1e;border-bottom-color:#c41e1e}
.jd-player{display:flex;flex-wrap:wrap;gap:12px;align-items:center;background:#262626;border:1px solid #333;padding:14px;margin-bottom:18px}
.jd-audio{width:100%;max-width:520px}
.jd-rate{display:flex;gap:8px;align-items:center;color:#888;font-size:14px}
.jd-rate select{background:#1d1d1d;color:#fff;border:1px solid #333;padding:8px;min-height:40px;font:inherit}
.jd-lq{margin-bottom:16px;font-size:20px}
.jd-muted{color:#777}
.jd-script{background:#f6f4ef;color:#1a1a1a;padding:14px 18px;margin:8px 0 14px;font-size:16px;line-height:1.8}
.jd-script p{margin:0 0 4px}.jd-script b{color:#c41e1e;margin-right:2px}
@media(max-width:860px){.jd-reading{grid-template-columns:minmax(0,1fr)}}
@media(max-width:760px){.jd-choices{grid-template-columns:repeat(2,minmax(0,1fr))}.jd-col{grid-template-columns:minmax(0,1fr)}}
@media(max-width:420px){.jd-choices{grid-template-columns:minmax(0,1fr)}}
`;
