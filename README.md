# Algobase

A speedcubing timer I built because every other one either looked dated or buried the stats I actually cared about. You hold space, you solve, and Algobase keeps track of the rest.

It's a personal project, so it's opinionated: 3x3 first, clean UI, and the numbers that tell you whether you're actually getting faster.

## Features

- **Space-bar timer** - hold to arm, release to start, tap to stop. The way it should work.
- **WCA-style scrambles** - 20 random moves, no redundant or cancelling turns, new scramble after every solve.
- **Solve history** - every solve saved with its scramble, plus DNF marking and a detail view for any solve.
- **Stats that matter** - best single, Ao5, Ao12, Ao100, computed the proper trimmed-mean way.
- **Progress charts** - rolling averages over time so you can see the trend, not just today's session.
- **Competition finder** - upcoming WCA competitions for your country, pulled from the WCA API and bookmarkable.
- **Accounts** - email/password sign-in, solves synced live across devices via Convex.

## Stack

React 19 + TypeScript + Vite on the front, [Convex](https://convex.dev) for the database, auth, and live queries. No separate API server. Tailwind for styling, Chart.js for the graphs.

## Running it

```bash
npm install
npm run dev    # vite dev server + convex dev
```

You'll need a Convex deployment. `npx convex dev --configure` sets one up and writes `CONVEX_DEPLOYMENT` to `.env.local`; copy the matching cloud URL into `apps/web/.env` as `VITE_CONVEX_URL`.

See [CLAUDE.md](./CLAUDE.md) for the fuller layout and commands.
