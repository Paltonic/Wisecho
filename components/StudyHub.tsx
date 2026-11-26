"use client";

import { useEffect, useState, type ReactNode } from "react";
import KanjiStudy from "./KanjiStudy";
import { VocabDrill, GrammarDrill, ReadingDrill, ListeningDrill } from "./JlptDrills";

/*
  Study menu for the dashboard:
  Subject (Math / Science / Japanese)
    → Japanese: JLPT Preparation (N5 … N1)
      → Level: Vocabulary / Grammar / Reading / Listening / Kanji
        → N3 Kanji = <KanjiStudy />, N3 Vocabulary = <VocabDrill />, N3 Grammar = <GrammarDrill />, N3 Reading = <ReadingDrill />
  Anything without content yet shows a "Coming soon" panel.
  To add content later, put a component in CONTENT below.
*/

type Subject = { id: string; label: string; glyph: string; note: string };
type Skill = { id: string; label: string; glyph: string; note: string };

const SUBJECTS: Subject[] = [
  { id: "math", label: "Math", glyph: "∑", note: "Numbers, algebra, geometry" },
  { id: "science", label: "Science", glyph: "⚛", note: "Physics, chemistry, biology" },
  { id: "japanese", label: "Japanese", glyph: "日本語", note: "JLPT preparation N5 – N1" },
];
const LEVELS = ["N5", "N4", "N3", "N2", "N1"];
const LEVEL_NOTE: Record<string, string> = {
  N5: "Basic", N4: "Elementary", N3: "Intermediate", N2: "Upper intermediate", N1: "Advanced",
};
const SKILLS: Skill[] = [
  { id: "vocab", label: "Vocabulary", glyph: "語", note: "Words & expressions" },
  { id: "grammar", label: "Grammar", glyph: "文", note: "Sentence patterns" },
  { id: "reading", label: "Reading", glyph: "読", note: "Passages & info search" },
  { id: "listening", label: "Listening", glyph: "聴", note: "Audio practice" },
  { id: "kanji", label: "Kanji", glyph: "漢", note: "Readings & writing" },
];

/* Which pages have real content: key = "level/skill" */
const CONTENT: Record<string, () => ReactNode> = {
  "N3/kanji": () => <KanjiStudy embedded />,
  "N3/vocab": () => <VocabDrill />,
  "N3/grammar": () => <GrammarDrill />,
  "N3/reading": () => <ReadingDrill />,
  "N3/listening": () => <ListeningDrill />,
};

type Path = { subject?: string; level?: string; skill?: string };
const KEY = "n3k_hubpath";

// `embedded` is accepted (and ignored) so `<StudyHub embedded />` also compiles.
export default function StudyHub(_props: { embedded?: boolean } = {}) {
  const [path, setPath] = useState<Path>({});

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (p && typeof p === "object") setPath(p);
    } catch { /* ignore */ }
  }, []);

  const go = (p: Path) => {
    setPath(p);
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ }
    document.getElementById("study")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const subject = SUBJECTS.find((s) => s.id === path.subject);
  const skill = SKILLS.find((s) => s.id === path.skill);

  // Breadcrumb
  const crumbs: { label: string; to: Path }[] = [{ label: "Study", to: {} }];
  if (subject) crumbs.push({ label: subject.label, to: { subject: subject.id } });
  if (subject?.id === "japanese" && path.level) crumbs.push({ label: `JLPT ${path.level}`, to: { subject: "japanese", level: path.level } });
  if (skill && path.level) crumbs.push({ label: skill.label, to: { ...path } });

  let body: ReactNode;
  let heading: [string, string];

  if (!subject) {
    heading = ["Choose a", "Subject"];
    body = (
      <div className="sh-grid sh-grid3">
        {SUBJECTS.map((s) => (
          <button key={s.id} className="sh-tile" onClick={() => go({ subject: s.id })}>
            <span className="sh-glyph">{s.glyph}</span>
            <span className="sh-label">{s.label}</span>
            <span className="sh-note">{s.note}</span>
          </button>
        ))}
      </div>
    );
  } else if (subject.id !== "japanese") {
    heading = [subject.label, ""];
    body = <ComingSoon what={subject.label} onBack={() => go({})} />;
  } else if (!path.level) {
    heading = ["JLPT", "Preparation"];
    body = (
      <div className="sh-grid sh-grid5">
        {LEVELS.map((l) => (
          <button key={l} className="sh-tile sh-level" onClick={() => go({ subject: "japanese", level: l })}>
            <span className="sh-lv">{l}</span>
            <span className="sh-note">{LEVEL_NOTE[l]}</span>
          </button>
        ))}
      </div>
    );
  } else if (!skill) {
    heading = [`JLPT ${path.level}`, "Skills"];
    body = (
      <div className="sh-grid sh-grid5">
        {SKILLS.map((s) => {
          const ready = !!CONTENT[`${path.level}/${s.id}`];
          return (
            <button key={s.id} className="sh-tile" onClick={() => go({ ...path, skill: s.id })}>
              {ready && <span className="sh-badge">Ready</span>}
              <span className="sh-glyph sh-jp">{s.glyph}</span>
              <span className="sh-label">{s.label}</span>
              <span className="sh-note">{s.note}</span>
            </button>
          );
        })}
      </div>
    );
  } else {
    heading = [`${path.level}`, skill.label];
    const render = CONTENT[`${path.level}/${skill.id}`];
    body = render ? render() : <ComingSoon what={`JLPT ${path.level} ${skill.label}`} onBack={() => go({ subject: "japanese", level: path.level })} />;
  }

  const inKanji = !!(skill && path.level && CONTENT[`${path.level}/${skill.id}`]);

  return (
    <section id="study" className="sh-root">
      <style>{HUB_CSS}</style>
      <nav className="sh-crumbs" aria-label="Breadcrumb">
        {crumbs.map((c, i) => (
          <span key={i}>
            {i > 0 && <span className="sh-sep">›</span>}
            {i < crumbs.length - 1 ? (
              <button onClick={() => go(c.to)}>{c.label}</button>
            ) : (
              <b>{c.label}</b>
            )}
          </span>
        ))}
      </nav>
      {!inKanji && (
        <div className="sh-panel">
          <p className="sh-kicker">Study</p>
          <h2 className="sh-title">
            {heading[0]} {heading[1] && <span>{heading[1]}</span>}
          </h2>
          {body}
        </div>
      )}
      {inKanji && body}
    </section>
  );
}

function ComingSoon({ what, onBack }: { what: string; onBack: () => void }) {
  return (
    <div className="sh-soon">
      <p className="sh-soon-t">Coming soon</p>
      <p className="sh-note">{what} materials are being prepared.</p>
      <button className="sh-back" onClick={onBack}>← Back</button>
    </div>
  );
}

const HUB_CSS = `
.sh-root{margin-top:40px;color:#fff;font-family:Arial,Helvetica,"Hiragino Sans","Yu Gothic","Meiryo","Noto Sans JP",sans-serif;scroll-margin-top:24px}
.sh-root *{box-sizing:border-box;min-width:0}
.sh-crumbs{display:flex;flex-wrap:wrap;align-items:center;gap:2px;font-size:13px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px;color:#888}
.sh-crumbs button{background:none;border:0;color:#888;font:inherit;letter-spacing:inherit;text-transform:inherit;cursor:pointer;padding:6px 4px}
.sh-crumbs button:hover{color:#E52B2B}
.sh-crumbs b{color:#fff;padding:6px 4px}
.sh-sep{color:#555;padding:0 4px}
.sh-panel{background:#242424;border:1px solid #333;border-top:4px solid #E52B2B;padding:clamp(18px,3vw,32px)}
.sh-kicker{color:#E52B2B;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;margin:0 0 8px}
.sh-title{font-size:clamp(26px,4vw,40px);line-height:1;font-weight:900;text-transform:uppercase;margin:0 0 22px}
.sh-title span{color:#E52B2B}
.sh-grid{display:grid;gap:12px}
.sh-grid3{grid-template-columns:repeat(3,minmax(0,1fr))}
.sh-grid4{grid-template-columns:repeat(4,minmax(0,1fr))}
.sh-grid5{grid-template-columns:repeat(5,minmax(0,1fr))}
.sh-tile{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:6px;text-align:left;background:#1d1d1d;border:1px solid #333;color:#fff;padding:22px 20px;min-height:150px;cursor:pointer;font:inherit;transition:border-color .2s,transform .2s}
.sh-tile:hover{border-color:#E52B2B;transform:translateY(-2px)}
.sh-tile:focus-visible,.sh-back:focus-visible,.sh-crumbs button:focus-visible{outline:2px solid #E52B2B;outline-offset:2px}
.sh-glyph{font-size:34px;line-height:1;font-weight:700;color:#E52B2B;margin-bottom:auto;padding-bottom:14px}
.sh-jp{font-family:"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif;font-size:42px;font-weight:500}
.sh-label{font-size:18px;font-weight:800;text-transform:uppercase;letter-spacing:.04em}
.sh-note{font-size:13px;color:#888}
.sh-level{align-items:center;text-align:center;justify-content:center;min-height:130px}
.sh-lv{font-size:40px;font-weight:900;line-height:1}
.sh-level:hover .sh-lv{color:#E52B2B}
.sh-badge{position:absolute;top:12px;right:12px;background:#E52B2B;color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:3px 8px}
.sh-soon{border:1px dashed #444;padding:36px 20px;text-align:center}
.sh-soon-t{font-size:22px;font-weight:800;text-transform:uppercase;margin:0 0 6px}
.sh-back{margin-top:16px;background:#2a2a2a;border:1px solid #333;color:#fff;padding:11px 20px;min-height:44px;font:inherit;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;cursor:pointer}
.sh-back:hover{background:#333}
.sh-root .ks-embedded{margin-top:0}
@media(max-width:760px){.sh-grid3,.sh-grid4{grid-template-columns:repeat(2,minmax(0,1fr))}.sh-grid5{grid-template-columns:repeat(3,minmax(0,1fr))}.sh-tile{min-height:120px;padding:16px}}
@media(max-width:420px){.sh-grid3{grid-template-columns:minmax(0,1fr)}}
@media(prefers-reduced-motion:reduce){.sh-tile{transition:none}.sh-tile:hover{transform:none}}
`;
