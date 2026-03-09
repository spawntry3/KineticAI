import heroBg from "@/assets/hero-bg.jpg";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const HERO_VIDEO_URL = import.meta.env.VITE_HERO_BG_VIDEO_URL;
  const hasVideo = typeof HERO_VIDEO_URL === "string" && HERO_VIDEO_URL.trim().length > 0;

  return (
    <section className="relative min-h-[42vh] md:min-h-[52vh] flex items-center justify-center overflow-hidden">
      {hasVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-25 scale-[1.02] motion-reduce:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={heroBg}
          aria-hidden="true"
        >
          <source src={HERO_VIDEO_URL} />
        </video>
      ) : null}
      <img
        src={heroBg}
        alt=""
        aria-hidden="true"
        className={[
          "absolute inset-0 h-full w-full object-cover opacity-25 scale-[1.02]",
          hasVideo ? "motion-safe:hidden" : "",
        ].join(" ")}
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/75 to-background" />
      <div className="relative z-10 text-center px-6 py-20">
        <div className="inline-flex items-center rounded-full border border-border/60 bg-card/40 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-xl">
          AI Studio · Image & Video generation
        </div>
        <h1 className="mt-5 text-5xl md:text-7xl font-display font-bold tracking-tight">
          <span className="gradient-text">KineticAI</span>
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Создавайте изображения и видео с помощью ИИ — быстро, чисто, без лишнего.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/generate"
            className="btn-generate inline-flex h-11 items-center justify-center rounded-xl px-6 text-sm text-primary-foreground"
          >
            Начать генерацию
          </Link>
          <Link
            to="/gallery"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border/70 bg-card/40 px-6 text-sm text-foreground/90 backdrop-blur-xl transition-colors hover:bg-card/60"
          >
            Открыть галерею
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
