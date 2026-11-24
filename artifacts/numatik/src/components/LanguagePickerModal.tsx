import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";
import * as THREE from "three";
import { useTranslation } from "react-i18next";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { pickLang } from "@/lib/pickLang";
import { playPopSound } from "@/hooks/useAudio";

type LangDef = {
  id: Language;
  code: string;
  flag: string;
  native: string;
  ring: string;
};

const LANGUAGES: LangDef[] = [
  {
    id: "id",
    code: "ID",
    flag: "🇮🇩",
    native: "Bahasa Indonesia",
    ring: "ring-red-400 shadow-[0_0_16px_rgba(220,38,38,0.55)]",
  },
  {
    id: "en",
    code: "EN",
    flag: "🇬🇧",
    native: "English",
    ring: "ring-blue-400 shadow-[0_0_16px_rgba(29,78,216,0.55)]",
  },
  {
    id: "ms-MY",
    code: "MS",
    flag: "🇲🇾",
    native: "Bahasa Melayu",
    ring: "ring-blue-400 shadow-[0_0_16px_rgba(29,78,216,0.55)]",
  },
  {
    id: "ja",
    code: "JA",
    flag: "🇯🇵",
    native: "日本語",
    ring: "ring-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.55)]",
  },
  {
    id: "zh-CN",
    code: "ZH",
    flag: "🇨🇳",
    native: "简体中文",
    ring: "ring-red-400 shadow-[0_0_16px_rgba(220,38,38,0.55)]",
  },
  {
    id: "ru",
    code: "RU",
    flag: "🇷🇺",
    native: "Русский",
    ring: "ring-blue-400 shadow-[0_0_16px_rgba(37,99,235,0.55)]",
  },
];

const LANGUAGE_GREETINGS: Record<Language, string> = {
  id: "Halo!",
  en: "Hello!",
  "ms-MY": "Hai!",
  ja: "こんにちは",
  "zh-CN": "你好",
  ru: "Привет",
};

const LANGUAGE_CONTINUE_LABELS: Record<Language, string> = {
  id: "Lanjut",
  en: "Continue",
  "ms-MY": "Teruskan",
  ja: "続ける",
  "zh-CN": "继续",
  ru: "Продолжить",
};

const LANGUAGE_ACCENTS: Record<Language, string> = {
  id: "#dc2626",
  en: "#1d4ed8",
  "ms-MY": "#059669",
  ja: "#be123c",
  "zh-CN": "#dc2626",
  ru: "#1d4ed8",
};

const getLanguageCardStyle = (language: Language, isActive: boolean, isDark: boolean) => {
  const accent = LANGUAGE_ACCENTS[language];
  const base = isDark ? "#081426" : "#ffffff";
  const borderMix = isActive ? "82%" : "62%";
  return {
    background: isDark
      ? `linear-gradient(145deg, color-mix(in srgb, ${accent} ${isActive ? "46%" : "32%"}, ${base}), color-mix(in srgb, ${accent} ${isActive ? "30%" : "20%"}, #101b30))`
      : `linear-gradient(145deg, color-mix(in srgb, ${accent} ${isActive ? "24%" : "14%"}, #ffffff), color-mix(in srgb, ${accent} ${isActive ? "14%" : "6%"}, #f8fafc))`,
    borderColor: `color-mix(in srgb, ${accent} ${borderMix}, ${isDark ? "#e0f2fe" : "#0f172a"})`,
    boxShadow: isActive
      ? `0 0 0 2px ${accent}, inset 0 2px 0 rgba(255,255,255,.28), 0 6px 0 color-mix(in srgb, ${accent} 58%, #0f172a), 0 13px 22px color-mix(in srgb, ${accent} 28%, transparent)`
      : `inset 0 2px 0 rgba(255,255,255,.48), inset 0 -3px 0 color-mix(in srgb, ${accent} 18%, transparent), 0 5px 0 color-mix(in srgb, ${accent} 38%, #64748b), 0 10px 18px rgba(15,23,42,.16)`,
  };
};

const createEarthTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create the globe texture canvas");

  const ocean = context.createLinearGradient(0, 0, 0, canvas.height);
  ocean.addColorStop(0, "#071f52");
  ocean.addColorStop(0.42, "#075da3");
  ocean.addColorStop(0.68, "#0874b5");
  ocean.addColorStop(1, "#041a45");
  context.fillStyle = ocean;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "rgba(164,218,255,.075)";
  context.lineWidth = 1;
  for (let latitude = -60; latitude <= 60; latitude += 30) {
    const y = ((90 - latitude) / 180) * canvas.height;
    context.beginPath();
    context.ellipse(canvas.width / 2, y, canvas.width / 2, Math.max(6, Math.cos(latitude * Math.PI / 180) * 28), 0, 0, Math.PI * 2);
    context.stroke();
  }
  for (let longitude = -60; longitude <= 60; longitude += 30) {
    const x = ((longitude + 180) / 360) * canvas.width;
    context.beginPath();
    context.ellipse(x, canvas.height / 2, 28, canvas.height / 2, 0, 0, Math.PI * 2);
    context.stroke();
  }

  const continents = [
    [[0.08,0.2],[0.12,0.12],[0.2,0.1],[0.24,0.16],[0.22,0.23],[0.19,0.25],[0.2,0.33],[0.16,0.4],[0.13,0.35],[0.11,0.27]],
    [[0.22,0.42],[0.27,0.45],[0.28,0.54],[0.26,0.62],[0.25,0.72],[0.22,0.79],[0.2,0.68],[0.21,0.57],[0.19,0.49]],
    [[0.43,0.18],[0.48,0.13],[0.54,0.16],[0.57,0.22],[0.54,0.28],[0.49,0.27],[0.46,0.32],[0.42,0.29]],
    [[0.43,0.34],[0.48,0.31],[0.53,0.35],[0.54,0.46],[0.51,0.55],[0.49,0.67],[0.46,0.74],[0.43,0.63],[0.42,0.51],[0.4,0.42]],
    [[0.55,0.19],[0.61,0.13],[0.7,0.14],[0.77,0.2],[0.84,0.19],[0.89,0.24],[0.87,0.3],[0.8,0.31],[0.76,0.37],[0.69,0.35],[0.66,0.42],[0.6,0.4],[0.57,0.32]],
    [[0.75,0.43],[0.81,0.4],[0.85,0.45],[0.83,0.55],[0.8,0.63],[0.77,0.59],[0.74,0.51]],
    [[0.88,0.71],[0.91,0.69],[0.94,0.73],[0.92,0.78],[0.89,0.77]],
  ];
  const land = context.createLinearGradient(0, 35, 0, 210);
  land.addColorStop(0, "#a2c875");
  land.addColorStop(0.42, "#4e9a55");
  land.addColorStop(0.72, "#8cae58");
  land.addColorStop(1, "#b8ab68");
  context.fillStyle = land;
  context.strokeStyle = "rgba(196,231,154,.5)";
  context.lineWidth = 2.5;
  for (const continent of continents) {
    context.beginPath();
    continent.forEach(([x, y], index) => {
      const px = x * canvas.width;
      const py = y * canvas.height;
      if (index === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    });
    context.closePath();
    context.fill();
    context.stroke();
  }

  let seed = 3917;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  context.save();
  context.beginPath();
  for (const continent of continents) {
    continent.forEach(([x, y], index) => {
      const px = x * canvas.width;
      const py = y * canvas.height;
      if (index === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    });
    context.closePath();
  }
  context.clip();
  for (let index = 0; index < 900; index += 1) {
    const x = random() * canvas.width;
    const y = random() * canvas.height;
    const size = 0.6 + random() * 2;
    const warmTerrain = y < 88 || y > 165;
    context.fillStyle = warmTerrain
      ? `rgba(205,183,112,${0.08 + random() * 0.16})`
      : `rgba(195,232,138,${0.08 + random() * 0.18})`;
    context.beginPath();
    context.ellipse(x, y, size * (1.2 + random()), size, random() * Math.PI, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 1;
  return texture;
};

const createCloudTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create the cloud texture canvas");

  let seed = 1789;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  context.filter = "blur(2px)";
  for (let index = 0; index < 55; index += 1) {
    const centerX = random() * canvas.width;
    const centerY = 32 + random() * 190;
    const width = 12 + random() * 34;
    const height = 2.5 + random() * 7.5;
    context.fillStyle = `rgba(235,249,255,${0.08 + random() * 0.12})`;
    context.beginPath();
    context.ellipse(centerX, centerY, width, height, (random() - 0.5) * 0.45, 0, Math.PI * 2);
    context.fill();
    for (let puff = 0; puff < 4; puff += 1) {
      context.beginPath();
      context.ellipse(
        centerX + (random() - 0.5) * width,
        centerY + (random() - 0.5) * height,
        width * (0.18 + random() * 0.2),
        height * (0.45 + random() * 0.75),
        (random() - 0.5) * 0.5,
        0,
        Math.PI * 2,
      );
      context.fill();
    }
  }
  context.filter = "none";
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 1;
  return texture;
};

const LanguageGlobe = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    } catch {
      setUnavailable(true);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
    camera.position.z = 3.35;

    const geometry = new THREE.SphereGeometry(1, 48, 32);
    const material = new THREE.MeshStandardMaterial({
      map: createEarthTexture(),
      roughness: 0.96,
      metalness: 0,
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    const cloudsGeometry = new THREE.SphereGeometry(1.008, 48, 32);
    const cloudsMaterial = new THREE.MeshBasicMaterial({
      map: createCloudTexture(),
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    clouds.renderOrder = 1;
    scene.add(clouds);
    scene.add(new THREE.AmbientLight(0x789bc7, 0.95));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(-2.5, 2, 4);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x238dff, 1.8);
    rimLight.position.set(3, -0.5, -2);
    scene.add(rimLight);

    const pixelRatioCap = matchMedia("(max-width: 700px)").matches ? 1.25 : 1.5;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const resize = () => {
      const size = Math.max(1, Math.min(mount.clientWidth, mount.clientHeight));
      renderer.setSize(size, size, false);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    return () => {
      observer.disconnect();
      geometry.dispose();
      cloudsGeometry.dispose();
      material.map?.dispose();
      material.dispose();
      cloudsMaterial.map?.dispose();
      cloudsMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div ref={mountRef} className={`language-globe${unavailable ? " is-unavailable" : ""}`} aria-hidden="true">
      {unavailable && (
        <svg viewBox="0 0 160 160" role="presentation">
          <defs>
            <radialGradient id="language-globe-ocean" cx="32%" cy="28%">
              <stop offset="0%" stopColor="#5ee8ff" />
              <stop offset="62%" stopColor="#1384b5" />
              <stop offset="100%" stopColor="#06294d" />
            </radialGradient>
            <clipPath id="language-globe-clip"><circle cx="80" cy="80" r="63" /></clipPath>
          </defs>
          <circle cx="80" cy="80" r="63" fill="url(#language-globe-ocean)" />
          <g clipPath="url(#language-globe-clip)" fill="#78d69a" stroke="#d1fae5" strokeOpacity=".6">
            <path d="M22 48 36 31 54 28 62 39 57 53 48 58 51 71 42 82 34 71 31 58Z" />
            <path d="m51 85 12 4 6 16-6 21-8 13-7-22 3-17-7-9Z" />
            <path d="m72 44 14-8 12 4 2 10-13 6-8-4Z" />
            <path d="m82 62 17-8 13 9 2 20-10 14-3 20-10 12-8-18 2-17-8-16Z" />
            <path d="m101 41 16-9 22 4 12 13-11 10-16-3-7 12-12-5-7-11Z" />
            <path d="m122 82 13-5 10 8-7 18-10 10-9-13Z" />
          </g>
          <ellipse cx="80" cy="80" rx="26" ry="63" fill="none" stroke="#dff8ff" strokeOpacity=".42" />
          <path d="M17 80h126M25 57h110M25 103h110" fill="none" stroke="#dff8ff" strokeOpacity=".3" />
          <circle cx="80" cy="80" r="63" fill="none" stroke="#e0f2fe" strokeOpacity=".8" strokeWidth="2" />
        </svg>
      )}
    </div>
  );
};

type ThemeStyles = {
  topBg: string;
  topTextTitle: string;
  topTextSub: string;
  topBadgeBg: string;
  topBadgeText: string;
  topBadgeBorder: string;
  floatingWordColor: string;
  starOpacity: number;
  panelBg: string;
  panelBorder: string;
  dragHandle: string;
  headerTitle: string;
  headerSub: string;
  cardText: string;
  cardSubText: string;
  checkBg: string;
  checkText: string;
  infoText: string;
  infoIcon: string;
  infoHighlight: string;
};

function getThemeStyles(theme: string): ThemeStyles {
  switch (theme) {
    case "ocean":
      return {
        topBg: "linear-gradient(160deg,#0c2a4a 0%,#0d3d62 50%,#0a2540 100%)",
        topTextTitle: "text-sky-100/90",
        topTextSub: "text-sky-200/50",
        topBadgeBg: "bg-sky-900/50 backdrop-blur-sm",
        topBadgeText: "text-sky-100/85",
        topBadgeBorder: "border-sky-400/30",
        floatingWordColor: "text-sky-200/40",
        starOpacity: 0.25,
        panelBg: "bg-gradient-to-b from-[#0d3a5c] to-[#0a2540]",
        panelBorder: "border-sky-400/20",
        dragHandle: "bg-sky-300/25",
        headerTitle: "text-sky-50",
        headerSub: "text-sky-200/50",
        cardText: "text-sky-50",
        cardSubText: "text-sky-200/55",
        checkBg: "bg-sky-400/80",
        checkText: "text-slate-900",
        infoText: "text-sky-300/40",
        infoIcon: "text-sky-300/35",
        infoHighlight: "text-sky-200/60",
      };

    case "pastel":
      return {
        topBg: "linear-gradient(160deg,#fff1ad 0%,#efe2ff 50%,#dff6ff 100%)",
        topTextTitle: "text-indigo-950/90",
        topTextSub: "text-indigo-800/60",
        topBadgeBg: "bg-white/60 backdrop-blur-sm",
        topBadgeText: "text-indigo-950/85",
        topBadgeBorder: "border-violet-300/50",
        floatingWordColor: "text-violet-700/35",
        starOpacity: 0.08,
        panelBg: "bg-gradient-to-b from-[#fffdf8] to-[#f3efff]",
        panelBorder: "border-violet-200/60",
        dragHandle: "bg-violet-300/40",
        headerTitle: "text-indigo-950",
        headerSub: "text-indigo-700/65",
        cardText: "text-indigo-950",
        cardSubText: "text-indigo-700/70",
        checkBg: "bg-violet-500",
        checkText: "text-white",
        infoText: "text-indigo-600/60",
        infoIcon: "text-violet-400/60",
        infoHighlight: "text-indigo-800/80",
      };

    case "light":
      return {
        topBg: "linear-gradient(160deg,#c7d2fe 0%,#e0e7ff 50%,#bfdbfe 100%)",
        topTextTitle: "text-indigo-900/85",
        topTextSub: "text-indigo-700/55",
        topBadgeBg: "bg-white/60 backdrop-blur-sm",
        topBadgeText: "text-indigo-900/85",
        topBadgeBorder: "border-indigo-300/50",
        floatingWordColor: "text-indigo-700/35",
        starOpacity: 0.08,
        panelBg: "bg-gradient-to-b from-white to-indigo-50",
        panelBorder: "border-indigo-200/60",
        dragHandle: "bg-indigo-300/40",
        headerTitle: "text-indigo-900",
        headerSub: "text-indigo-600/60",
        cardText: "text-indigo-900",
        cardSubText: "text-indigo-600/65",
        checkBg: "bg-indigo-500",
        checkText: "text-white",
        infoText: "text-indigo-500/55",
        infoIcon: "text-indigo-400/50",
        infoHighlight: "text-indigo-700/75",
      };

    case "forest":
      return {
        topBg: "linear-gradient(160deg,#bbf7d0 0%,#86efac 50%,#d1fae5 100%)",
        topTextTitle: "text-green-900/85",
        topTextSub: "text-green-800/55",
        topBadgeBg: "bg-white/55 backdrop-blur-sm",
        topBadgeText: "text-green-900/85",
        topBadgeBorder: "border-green-400/45",
        floatingWordColor: "text-green-800/35",
        starOpacity: 0.06,
        panelBg: "bg-gradient-to-b from-[#f0fdf4] to-[#dcfce7]",
        panelBorder: "border-green-300/50",
        dragHandle: "bg-green-400/35",
        headerTitle: "text-green-900",
        headerSub: "text-green-700/60",
        cardText: "text-green-900",
        cardSubText: "text-green-700/65",
        checkBg: "bg-green-600",
        checkText: "text-white",
        infoText: "text-green-600/55",
        infoIcon: "text-green-500/50",
        infoHighlight: "text-green-800/75",
      };

    case "sunset":
      return {
        topBg: "linear-gradient(160deg,#fed7aa 0%,#fde68a 40%,#fca5a5 100%)",
        topTextTitle: "text-orange-900/85",
        topTextSub: "text-orange-800/55",
        topBadgeBg: "bg-white/55 backdrop-blur-sm",
        topBadgeText: "text-orange-900/85",
        topBadgeBorder: "border-orange-400/40",
        floatingWordColor: "text-orange-800/35",
        starOpacity: 0.05,
        panelBg: "bg-gradient-to-b from-[#fff7ed] to-[#ffedd5]",
        panelBorder: "border-orange-200/60",
        dragHandle: "bg-orange-400/35",
        headerTitle: "text-orange-900",
        headerSub: "text-orange-700/60",
        cardText: "text-orange-900",
        cardSubText: "text-orange-700/65",
        checkBg: "bg-orange-500",
        checkText: "text-white",
        infoText: "text-orange-600/55",
        infoIcon: "text-orange-500/50",
        infoHighlight: "text-orange-800/75",
      };

    default:
      return {
        topBg: "linear-gradient(160deg,#0f172a 0%,#1e1b4b 50%,#0e2240 100%)",
        topTextTitle: "text-white/80",
        topTextSub: "text-white/40",
        topBadgeBg: "bg-black/30 backdrop-blur-sm",
        topBadgeText: "text-white/85",
        topBadgeBorder: "border-white/15",
        floatingWordColor: "text-white/40",
        starOpacity: 0.3,
        panelBg: "bg-gradient-to-b from-[#0e1326] to-[#0a0f1e]",
        panelBorder: "border-white/10",
        dragHandle: "bg-white/20",
        headerTitle: "text-white",
        headerSub: "text-white/40",
        cardText: "text-white",
        cardSubText: "text-white/45",
        checkBg: "bg-cyan-400/80",
        checkText: "text-slate-900",
        infoText: "text-white/35",
        infoIcon: "text-white/30",
        infoHighlight: "text-white/55",
      };
  }
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const LanguagePickerModal = ({ open, onClose }: Props) => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Language>(language);
  const [confirming, setConfirming] = useState(false);
  const [launching, setLaunching] = useState(false);

  const s = getThemeStyles(theme);
  const isDarkTheme = theme === "dark" || theme === "ocean";

  useEffect(() => {
    if (open) {
      setSelected(language);
      setConfirming(false);
      setLaunching(false);
    }
  }, [open, language]);

  const handleSelect = (id: Language) => {
    playPopSound();
    navigator.vibrate?.(10);
    setSelected(id);
    setLanguage(id);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", id);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const handleContinue = () => {
    playPopSound();
    setConfirming(true);
    setLaunching(true);
    setLanguage(selected);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", selected);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    setTimeout(() => navigate("/menu", { state: { showLearningWelcome: true } }), 900);
  };

  const activeDef = LANGUAGES.find((l) => l.id === selected)!;

  const activeIndex = LANGUAGES.findIndex((item) => item.id === selected);
  const greetings = LANGUAGES.map((lang, index) => {
    const angle = ((index - activeIndex + LANGUAGES.length) % LANGUAGES.length) * 60 - 90;
    const radians = (angle * Math.PI) / 180;
    return {
      lang,
      x: 50 + Math.cos(radians) * 38,
      y: 50 + Math.sin(radians) * 29,
      delay: index * 0.025,
    };
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="lang-picker-fullscreen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="language-picker-root fixed inset-0 z-[90] flex flex-col"
        >
          {/* ── Top decorative area ── */}
          <div
            className="language-picker-preview relative flex-1 min-h-0 overflow-hidden"
            style={{ background: s.topBg }}
          >
            <div className="language-math-decor" aria-hidden="true">
              <span className="language-math-symbol lang-pi">πr²</span>
              <span className="language-math-symbol lang-sigma">Σ</span>
              <span className="language-math-symbol lang-fraction"><i>1</i><b>2</b></span>
              <span className="language-math-symbol lang-cube">x³</span>
              <span className="language-math-orbit orbit-one" />
              <span className="language-math-orbit orbit-two" />
            </div>
            {/* Star/dot pattern */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(100,100,200,0.3) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
                opacity: s.starOpacity,
              }}
            />

            {/* Orbiting greetings */}
            <motion.div
              className="language-greetings-orbit absolute inset-0 pointer-events-none"
              animate={{ rotate: 360 }}
              transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
            >
              {greetings.map(({ lang, x, y, delay }) => (
                <div
                  key={lang.id}
                  className="language-orbit-position absolute"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{
                      rotate: -360,
                      opacity: selected === lang.id ? 1 : 0.62,
                      scale: selected === lang.id ? 1.15 : 1,
                    }}
                    transition={{
                      rotate: { duration: 42, repeat: Infinity, ease: "linear" },
                      opacity: { delay, duration: 0.2 },
                      scale: { duration: 0.2 },
                    }}
                    className={`language-orbit-greeting font-display font-bold text-xs select-none ${s.floatingWordColor} ${selected === lang.id ? "is-selected" : ""}`}
                  >
                    {pickLang(LANGUAGE_GREETINGS, lang.id)}
                  </motion.div>
                </div>
              ))}
            </motion.div>

            {/* Center globe */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="language-globe-wrap">
                <motion.div
                  key={selected}
                  className="language-greeting-bubble"
                  initial={{ opacity: 0, scale: 0.65, y: 22 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{ transformOrigin: "left bottom" }}
                >
                  {pickLang(LANGUAGE_GREETINGS, selected)}
                </motion.div>
                <div className="language-globe-glow" aria-hidden="true" />
                <LanguageGlobe />
              </div>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.02 }}
                className={`font-display font-black text-lg tracking-widest ${s.topTextTitle}`}
              >
                {t("selectLanguage").toUpperCase()}
              </motion.p>
            </div>

            {/* Active language badge */}
            <motion.div
              key={`badge-${selected}`}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full border ${s.topBadgeBg} ${s.topBadgeBorder}`}
            >
              <span className="text-sm">{activeDef.flag}</span>
              <span className={`font-display text-xs font-bold ${s.topBadgeText}`}>
                {activeDef.native}
              </span>
            </motion.div>

            {/* Gradient fade into panel */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
          </div>

          {/* ── Bottom control panel ── */}
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 40 }}
            className={`language-picker-panel relative z-20 border-t shadow-2xl ${s.panelBg} ${s.panelBorder}`}
          >
            {/* Drag handle */}
            <div className="language-picker-drag-handle flex justify-center pt-2.5 pb-1">
              <div className={`w-9 h-1 rounded-full ${s.dragHandle}`} />
            </div>

            <div className="language-picker-math relative px-5 pt-1 pb-5 overflow-hidden">
              <div className="language-picker-math-pattern" aria-hidden="true">
                <span>1+1=2</span><span>A²+B²=C²</span><span>∠90°</span>
              </div>
              <div className="picker-progress picker-progress-language" aria-label={`${t("selectLanguage")} 2 of 2`}>
                <div className="picker-progress-step"><span>01</span><b>{t("selectTheme")}</b></div>
                <div className="picker-progress-line is-complete" />
                <div className="picker-progress-step is-active"><span>02</span><b>{t("selectLanguage")}</b></div>
              </div>
              {/* Header */}
              <div className="language-picker-heading flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
                  <span className="text-sm">🌐</span>
                </div>
                <div>
                  <p className={`font-display text-[13px] font-black leading-tight ${s.headerTitle}`}>
                    {t("selectLanguage")}
                  </p>
                  <p className={`font-body text-xs ${s.headerSub}`}>
                    {t("languageSubtitle")}
                  </p>
                </div>
              </div>

              {/* Language cards */}
              <div className="language-button-grid mb-4">
                {LANGUAGES.map((lang) => {
                  const isActive = selected === lang.id;
                  return (
                    <motion.button
                      key={lang.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(lang.id)}
                      aria-pressed={isActive}
                      className={`future-language-option relative flex items-center gap-3 rounded-2xl px-3 py-3 border-2 transition-all duration-200 cursor-pointer text-left ${
                        isActive ? `border-transparent ring-2 ${lang.ring}` : "border-solid"
                      }`}
                      style={getLanguageCardStyle(lang.id, isActive, isDarkTheme)}
                    >
                      <span className="future-language-flag text-3xl leading-none">{lang.flag}</span>
                      <div className="flex-1 min-w-0">
                        <span className={`future-language-code inline-block mb-1 ${s.cardSubText}`}>
                          {lang.code}
                        </span>
                        <p className={`font-display font-black text-sm leading-tight ${s.cardText}`}>
                          {lang.native}
                        </p>
                        <p className={`font-body text-xs mt-1 ${s.cardSubText}`}>
                          {pickLang(LANGUAGE_GREETINGS, lang.id)}
                        </p>
                      </div>
                      {isActive && (
                        <motion.div
                          layoutId="active-lang-check"
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${s.checkBg}`}
                        >
                          <span className={`text-[10px] font-black ${s.checkText}`}>✓</span>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* CTA button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleContinue}
                disabled={confirming}
                className="w-full py-3.5 rounded-2xl font-display font-black text-[15px] text-white tracking-wide bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 cursor-pointer disabled:opacity-70"
              >
                {confirming ? t("loading") : pickLang(LANGUAGE_CONTINUE_LABELS, activeDef.id)}
              </motion.button>

              {/* Info note */}
              <div className="flex items-center gap-2 mt-2.5">
                <Settings className={`w-3 h-3 flex-shrink-0 ${s.infoIcon}`} />
                <p className={`font-body text-xs leading-snug ${s.infoText}`}>
                  {t("changeLanguageHint")}{" "}
                  <span className={`font-semibold ${s.infoHighlight}`}>{t("settingsLanguage")}</span>
                </p>
              </div>
            </div>
          </motion.div>
          <AnimatePresence>
            {launching && (
              <motion.div
                className="language-launch-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                aria-hidden="true"
              >
                <motion.div
                  className="language-launch-beam"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: [0, 1, 1.5], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.85, ease: "easeInOut" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LanguagePickerModal;
