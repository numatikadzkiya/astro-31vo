import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme, Theme } from "@/contexts/ThemeContext";
import { MENU_ITEMS, MENU_SECTIONS } from "@/data/menuConfig";
import { playPopSound } from "@/hooks/useAudio";

/* ── Theme definitions ─────────────────────────────────────── */
type ThemeDef = {
  id: Theme;
  emoji: string;
  name: string;
  swatch: string;
  ring: string;
  dot: string;
};

const THEMES: ThemeDef[] = [
  {
    id: "dark",   emoji: "🌌", name: "Luar Angkasa",
    swatch: "linear-gradient(135deg,#0f172a,#1e1b4b,#0e2240)",
    ring: "ring-violet-500 shadow-[0_0_14px_rgba(139,92,246,0.6)]", dot: "bg-violet-400",
  },
  {
    id: "sunset", emoji: "☁️", name: "Langit Cerah",
    swatch: "linear-gradient(135deg,#38bdf8,#7dd3fc,#bae6fd,#e0f2fe)",
    ring: "ring-sky-400 shadow-[0_0_14px_rgba(14,165,233,0.5)]", dot: "bg-sky-400",
  },
  {
    id: "pastel", emoji: "🎨", name: "Pastel",
    swatch: "linear-gradient(135deg,#fff1ad,#d5c9ff,#ffbdd9,#bfeeff)",
    ring: "ring-violet-500 shadow-[0_0_14px_rgba(103,88,212,0.4)]", dot: "bg-violet-500",
  },
  {
    id: "ocean",  emoji: "🌊", name: "Lautan Biru",
    swatch: "linear-gradient(135deg,#0c2a4a,#075985,#0369a1)",
    ring: "ring-cyan-500 shadow-[0_0_14px_rgba(6,182,212,0.5)]", dot: "bg-cyan-400",
  },
  {
    id: "light",  emoji: "❄️", name: "Salju Cerah",
    swatch: "linear-gradient(135deg,#e0f2fe,#f0f9ff,#ffffff)",
    ring: "ring-blue-500 shadow-[0_0_14px_rgba(59,130,246,0.4)]", dot: "bg-blue-500",
  },
  {
    id: "forest", emoji: "🌿", name: "Hutan Hijau",
    swatch: "linear-gradient(135deg,#bbf7d0,#dcfce7,#f0fdf4)",
    ring: "ring-green-500 shadow-[0_0_14px_rgba(34,197,94,0.45)]", dot: "bg-green-500",
  },
];

/* ── Per-theme visual tokens for the full-screen preview ─────── */
const PREVIEW_BG: Record<Theme, string> = {
  dark:   "linear-gradient(160deg,#0f172a 0%,#1e1b4b 50%,#0e2240 100%)",
  ocean:  "linear-gradient(160deg,#061f3a 0%,#0c2a4a 40%,#075985 100%)",
  light:  "linear-gradient(160deg,#bfdbfe 0%,#dbeafe 35%,#e0f2fe 65%,#f0f9ff 100%)",
  forest: "linear-gradient(160deg,#bbf7d0 0%,#d1fae5 35%,#dcfce7 70%,#f0fdf4 100%)",
  sunset: "linear-gradient(160deg,#38bdf8 0%,#7dd3fc 25%,#bae6fd 55%,#e0f2fe 85%,#f0f9ff 100%)",
  pastel: "linear-gradient(160deg,#fff4bd 0%,#f7eaff 42%,#eaf8ff 78%,#eafbea 100%)",
};

const THEME_CARD_SURFACE: Record<Theme, string> = {
  dark: "linear-gradient(135deg,#28274c,#151b35)",
  ocean: "linear-gradient(135deg,#0b5570,#0a2b4a)",
  light: "linear-gradient(135deg,#dbeafe,#bfdbfe)",
  forest: "linear-gradient(135deg,#dcfce7,#bbf7d0)",
  sunset: "linear-gradient(135deg,#bae6fd,#7dd3fc)",
  pastel: "linear-gradient(135deg,#f7eaff,#eaf8ff)",
};

type CardTokens = { bg: string; border: string; text: string; sub: string; icon: string };
const CARD: Record<Theme, CardTokens> = {
  dark:   { bg:"rgba(255,255,255,0.07)", border:"rgba(255,255,255,0.13)", text:"#e2e8f0", sub:"rgba(147,197,253,0.65)", icon:"#38bdf8" },
  ocean:  { bg:"rgba(255,255,255,0.08)", border:"rgba(6,182,212,0.28)", text:"#cffafe", sub:"rgba(103,232,249,0.65)", icon:"#22d3ee" },
  light:  { bg:"rgba(255,255,255,0.78)", border:"rgba(59,130,246,0.22)", text:"#1e3a8a", sub:"#3b82f6", icon:"#2563eb" },
  forest: { bg:"rgba(255,255,255,0.68)", border:"rgba(34,197,94,0.28)", text:"#14532d", sub:"#16a34a", icon:"#15803d" },
  sunset: { bg:"rgba(255,255,255,0.78)", border:"rgba(14,165,233,0.28)", text:"#0c4a6e", sub:"#0369a1", icon:"#0284c7" },
  pastel: { bg:"rgba(255,255,255,0.9)", border:"rgba(116,102,210,0.24)", text:"#30334f", sub:"#535d75", icon:"#6758d4" },
};

const TITLE_COLOR: Record<Theme, string> = {
  dark:"#facc15", ocean:"#67e8f9",
  light:"#1d4ed8", forest:"#166534", sunset:"#0369a1", pastel:"#5144b8",
};

const PANEL_BG: Record<Theme, string> = {
  dark: "linear-gradient(180deg,#0e1326,#0a0f1e)",
  ocean: "linear-gradient(180deg,#0d3a5c,#0a2540)",
  light: "linear-gradient(180deg,#eff6ff,#dbeafe)",
  forest: "linear-gradient(180deg,#f0fdf4,#dcfce7)",
  sunset: "linear-gradient(180deg,#f0f9ff,#e0f2fe)",
  pastel: "linear-gradient(180deg,#fffdf8,#f3efff)",
};

/* ── Full-screen menu preview ────────────────────────────────── */
const FullMenuPreview = ({ theme }: { theme: Theme }) => {
  const c = CARD[theme];
  const { t } = useTranslation();
  const featuredItems = MENU_ITEMS.filter((item) => item.featured);
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true" style={{ background: PREVIEW_BG[theme] }}>
      <div className={`theme-preview-stars theme-preview-stars-${theme}`} aria-hidden="true" />
      <div className="theme-menu-screen">
        <header className="theme-menu-header">
          <div className="theme-menu-brand">
            <span className="theme-menu-brand-mark" style={{ color: TITLE_COLOR[theme] }}>π</span>
            <div>
              <strong>NUMATIK</strong>
              <span>{t("menu.title")}</span>
            </div>
          </div>
          <div className="theme-menu-search" style={{ borderColor: c.border, color: c.sub }}>
            {t("menu.searchPlaceholder")}
          </div>
        </header>

        <div className="theme-menu-featured">
          {featuredItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="theme-menu-featured-card" style={{ background: c.bg, borderColor: c.border }}>
                <Icon aria-hidden="true" style={{ color: c.icon }} />
                <span style={{ color: c.text }}>{t(`menu.${item.key}`)}</span>
                <small style={{ color: c.sub }}>{t(`menuItems.${item.key}.desc`)}</small>
              </div>
            );
          })}
        </div>

        <div className="theme-menu-sections">
          {MENU_SECTIONS.map((section) => (
            <section key={section.group} className="theme-menu-section">
              <h2 style={{ color: TITLE_COLOR[theme] }}>{t(section.labelKey)}</h2>
              <div>
                {MENU_ITEMS
                  .filter((item) => item.group === section.group && !item.featured)
                  .slice(0, 2)
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.key} className="theme-menu-item" style={{ background: c.bg, borderColor: c.border }}>
                        <Icon aria-hidden="true" style={{ color: c.icon }} />
                        <span style={{ color: c.text }}>{t(`menuItems.${item.key}.label`)}</span>
                      </div>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Main modal ──────────────────────────────────────────────── */
interface Props {
  open: boolean;
  onClose: () => void;
  onContinue?: () => void;
}

const ThemePickerModal = ({ open, onClose, onContinue }: Props) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Theme>(theme);
  const [confirming, setConfirming] = useState(false);
  const handleSelect = useCallback((id: Theme) => {
    playPopSound();
    navigator.vibrate?.(10);
    setSelected(id);
    setTheme(id);
  }, [setTheme]);

  useEffect(() => {
    if (open) {
      setSelected(theme);
      setConfirming(false);
    }
  }, [open, theme]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const currentIndex = THEMES.findIndex((item) => item.id === selected);
      const direction = event.key === "ArrowRight" ? 1 : -1;
      handleSelect(THEMES[(currentIndex + direction + THEMES.length) % THEMES.length].id);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSelect, open, selected]);

  const handleContinue = () => {
    playPopSound();
    setConfirming(true);
    if (onContinue) {
      onContinue();
    } else {
      navigate("/menu");
    }
  };

  const handleSkip = () => {
    playPopSound();
    if (onContinue) {
      onClose();
    } else {
      navigate("/menu");
    }
  };

  const activeDef = THEMES.find((thm) => thm.id === selected)!;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="theme-picker-fullscreen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="theme-picker-root fixed inset-0 z-[80] flex flex-col"
          data-theme={selected}
        >
          {/* ── Full-screen preview (fills all space above the panel) ── */}
          <div className="theme-picker-preview relative flex-1 min-h-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="absolute inset-0"
              >
                <FullMenuPreview theme={selected} />
              </motion.div>
            </AnimatePresence>

            {/* Preview label */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/15">
              <span className="text-xs font-body text-white font-black uppercase tracking-widest">
                PRATINJAU
              </span>
            </div>

            {/* Active theme badge */}
            <motion.div
              key={`badge-${selected}`}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/15"
            >
              <span className="text-sm">{activeDef.emoji}</span>
              <span className="font-display text-xs font-bold text-white/85">
                {t(`themeNames.${activeDef.id}`)}
              </span>
            </motion.div>

            {/* Gradient fade into the panel */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          </div>

          {/* ── Bottom control panel ────────────────────────────────── */}
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 40 }}
            className="theme-picker-panel relative z-20 border-t shadow-2xl shadow-black/30"
            style={{ background: PANEL_BG[selected], borderColor: CARD[selected].border }}
          >
            {/* Drag handle */}
            <div className="theme-picker-drag-handle flex justify-center pt-2.5 pb-1">
              <div className="w-9 h-1 rounded-full bg-white/20" />
            </div>

            <div className="theme-picker-math relative px-5 pt-1 pb-5 overflow-hidden">
              <div className="theme-picker-math-pattern" aria-hidden="true">
                <span>π</span><span>Σ</span><span>△</span><span>√</span><span>∞</span>
              </div>
              <div className="picker-progress" aria-label={`${t("selectTheme")} 1 of 2`}>
                <div className="picker-progress-step is-active"><span>01</span><b>{t("selectTheme")}</b></div>
                <div className="picker-progress-line" />
                <div className="picker-progress-step"><span>02</span><b>{t("selectLanguage")}</b></div>
              </div>

              {/* Header row */}
              <div className="theme-picker-heading flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                    <span className="text-sm">🎨</span>
                  </div>
                  <div>
                    <p className="font-display text-[13px] font-black text-white leading-tight">
                      {t("selectTheme")}
                    </p>
                    <p className="font-body text-xs text-white/40">
                      {t("themeSubtitle")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSkip}
                  className="w-11 h-11 rounded-full bg-white/8 hover:bg-white/18 transition flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>

              {/* Theme selection cards */}
              <div
                className="theme-card-rail mb-4"
                role="group"
                aria-label={t("selectTheme")}
              >
                {THEMES.map((thm) => {
                  const isActive = selected === thm.id;
                  return (
                    <motion.button
                      key={thm.id}
                      type="button"
                      onClick={() => handleSelect(thm.id)}
                      title={t(`themeNames.${thm.id}`)}
                      aria-pressed={isActive}
                      className={`future-theme-option future-language-option theme-choice-card relative rounded-2xl flex flex-row items-center justify-start gap-3 px-3 py-2 border-2 transition-colors duration-200 cursor-pointer text-left ${
                        isActive
                          ? `border-transparent ring-2 ${thm.ring}`
                          : "ring-0 border-white/15"
                      }`}
                      animate={{ scale: isActive ? 1 : 0.96, y: isActive ? -3 : 0 }}
                      transition={{ type: "spring", stiffness: 320, damping: 26 }}
                      style={{
                        background: isActive ? thm.swatch : THEME_CARD_SURFACE[thm.id],
                        borderColor: isActive ? "transparent" : CARD[thm.id].border,
                      }}
                    >
                      <span className="theme-choice-swatch" style={{ background: thm.swatch }}>
                        {thm.emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="future-theme-name" style={{ color: TITLE_COLOR[thm.id] }}>
                          {t(`themeNames.${thm.id}`)}
                        </span>
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="active-theme-dot"
                          className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${thm.dot}`}
                        />
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
                {confirming ? t("loading") : t("continueWithTheme", { name: t(`themeNames.${selected}`) })}
              </motion.button>

              {/* Info note */}
              <div className="flex items-center gap-2 mt-2.5">
                <Settings className="w-3 h-3 text-white/30 flex-shrink-0" />
                <p className="font-body text-xs text-white/50 leading-snug">
                  {t("changeThemeHint")}{" "}
                  <span className="text-white/55 font-semibold">{t("settingsTheme")}</span>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThemePickerModal;
