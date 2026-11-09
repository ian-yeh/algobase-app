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

### Local backend (isolated, no login)

Runs Convex on your machine instead of the shared cloud dev deployment, so each clone or worktree gets its own database. Use it only where there's no `.env.local` pointing at a cloud deployment - an existing `CONVEX_DEPLOYMENT` takes precedence.

```bash
CONVEX_AGENT_MODE=anonymous npx convex dev --once   # downloads the backend, pushes functions, writes .env.local
echo "VITE_CONVEX_URL=http://127.0.0.1:3210" > apps/web/.env   # use the URL it printed
CONVEX_AGENT_MODE=anonymous npm run dev
```

- Ports start at 3210 (backend) and 6790 (dashboard) and move to the next free ones if taken, so parallel worktrees don't collide. Each worktree keeps its ports and data in its own `.convex/` (gitignored).
- Auth signs tokens with `CONVEX_JWT_SECRET`; set any value with `npx convex env set CONVEX_JWT_SECRET local-dev` while the backend is running.

See [CLAUDE.md](./CLAUDE.md) for the fuller layout and commands.
