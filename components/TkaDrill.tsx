"use client";

import { useCallback, useEffect, useState } from "react";
import { Frame, load, save, shuffle, useJson } from "./JlptDrills";

/*
  Persiapan TKA SMP – Matematika (original practice questions in the official TKA formats)
  Data: /public/tka/smp-matematika.json
  t: "pg"   Pilihan ganda (o = options, a = [correct index]; correct is written first)
     "mcma" Pilihan ganda kompleks, pilih semua yang benar (a = correct indexes)
     "kat"  Pilihan ganda kompleks model kategori (s = statements, k = true/false, cols = column labels)
  stim: optional shared stimulus (text + table); g = group id for soal grup
*/

type Table = { head: string[]; rows: string[][] };
type TQ = {
  id: string;
  el: "bil" | "alj" | "geo" | "dat";
  t: "pg" | "mcma" | "kat";
  q: string;
  o?: string[];
  a?: number[];
  s?: string[];
  k?: boolean[];
  cols?: string[];
  e: string;
  stim?: { text: string; table?: Table } | null;
  g?: string | null;
};
type Mode = "all" | TQ["el"];
type Card = { item: TQ; order: number[] };

const EL: Record<TQ["el"], string> = { bil: "Bilangan", alj: "Aljabar", geo: "Geometri & Pengukuran", dat: "Data & Peluang" };
const TYPE: Record<TQ["t"], string> = { pg: "Pilihan ganda", mcma: "Pilihan ganda kompleks · pilih semua yang benar", kat: "Pilihan ganda kompleks · kategori" };
const LETTER = "ABCDE";

function isRight(item: TQ, pick: number[], cats: (boolean | null)[]) {
  if (item.t === "kat") return item.k!.every((v, i) => cats[i] === v);
  const want = [...item.a!].sort().join(",");
  return [...pick].sort().join(",") === want;
}

export default function TkaDrill() {
  const { data, error } = useJson<TQ[]>("/tka/smp-matematika.json");
  const [mode, setMode] = useState<Mode>("all");
  const [deck, setDeck] = useState<Card[]>([]);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number[]>([]);
  const [cats, setCats] = useState<(boolean | null)[]>([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<TQ[]>([]);

  useEffect(() => setMode(load<Mode>("tkamode", "all")), []);

  const start = useCallback(
    (m: Mode, only?: TQ[]) => {
      if (!data) return;
      const list = only ?? data.filter((q) => m === "all" || q.el === m);
      // keep soal grup together: shuffle groups, not single items
      const groups: TQ[][] = [];
      list.forEach((q) => {
        const g = q.g && groups.find((x) => x[0].g === q.g);
        if (g) g.push(q);
        else groups.push([q]);
      });
      const cards = shuffle(groups).flat().map((item) => ({
        item,
        order: item.t === "kat" ? [] : shuffle(item.o!.map((_, n) => n)),
      }));
      setDeck(cards);
      setI(0);
      setScore(0);
      setWrong([]);
    },
    [data]
  );
  useEffect(() => start(mode), [data, mode, start]);

  const cur = deck[i];
  useEffect(() => {
    setPick([]);
    setChecked(false);
    setCats(cur?.item.t === "kat" ? cur.item.s!.map(() => null) : []);
  }, [cur]);

  const check = (p = pick) => {
    if (!cur || checked) return;
    setChecked(true);
    if (isRight(cur.item, p, cats)) setScore((s) => s + 1);
    else setWrong((w) => [...w, cur.item]);
  };
  const choose = (n: number) => {
    if (!cur || checked) return;
    if (cur.item.t === "pg") {
      setPick([n]);
      check([n]);
    } else setPick((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));
  };
  const ready = cur ? (cur.item.t === "kat" ? cats.every((c) => c !== null) : pick.length > 0) : false;

  return (
    <Frame kicker="Matematika · TKA SMP" title={["Persiapan", "TKA SMP"]}
      sub="Latihan soal Matematika dengan bentuk soal TKA: pilihan ganda, pilihan ganda kompleks, dan model kategori. Setiap soal ada pembahasannya.">
      {error && <p className="jd-empty">Soal tidak bisa dimuat. Muat ulang halaman.</p>}
      {!data && !error && <p className="jd-empty">Memuat…</p>}
      {data && (
        <>
          <div className="jd-chips">
            {(["all", "bil", "alj", "geo", "dat"] as Mode[]).map((m) => (
              <button key={m} className={`jd-chip ${m === mode ? "jd-on" : ""}`} onClick={() => { setMode(m); save("tkamode", m); }}>
                {m === "all" ? "Semua" : EL[m]} <small>{m === "all" ? data.length : data.filter((q) => q.el === m).length}</small>
              </button>
            ))}
          </div>

          {cur ? (
            <div className="jd-paper">
              <div className="jd-top">
                <span>Soal {i + 1} / {deck.length}</span>
                <span>Skor <b>{score}</b> / {i + (checked ? 1 : 0)}</span>
              </div>
              <div className="jd-bar"><i style={{ width: `${(i / deck.length) * 100}%` }} /></div>
              <p className="jd-mon"><b>{EL[cur.item.el]}</b> {TYPE[cur.item.t]}</p>

              {cur.item.stim && (
                <div className="tk-stim">
                  <p>{cur.item.stim.text}</p>
                  {cur.item.stim.table && (
                    <div className="jd-scroll">
                      <table className="jd-table">
                        <thead><tr>{cur.item.stim.table.head.map((h, n) => <th key={n}>{h}</th>)}</tr></thead>
                        <tbody>{cur.item.stim.table.rows.map((r, n) => <tr key={n}>{r.map((c, m) => <td key={m}>{c}</td>)}</tr>)}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              <div className="jd-qline">
                <span className="jd-qno">{i + 1}</span>
                <p className="tk-q">{cur.item.q}</p>
              </div>

              {cur.item.t === "kat" ? (
                <div className="jd-scroll">
                  <table className="tk-kat">
                    <thead><tr><th>Pernyataan</th>{cur.item.cols!.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                    <tbody>
                      {cur.item.s!.map((st, n) => (
                        <tr key={n} className={checked ? (cats[n] === cur.item.k![n] ? "tk-ok" : "tk-no") : ""}>
                          <td>{st}</td>
                          {[true, false].map((v, m) => (
                            <td key={m} className="tk-c">
                              <button disabled={checked} aria-label={`${cur.item.cols![m]}: ${st}`}
                                className={`tk-radio ${cats[n] === v ? "tk-on" : ""} ${checked && cur.item.k![n] === v ? "tk-key" : ""}`}
                                onClick={() => setCats((c) => c.map((x, j) => (j === n ? v : x)))} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="jd-choices jd-col">
                  {cur.order.map((n, pos) => {
                    const right = cur.item.a!.includes(n);
                    const on = pick.includes(n);
                    return (
                      <button key={n} disabled={checked} onClick={() => choose(n)}
                        className={`jd-ans ${on ? "jd-sel" : ""} ${checked ? (right ? "jd-good" : on ? "jd-bad" : "") : ""}`}>
                        <span className={`jd-cn ${cur.item.t === "mcma" ? "tk-box" : ""}`}>{cur.item.t === "mcma" ? (on ? "✓" : "") : LETTER[pos]}</span>
                        <span>{cur.item.o![n]}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {!checked && cur.item.t !== "pg" && (
                <button className="jd-btn jd-primary" disabled={!ready} onClick={() => check()}>Periksa jawaban</button>
              )}
              {checked && (
                <>
                  <div className={`jd-fb ${isRight(cur.item, pick, cats) ? "jd-fbgood" : "jd-fbbad"}`}>
                    <b>{isRight(cur.item, pick, cats) ? "Benar!" : cur.item.t === "pg" ? `Jawaban: ${LETTER[cur.order.indexOf(cur.item.a![0])]}. ${cur.item.o![cur.item.a![0]]}` : "Belum tepat. Jawaban benar ditandai hijau."}</b>
                    <br />
                    <span className="tk-why">Pembahasan:</span> {cur.item.e}
                  </div>
                  <button className="jd-btn jd-primary" onClick={() => setI((n) => n + 1)} autoFocus>Soal berikutnya →</button>
                </>
              )}
              {cur.item.t === "mcma" && !checked && <p className="jd-hint" style={{ marginTop: 10 }}>Jawaban benar bisa lebih dari satu. Skor hanya dihitung jika semua pilihan tepat.</p>}
            </div>
          ) : deck.length ? (
            <div className="jd-paper jd-center">
              <p className="jd-big">{score} / {deck.length}</p>
              <p className="jd-sub">{Math.round((score / deck.length) * 100)}% benar</p>
              <div className="jd-row jd-centerrow">
                <button className="jd-btn jd-primary" onClick={() => start(mode)}>Ulangi</button>
                {wrong.length > 0 && <button className="jd-btn" onClick={() => start(mode, wrong)}>Ulangi {wrong.length} soal yang salah</button>}
              </div>
            </div>
          ) : (
            <p className="jd-empty">Belum ada soal di bagian ini.</p>
          )}
          <style>{TKA_CSS}</style>
        </>
      )}
    </Frame>
  );
}

const TKA_CSS = `
.tk-stim{background:#f6f4ef;color:#1a1a1a;padding:16px 18px;margin-bottom:18px;font-size:17px;line-height:1.6}
.tk-stim p{margin:0 0 8px}
.tk-q{font-size:clamp(18px,2.6vw,21px);line-height:1.6;margin:0}
.tk-box{width:22px;height:22px;border:2px solid #888;display:inline-grid;place-items:center;color:#fff;font-size:14px}
.jd-sel .tk-box{border-color:#fff;background:#E52B2B}
.tk-kat{border-collapse:collapse;width:100%;margin-bottom:16px;font-size:17px;line-height:1.5}
.tk-kat th{background:#2a2a2a;padding:10px;text-align:left;font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#bbb}
.tk-kat th:not(:first-child){text-align:center;width:90px}
.tk-kat td{border-top:1px solid #333;padding:12px 10px;vertical-align:middle}
.tk-c{text-align:center}
.tk-radio{width:30px;height:30px;border-radius:50%;border:2px solid #777;background:transparent;cursor:pointer}
.tk-radio:disabled{cursor:default}
.tk-on{border-color:#fff;background:radial-gradient(#E52B2B 45%,transparent 50%)}
.tk-key{border-color:#3ecf8e;box-shadow:0 0 0 3px rgba(62,207,142,.35)}
.tk-ok td:first-child{border-left:3px solid #3ecf8e}
.tk-no td:first-child{border-left:3px solid #E52B2B}
.tk-why{font-weight:700}
`;
