import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";

// three.js and the puzzle engines load in their own chunk after the page has painted.
const puzzles = () => import("@/features/landing/Puzzles");
const HeroSquareOne = lazy(() => puzzles().then((m) => ({ default: m.HeroSquareOne })));
const CubeshapePlate = lazy(() => puzzles().then((m) => ({ default: m.CubeshapePlate })));
const TracePlate = lazy(() => puzzles().then((m) => ({ default: m.TracePlate })));
const TraceMemo = lazy(() => puzzles().then((m) => ({ default: m.TraceMemo })));
const AlgRows = lazy(() => puzzles().then((m) => ({ default: m.AlgRows })));

const SESSION = [
  { n: 12, t: "10.21" },
  { n: 11, t: "DNF" },
  { n: 10, t: "9.87" },
  { n: 9, t: "11.40" },
  { n: 8, t: "10.06" },
];

const button =
  "inline-flex items-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-85 transition-opacity";

const App = () => (
  <div className="min-h-screen bg-background text-foreground">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
      <Link to="/" aria-label="Algobase home">
        <Logo className="text-lg" />
      </Link>
      <nav className="flex items-center gap-5 text-sm">
        <Link to="/signin" className="text-foreground/60 hover:text-foreground transition-colors">
          Sign in
        </Link>
        <Link to="/signin" className={`${button} py-2`}>
          Get started
        </Link>
      </nav>
    </header>

    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-10 pb-20 sm:px-8 md:grid-cols-[1fr_minmax(0,28rem)] md:pt-20 md:pb-28">
        <div>
          <h1 className="font-serif text-[2.6rem] font-medium leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            The speedcubing platform you always wanted
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-foreground/60">
            Algobase is a speedcubing timer with real training tools: Square-1 cubeshape drills, 3BLD
            tracing, letter memo and alg lists, all on 3D puzzles you can turn.
          </p>
          <div className="mt-8">
            <Link to="/signin" className={`${button} py-2.5`}>
              Get started, it's free
            </Link>
          </div>
        </div>
        <Suspense fallback={<div className="plate aspect-square w-full" />}>
          <HeroSquareOne />
        </Suspense>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8 md:py-28">
          <h2 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl">Training</h2>
          <p className="mt-3 max-w-lg text-foreground/60">
            Drills for the parts of solving that don't get faster by doing more solves.
          </p>

          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
            <article>
              <Suspense fallback={<div className="plate h-56" />}>
                <CubeshapePlate />
              </Suspense>
              <h3 className="mt-5 text-base font-medium">Square-1 cubeshape</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">
                Pick the shape cases you want, get random-state scrambles into them, and learn to call
                parity before the first slice.
              </p>
            </article>

            <article>
              <Suspense fallback={<div className="plate h-56" />}>
                <TracePlate />
              </Suspense>
              <h3 className="mt-5 text-base font-medium">3BLD tracing</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">
                Trace Old Pochmann edge and corner cycles from a scrambled cube, then check your memo.
              </p>
              <div className="mt-4 min-h-[4.5rem]">
                <Suspense fallback={null}>
                  <TraceMemo />
                </Suspense>
              </div>
            </article>

            <article>
              <div className="plate flex h-56 items-center justify-center font-mono text-3xl tracking-[0.2em] text-foreground/80">
                <span>
                  QF LB
                  <br />
                  XN EH
                </span>
              </div>
              <h3 className="mt-5 text-base font-medium">Letter memo</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">
                Memorize random Speffz letter pairs, then recall the whole sequence from memory.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-8 md:grid-cols-2 md:py-28">
          <div className="plate px-6 py-8 sm:px-10">
            <div className="font-mono text-7xl font-medium tabular-nums tracking-tight sm:text-8xl">9.87</div>
            <dl className="mt-6 grid grid-cols-[4rem_1fr] gap-y-1 font-mono text-sm tabular-nums">
              <dt className="text-foreground/40">ao5</dt>
              <dd className="m-0">10.39</dd>
              <dt className="text-foreground/40">ao12</dt>
              <dd className="m-0">10.84</dd>
            </dl>
            <ol className="mt-6 space-y-1 border-t border-line pt-4 font-mono text-sm tabular-nums text-foreground/50">
              {SESSION.map((s) => (
                <li key={s.n} className="grid grid-cols-[4rem_1fr]">
                  <span className="text-foreground/30">{s.n}</span>
                  <span>{s.t}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl">A timer that stays quiet</h2>
            <p className="mt-4 max-w-md leading-relaxed text-foreground/60">
              Hold space, let go, solve. Everything else fades while the clock runs. Averages update as you
              go, a DNF counts the way it does at a competition, and your csTimer sessions import in one step.
            </p>
            <p className="mt-4 max-w-md leading-relaxed text-foreground/60">
              Your dashboard charts every single, ao5 and ao12 so you can see whether practice is working.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-8 md:grid-cols-2 md:py-28">
          <div>
            <h2 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl">Alg lists</h2>
            <p className="mt-4 max-w-md leading-relaxed text-foreground/60">
              Keep the algs you're learning with a 3D picture of every case, step through them move by move,
              and share a read-only link with anyone.
            </p>
          </div>
          <div className="min-h-[13rem] min-w-0">
            <Suspense fallback={null}>
              <AlgRows />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-14 sm:px-8 md:grid-cols-2 md:gap-12">
          <h2 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl">Competitions</h2>
          <p className="max-w-md leading-relaxed text-foreground/60">
            Upcoming WCA competitions near you, straight from the WCA, with the ones you plan to attend
            bookmarked.
          </p>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:px-8 md:flex-row md:items-center md:justify-between">
          <p className="font-serif text-3xl font-medium tracking-tight sm:text-4xl">Free, in your browser.</p>
          <Link to="/signin" className={`${button} py-2.5`}>
            Create an account
          </Link>
        </div>
      </section>
    </main>

    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl justify-between px-4 py-8 text-sm text-foreground/40 sm:px-8">
        <span>Algobase</span>
        <span>&copy; {new Date().getFullYear()}</span>
      </div>
    </footer>
  </div>
);

export default App;
