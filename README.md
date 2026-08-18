# Algobase

A speedcubing timer I built because every other one either looked dated or buried the stats I actually cared about. You hold space, you solve, and Algobase keeps track of the rest.

## Features

- Space-bar timer - hold to arm, release to start, tap to stop.
- WCA-style scrambles, new one after every solve.
- Solve history with scrambles, DNF marking, and per-solve detail.
- Best single, Ao5, Ao12, Ao100.
- Progress charts of rolling averages over time.
- Upcoming WCA competitions for your country.
- Accounts, with solves synced live across devices.

## Stack

React 19 + TypeScript + Vite on the front, [Convex](https://convex.dev) for the database, auth, and live queries. No separate API server. Tailwind for styling, Chart.js for the graphs.

## Running it

```bash
npm install
npm run dev    # vite dev server + convex dev
```

You'll need a Convex deployment. `npx convex dev --configure` sets one up and writes `CONVEX_DEPLOYMENT` to `.env.local`; copy the matching cloud URL into `apps/web/.env` as `VITE_CONVEX_URL`.

See [CLAUDE.md](./CLAUDE.md) for the fuller layout and commands.
