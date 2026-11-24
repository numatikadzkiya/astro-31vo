import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Lightbulb, Mail, MessageSquare, Send, Sparkles } from "lucide-react";
import PageNavigation from "@/components/PageNavigation";
import Starfield from "@/components/Starfield";
import { playPopSound } from "@/hooks/useAudio";

const KritikSaranPage = () => {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");

  const sendFeedback = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    playPopSound();
    const subject = encodeURIComponent("Kritik & Saran NUMATIK");
    const body = encodeURIComponent(trimmedMessage);
    window.open(`mailto:numatik.app@gmail.com?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <div className="relative min-h-screen overflow-hidden gradient-space">
      <Starfield />
      <PageNavigation hideBackButton />

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-24 pt-24 sm:px-6 sm:pt-28">
        <header className="mx-auto mb-8 max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-bold tracking-[0.18em] text-primary backdrop-blur">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            {t("kritikSaran.eyebrow")}
          </div>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/25 to-cyan-400/10 shadow-[0_0_35px_hsl(var(--primary)/0.2)]">
            <MessageSquare aria-hidden="true" className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-primary text-glow-cyan sm:text-4xl">
            {t("kritikSaran.pageTitle")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl font-body text-sm leading-relaxed text-foreground/75 sm:text-base">
            {t("kritikSaran.intro")}
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-[minmax(0,1.35fr)_minmax(240px,0.8fr)]">
          <section className="rounded-3xl border border-primary/20 bg-card/80 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
            <div className="mb-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-primary/80">
                {t("kritikSaran.formEyebrow")}
              </p>
              <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                {t("kritikSaran.formTitle")}
              </h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                {t("kritikSaran.formDescription")}
              </p>
            </div>

            <label htmlFor="kritik-saran-message" className="mb-2 block text-sm font-semibold text-foreground">
              {t("kritikSaran.messageLabel")}
            </label>
            <textarea
              id="kritik-saran-message"
              className="min-h-48 w-full resize-y rounded-2xl border border-border bg-background/70 p-4 font-body text-sm leading-relaxed text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/70 focus:ring-4 focus:ring-primary/10"
              placeholder={t("kritikSaran.placeholder")}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{t("kritikSaran.emailNote")}</span>
              <span className="shrink-0 tabular-nums">{message.length}</span>
            </div>

            <button
              type="button"
              onClick={sendFeedback}
              disabled={!message.trim()}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-display text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:enabled:-translate-y-0.5 hover:enabled:shadow-xl disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Send aria-hidden="true" className="h-4 w-4" />
              {t("kritikSaran.sendEmail")}
            </button>

            <div className="mt-4 flex items-start gap-3 rounded-xl border border-border/70 bg-background/40 p-3">
              <Mail aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="font-body text-xs leading-relaxed text-muted-foreground">
                {t("kritikSaran.recipientNote")}
                <span className="ml-1 font-semibold text-foreground">numatik.app@gmail.com</span>
              </p>
            </div>
          </section>

          <aside className="flex flex-col rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/75 to-secondary/20 p-5 shadow-xl backdrop-blur-xl sm:p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <Lightbulb aria-hidden="true" className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-lg font-bold text-foreground">
              {t("kritikSaran.ideasTitle")}
            </h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-foreground/70">
              {t("kritikSaran.ideasIntro")}
            </p>

            <ul className="mt-5 space-y-3">
              {(["ideaExperience", "ideaIssue", "ideaFeature"] as const).map((key, index) => (
                <li key={key} className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/40 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="font-body text-sm leading-relaxed text-foreground/80">
                    {t(`kritikSaran.${key}`)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-6">
              <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <p className="mt-5 font-display text-sm font-semibold leading-relaxed text-primary">
                {t("kritikSaran.thankYou")}
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default KritikSaranPage;
