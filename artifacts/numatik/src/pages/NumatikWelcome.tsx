/**
 * NumatikWelcome — halaman sambutan 3D Numatik (tata surya, hiperspace, 6 bahasa).
 *
 * PEMAKAIAN:
 *   import NumatikWelcome from "./NumatikWelcome";
 *   <NumatikWelcome
 *      onStart={() => navigate("/menu")}   // dipanggil setelah efek masuk-dimensi selesai
 *      academicYear="2026 – 2027"          // opsional, ambil dari sumber aplikasi
 *   />
 *   Tanpa onStart, komponen menampilkan overlay "Selamat belajar!" (mode demo).
 *
 * Pasang NumatikWelcome.tsx dan numatik-welcome.css di folder yang sama.
 * Semua CSS di-scope ke .nmw sehingga tidak mengubah gaya halaman lain.
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import ExitDialog from "@/components/ExitDialog";
import { playPopSound } from "@/hooks/useAudio";
import "./numatik-welcome.css";

export type WelcomeLang = "id" | "en" | "ms" | "ja" | "zh" | "ru";
type Dict = { n: string; g: string; s: string; y: string; b: string; h: string; t: string };

// Terjemahan ms/zh/ru masih DRAF dan perlu direview penutur asli.
const L: Record<WelcomeLang, Dict> = {
  id: { n: "ID", g: "Selamat Datang di Aplikasi", s: "Numerasi Aktif dengan Teknologi Informasi dan Komunikasi", y: "Tahun Ajaran {y}", b: "MULAI", h: "Selamat belajar!", t: "APLIKASI MULTIMEDIA PEMBELAJARAN INTERAKTIF MATEMATIKA" },
  en: { n: "EN", g: "Welcome to the App", s: "Active Numeracy with Information and Communication Technology", y: "Academic Year {y}", b: "START", h: "Happy learning!", t: "INTERACTIVE MULTIMEDIA LEARNING APP FOR JUNIOR HIGH MATHEMATICS" },
  ms: { n: "MS", g: "Selamat Datang ke Aplikasi", s: "Numerasi Aktif dengan Teknologi Maklumat dan Komunikasi", y: "Tahun Akademik {y}", b: "MULA", h: "Selamat belajar!", t: "APLIKASI MULTIMEDIA PEMBELAJARAN INTERAKTIF MATEMATIK SEKOLAH MENENGAH" },
  ja: { n: "日本語", g: "アプリへようこそ", s: "情報通信技術で学ぶアクティブ・ニューメラシー", y: "{y}年度", b: "スタート", h: "いっしょに学ぼう！", t: "中学数学のインタラクティブ・マルチメディア学習アプリ" },
  zh: { n: "中文", g: "欢迎使用应用", s: "借助信息通信技术的主动数感学习", y: "{y} 学年", b: "开始", h: "开始学习吧！", t: "初中数学互动多媒体学习应用" },
  ru: { n: "RU", g: "Добро пожаловать в приложение", s: "Активная математическая грамотность с помощью ИКТ", y: "{y} учебный год", b: "НАЧАТЬ", h: "Учимся вместе!", t: "ИНТЕРАКТИВНОЕ МУЛЬТИМЕДИЙНОЕ ПРИЛОЖЕНИЕ ДЛЯ ИЗУЧЕНИЯ МАТЕМАТИКИ" },
};

const store = {
  get(k: string) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* abaikan */ } },
};
const buzz = (p: number | number[]) => { try { navigator.vibrate?.(p); } catch { /* abaikan */ } };
const S = (o: Record<string, string | number>) => o as CSSProperties;

function detectLang(key: string): WelcomeLang {
  const q = new URLSearchParams(window.location.search).get("lang");
  const dev = (navigator.language || "id").slice(0, 2).toLowerCase();
  return ([q, store.get(key), dev, "id"].find((k) => k && k in L) as WelcomeLang) || "id";
}

/* ===== tekstur planet (noise SVG yang tersambung mulus), dibuat sekali di level modul ===== */
const SV = (inner: string, defs: string) =>
  'url("data:image/svg+xml,' +
  encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><defs>${defs}</defs>${inner}</svg>`) +
  '")';
function band(fx: number, fy: number, oct: number, seed: number, k: number, c: number, r: string, g: string, b: string) {
  const m = `${k} 0 0 0 ${c} ${k} 0 0 0 ${c} ${k} 0 0 0 ${c} 0 0 0 0 1`;
  return SV(
    "<rect width='256' height='256' filter='url(#f)'/>",
    `<filter id='f' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='${fx} ${fy}' numOctaves='${oct}' seed='${seed}' stitchTiles='stitch'/><feColorMatrix values='${m}'/><feComponentTransfer><feFuncR type='table' tableValues='${r}'/><feFuncG type='table' tableValues='${g}'/><feFuncB type='table' tableValues='${b}'/></feComponentTransfer></filter>`
  );
}
const earthSurf = SV(
  "<rect width='256' height='256' fill='url(#o)'/><rect width='256' height='256' filter='url(#l)'/>",
  "<linearGradient id='o' x2='0' y2='1'><stop offset='0' stop-color='#e8f3ff'/><stop offset='.1' stop-color='#2f78d6'/><stop offset='.5' stop-color='#123f9c'/><stop offset='.9' stop-color='#2f78d6'/><stop offset='1' stop-color='#e8f3ff'/></linearGradient><filter id='l' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='.012 .02' numOctaves='5' seed='11' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .26 0 0 0 0 .5 0 0 0 0 .2 7 0 0 0 -3.3'/></filter>"
);
const clouds = SV(
  "<rect width='256' height='256' filter='url(#c)'/>",
  "<filter id='c' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='.018 .05' numOctaves='5' seed='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 3.2 0 0 0 -1.5'/></filter>"
);
const spot = SV(
  "<ellipse cx='150' cy='170' rx='26' ry='15' fill='url(#g)'/>",
  "<radialGradient id='g'><stop offset='0' stop-color='#a8321f'/><stop offset='.6' stop-color='#cf6a45'/><stop offset='1' stop-color='#cf6a45' stop-opacity='0'/></radialGradient>"
);
const TEX: Record<string, string> = {
  mercury: band(0.05, 0.05, 5, 2, 2.2, -0.55, ".28 .55 .4 .72 .5", ".27 .53 .39 .7 .48", ".25 .5 .37 .66 .45"),
  venus: band(0.012, 0.04, 4, 5, 2, -0.45, ".86 .96 .78 .94", ".66 .82 .56 .78", ".3 .46 .24 .42"),
  earth: clouds + "," + earthSurf,
  mars: band(0.02, 0.02, 5, 9, 2.4, -0.7, ".42 .8 .6 .86 .5", ".15 .33 .22 .4 .17", ".07 .15 .1 .2 .07"),
  jupiter: spot + "," + band(0.003, 0.07, 4, 4, 2.6, -0.8, ".52 .88 .62 .95 .56 .84", ".32 .67 .42 .85 .36 .62", ".2 .45 .27 .7 .22 .42"),
  saturn: band(0.002, 0.09, 3, 6, 2.6, -0.8, ".74 .93 .68 .9 .6", ".62 .82 .56 .76 .5", ".4 .55 .34 .5 .3"),
  uranus: band(0.004, 0.03, 2, 8, 1.5, -0.2, ".6 .72 .66", ".84 .94 .88", ".9 .97 .93"),
  neptune: band(0.004, 0.05, 3, 3, 1.8, -0.4, ".1 .22 .12", ".22 .4 .3", ".66 .92 .72"),
};
const RINGS = [
  { k: "mercury", r: 22, t: 8, d: -3 }, { k: "venus", r: 31, t: 14, d: -9 }, { k: "earth", r: 40, t: 22, d: -6 },
  { k: "mars", r: 49, t: 30, d: -20 }, { k: "belt", r: 56, t: 90, d: 0 }, { k: "jupiter", r: 67, t: 48, d: -14 },
  { k: "saturn", r: 79, t: 66, d: -40 }, { k: "uranus", r: 89, t: 90, d: -30 }, { k: "neptune", r: 99, t: 120, d: -70 },
];
export interface NumatikWelcomeProps {
  onStart?: () => void;
  lang?: WelcomeLang;
  onLangChange?: (l: WelcomeLang) => void;
  academicYear?: string;
  langStorageKey?: string;
}

export default function NumatikWelcome({
  onStart, lang: langProp, onLangChange,
  academicYear = "2026 – 2027", langStorageKey = "numatik-lang",
}: NumatikWelcomeProps) {
  const [lang, setLangState] = useState<WelcomeLang>(() => langProp ?? detectLang(langStorageKey));
  const [warping, setWarping] = useState(false);
  const [arrived, setArrived] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(0);   // 0 statis, 1 hiperspace
  const t0Ref = useRef(0);
  const mRef = useRef(1);      // pengali kecepatan bintang
  const acRef = useRef<AudioContext | null>(null);
  const wakeFrameRef = useRef<() => void>(() => {});
  const timers = useRef<number[]>([]);
  const onStartRef = useRef(onStart);
  onStartRef.current = onStart;

  useEffect(() => { if (langProp) setLangState(langProp); }, [langProp]);
  const setLang = (l: WelcomeLang) => { setLangState(l); store.set(langStorageKey, l); onLangChange?.(l); };
  const d = L[lang];

  const finish = () => {
    buzz([60]);
    if (onStartRef.current) onStartRef.current();
    else setArrived(true);
  };
  const finishRef = useRef(finish);
  finishRef.current = finish;

  /* ===== langit statis + terowongan cahaya saat mulai ===== */
  useEffect(() => {
    const cv = canvasRef.current!;
    const cx = cv.getContext("2d")!;
    const mobile = matchMedia("(pointer: coarse), (max-width: 700px)").matches;
    const speed = 0.0009, hues = [190, 200, 210, 270, 300, 50];
    let W = 0, H = 0, dpr = 1, raf = 0, alive = true, lastFrame = 0;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : Number.POSITIVE_INFINITY);
      W = cv.width = cv.clientWidth * dpr;
      H = cv.height = cv.clientHeight * dpr;
    };
    size();
    const N = mobile
      ? Math.min(150, Math.floor((cv.clientWidth * cv.clientHeight) / 7000) + 60)
      : Math.min(380, Math.floor((cv.clientWidth * cv.clientHeight) / 3800) + 110);
    const stars = Array.from({ length: N + (mobile ? 80 : 240) }, (_, i) => ({
      x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random(),
      h: i < N ? (Math.random() < 0.2 ? 190 : Math.random() < 0.1 ? 270 : 210) : hues[i % 6], beam: i >= N,
    }));
    const frame = (now: number) => {
      if (!alive) return;
      raf = 0;
      if (mobile && now - lastFrame < 1000 / 30) {
        raf = requestAnimationFrame(frame);
        return;
      }
      lastFrame = now;
      let m = mRef.current;
      let completed = false;
      if (modeRef.current === 1) {
        const t = Math.min(1, (now - t0Ref.current) / 2200);
        m = 1 + 110 * t * t;
        completed = t >= 1;
      }
      mRef.current = m;
      const fast = m > 3;
      cx.globalCompositeOperation = "source-over";
      cx.fillStyle = fast ? "rgba(2,8,22,.2)" : "#020816";
      cx.fillRect(0, 0, W, H);
      if (fast) cx.globalCompositeOperation = "lighter";
      if (modeRef.current) {
        const g = cx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.45);
        g.addColorStop(0, "rgba(170,230,255," + Math.min(0.3, (m - 1) / 160) + ")");
        g.addColorStop(1, "rgba(2,8,22,0)");
        cx.fillStyle = g; cx.fillRect(0, 0, W, H);
      }
      const f = Math.max(W, H) * 0.5;
      for (const s of stars) {
        if (s.beam && !fast) continue;
        const pz = s.z + speed * m * (fast ? 2.4 : 0);
        if (modeRef.current) s.z -= speed * m;
        if (s.z <= 0.02) { s.z = 1; s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; continue; }
        const k = 1 / s.z, x = W / 2 + s.x * f * k * 0.25, y = H / 2 + s.y * f * k * 0.25;
        const a = Math.min(1, (1 - s.z) * 1.6 + 0.15), r = Math.max(0.4, (1 - s.z) * 2.2) * dpr;
        if (fast) {
          const k2 = 1 / Math.min(1.6, pz);
          cx.strokeStyle = "hsla(" + s.h + ",100%,78%," + Math.min(1, a + 0.3) + ")";
          cx.lineWidth = r * (1 + m * 0.02);
          cx.beginPath(); cx.moveTo(W / 2 + s.x * f * k2 * 0.25, H / 2 + s.y * f * k2 * 0.25); cx.lineTo(x, y); cx.stroke();
        } else {
          cx.fillStyle = "hsla(" + s.h + ",90%,80%," + a + ")";
          cx.beginPath(); cx.arc(x, y, r, 0, 6.283); cx.fill();
        }
      }
      if (completed) {
        modeRef.current = 0;
        mRef.current = 1;
        finishRef.current();
      }
      if (modeRef.current === 1) raf = requestAnimationFrame(frame);
    };
    const requestFrame = () => {
      if (alive && !raf) raf = requestAnimationFrame(frame);
    };
    wakeFrameRef.current = requestFrame;
    const resize = () => { size(); requestFrame(); };
    raf = requestAnimationFrame(frame);
    addEventListener("resize", resize);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      wakeFrameRef.current = () => {};
      removeEventListener("resize", resize);
    };
  }, []);

  /* ===== bersihkan audio & timer saat unmount ===== */
  useEffect(() => () => { timers.current.forEach(clearTimeout); acRef.current?.close().catch(() => {}); acRef.current = null; }, []);

  const whoosh = () => {
    try {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      const ac = (acRef.current = acRef.current || new Ctor());
      if (ac.state === "suspended") ac.resume().catch(() => {});
      const t = ac.currentTime, n = ac.sampleRate * 2.4, buf = ac.createBuffer(1, n, ac.sampleRate), data = buf.getChannelData(0);
      for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
      const s = ac.createBufferSource(); s.buffer = buf;
      const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.1;
      bp.frequency.setValueAtTime(180, t); bp.frequency.exponentialRampToValueAtTime(7000, t + 1.9);
      const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.45, t + 1.6); g.gain.linearRampToValueAtTime(0, t + 2.3);
      s.connect(bp); bp.connect(g); g.connect(ac.destination); s.start(t);
      const o = ac.createOscillator(), og = ac.createGain(); o.type = "sine";
      o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(420, t + 1.8);
      og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(0.18, t + 1.5); og.gain.linearRampToValueAtTime(0, t + 2.2);
      o.connect(og); og.connect(ac.destination); o.start(t); o.stop(t + 2.3);
    } catch { /* suara opsional */ }
  };

  const handleGo = () => {
    if (modeRef.current) return;
    modeRef.current = 1;
    playPopSound();
    setWarping(true); whoosh(); buzz(20);
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) { finish(); return; }
    t0Ref.current = performance.now();
    wakeFrameRef.current();
    timers.current.push(window.setTimeout(() => buzz([40, 30, 80]), 1600));
  };
  const replay = () => { modeRef.current = 0; setArrived(false); setWarping(false); };

  return (
    <div className={"nmw" + (warping ? " warping" : "")} lang={lang}>
      <canvas ref={canvasRef} className="sky" />
      <div className="nebula" />

      <main className="app">
        <nav className="langs" aria-label="Language">
          {(Object.keys(L) as WelcomeLang[]).map((k) => (
            <button key={k} aria-pressed={k === lang} onClick={() => setLang(k)}>{L[k].n}</button>
          ))}
        </nav>
        <ExitDialog className="nmw-exit-button" />
        <section className="stage">
          <div className="copy">
            <div className="head">
              <p className="greet">{d.g}</p>
              <h1 className="title">NUMATIK</h1>
            </div>
            <div className="dock">
              <p className="sub">{d.s}</p>
              <span className="year">{d.y.replace("{y}", academicYear)}</span>
              <button className="go" onClick={handleGo}>{d.b}</button>
            </div>
          </div>

          <div className="space" aria-hidden="true">
            <div className="scene">
              {RINGS.map((rg) =>
                rg.k === "belt" ? (
                  <div key={rg.k} className="ring belt" style={S({ "--r": rg.r + "%" })}>
                    <div className="spin" style={S({ "--t": rg.t + "s" })} />
                  </div>
                ) : (
                  <div key={rg.k} className="ring" style={S({ "--r": rg.r + "%" })}>
                    <div className="spin" style={S({ "--t": rg.t + "s", "--d": rg.d + "s" })}>
                      <span className={"pl " + rg.k} style={S({ "--tex": TEX[rg.k] })}>
                        <i className="bd"><b className="gl" /></i>
                        {rg.k === "earth" && <b className="moonorb" />}
                      </span>
                    </div>
                  </div>
                )
              )}
              <div className="sun"><i /></div>
            </div>
          </div>
        </section>

        <div className="ticker">
          <div className="ticker-track" aria-hidden="true">
            <span>{"✨ " + d.t + " ✨ "}</span>
            <span>{"✨ " + d.t + " ✨ "}</span>
          </div>
        </div>
      </main>

      {!onStart && (
        <div className={"arrive" + (arrived ? " show" : "")}>
          <p>{d.h}</p>
          <button onClick={replay}>⟲</button>
        </div>
      )}
    </div>
  );
}
