import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LineChart, Timer, Trophy, ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";

/** Wraps content with an IntersectionObserver-driven reveal-on-scroll. */
const Reveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = "", delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const App: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-purple-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto animate-reveal">
        <div className="flex items-center space-x-2">
          <Link to="/">
            <Logo className="text-xl font-medium cursor-pointer hover:opacity-80 transition-opacity" />
          </Link>
        </div>

        <button
          onClick={() => navigate("/signin")}
          className="px-4 py-2 text-sm font-medium border border-foreground/10 rounded-lg hover:bg-foreground/5 transition-all animate-reveal delay-300"
        >
          Get started free
        </button>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Illustration Container */}
          <div className="mb-12 flex justify-center animate-blur-in">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <img
                src="/cube.png"
                alt="Algobase Hero Illustration"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-medium leading-[1.1] mb-10 tracking-tight animate-slide-up delay-200">
            The speedcubing companion <br className="hidden md:block" />
            that levels with you
          </h1>

          <button
            onClick={() => navigate("/signin")}
            className="px-8 py-3 bg-foreground text-background font-medium rounded-full hover:opacity-90 transition-all shadow-xl shadow-foreground/10 active:scale-95 animate-slide-up delay-300"
          >
            Try for free
          </button>
        </div>
      </main>

      {/* Section 01 — Analytics spotlight */}
      <section className="relative px-6 sm:px-8 py-24 md:py-32 overflow-hidden">
        {/* Soft purple atmosphere behind the chart */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[36rem] h-[36rem] rounded-full bg-accent/5 blur-3xl"
        />

        <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-foreground/40">
              <span className="tabular-nums">01</span>
              <span className="w-8 h-px bg-foreground/20" />
              Analytics
            </span>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-medium leading-[1.1] tracking-tight">
              See exactly where your time goes
            </h2>
            <p className="mt-6 text-foreground/60 text-lg leading-relaxed max-w-md">
              Every solve is logged and turned into insight. Track rolling{" "}
              <span className="text-foreground font-medium">ao5</span> and{" "}
              <span className="text-foreground font-medium">ao12</span>, watch
              your personal best fall, and follow your trend line over hours,
              days, or your entire history.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Rolling averages", "Personal bests", "Trend charts"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-full border border-foreground/10 text-xs font-medium text-foreground/60"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </Reveal>

          {/* Hand-built chart card echoing the real dashboard */}
          <Reveal delay={150}>
            <div className="bg-slate-50 border border-foreground/5 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-foreground/40">
                    Solve Insights
                  </div>
                  <div className="text-xs text-foreground/40 mt-0.5">
                    Last 50 solves
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
                  <LineChart className="w-4 h-4" />
                  Trending down
                </span>
              </div>

              <svg
                viewBox="0 0 360 160"
                className="w-full h-auto"
                role="img"
                aria-label="Line chart of solve times trending downward"
              >
                <defs>
                  <linearGradient id="ao5fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333ea" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* gridlines */}
                {[40, 80, 120].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="360"
                    y2={y}
                    stroke="#1a1a1a"
                    strokeOpacity="0.05"
                  />
                ))}

                {/* area under the ao5 curve */}
                <polygon
                  points="10,40 40,52 70,48 100,62 130,70 160,66 190,80 220,86 250,92 280,96 310,104 350,108 350,160 10,160"
                  fill="url(#ao5fill)"
                />

                {/* single (faint) */}
                <polyline
                  points="10,36 40,60 70,42 100,72 130,58 160,84 190,70 220,96 250,82 280,108 310,92 350,116"
                  fill="none"
                  stroke="#9ca3af"
                  strokeOpacity="0.5"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />

                {/* ao5 (accent) */}
                <polyline
                  points="10,40 40,52 70,48 100,62 130,70 160,66 190,80 220,86 250,92 280,96 310,104 350,108"
                  fill="none"
                  stroke="#9333ea"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <circle cx="350" cy="108" r="4" fill="#9333ea" />
              </svg>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Ao5", value: "9.42" },
                  { label: "Ao12", value: "10.18" },
                  { label: "PB", value: "7.05" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl bg-background border border-foreground/5 py-3"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                      {stat.label}
                    </div>
                    <div className="mt-1 text-xl font-serif font-medium tabular-nums">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Section 02 — Clean UI + WCA integration (inverted band) */}
      <section className="bg-foreground text-background px-6 sm:px-8 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <Reveal className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-background/40">
              <span className="tabular-nums">02</span>
              <span className="w-8 h-px bg-background/20" />
              The experience
            </span>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-medium leading-[1.1] tracking-tight">
              Distraction-free practice, competition-ready
            </h2>
          </Reveal>

          <div className="mt-14 grid md:grid-cols-2 gap-6">
            <Reveal delay={100}>
              <div className="h-full rounded-2xl border border-background/10 bg-background/5 p-8 transition-colors hover:bg-background/10">
                <div className="w-11 h-11 rounded-xl bg-background/10 flex items-center justify-center">
                  <Timer className="w-5 h-5" />
                </div>
                <h3 className="mt-6 text-2xl font-serif font-medium tracking-tight">
                  A timer that gets out of the way
                </h3>
                <p className="mt-3 text-background/60 leading-relaxed">
                  Hold to arm, release to start. The moment you begin a solve the
                  interface fades away, leaving nothing but the clock. A clean,
                  considered UI that keeps you in flow on every attempt.
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="h-full rounded-2xl border border-background/10 bg-background/5 p-8 transition-colors hover:bg-background/10">
                <div className="w-11 h-11 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="mt-6 text-2xl font-serif font-medium tracking-tight">
                  Never miss a competition
                </h3>
                <p className="mt-3 text-background/60 leading-relaxed">
                  Algobase pulls upcoming events straight from the official WCA
                  API. Browse competitions in your region and bookmark the ones
                  you want to attend so they're always a tap away.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={150}>
            <button
              onClick={() => navigate("/signin")}
              className="group mt-14 inline-flex items-center gap-2 px-8 py-3 bg-background text-foreground font-medium rounded-full hover:opacity-90 transition-all active:scale-95"
            >
              Start tracking your solves
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </Reveal>
        </div>
      </section>

      {/* Footer / Secondary Nav (Minimal as per original design) */}
      <footer className="border-t border-foreground/5 py-12 px-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-foreground/40">
          <p>© 2026 Algobase Inc.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
