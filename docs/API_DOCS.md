# Algobase Convex API Reference

Algobase's backend is a set of Convex functions in `/convex`. There is no HTTP API — the React client talks to Convex over a WebSocket, and functions are invoked by reference (e.g., `api.solve.createSolve`) rather than by URL.

This doc describes every public function: its module, kind (query vs. mutation), arguments, return value, and authorization.

## Calling functions from the client

```ts
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';

// Query — re-runs whenever underlying data changes.
const solves = useQuery(api.solve.getSolves, token ? { token } : 'skip');

// Mutation — call as an async function.
const createSolve = useMutation(api.solve.createSolve);
await createSolve({ token, cubeType: '3x3', time: 12.34, scramble: '…', dnf: false });
```

Pass `'skip'` as the second arg to `useQuery` to defer execution (e.g., until a token is available).

## Authentication

Every non-auth function takes a `token: string` argument. The function calls `verifyToken(token)` from `convex/auth.ts`; if it returns `null` the function throws `"Invalid token"`.

Tokens are issued by `auth.signUp` / `auth.signIn`. They are HMAC-SHA256-signed strings of the form `v1|userId|email|timestamp|nonce|signature` and expire 7 days after issue. The client stores them in `localStorage` via the Zustand auth store (`web/src/stores/authStore.ts`) and passes them with every call.

---

## `auth` module

### `auth.signUp` — mutation

Create a new account.

**Args:**
- `email: string`
- `password: string`
- `username: string`

**Returns:**
```ts
{
  token: string;
  user: { userId: string; username: string; email: string };
}
```

**Throws:** `"User already exists"` if `email` is already registered.

**Notes:** `userId` is currently set to `email`. Password is hashed with PBKDF2 (100k iterations, SHA-256) using a static salt — see `convex/auth.ts`.

---

### `auth.signIn` — mutation

Authenticate with email + password.

**Args:**
- `email: string`
- `password: string`

**Returns:** same shape as `signUp`.

**Throws:** `"Invalid email or password"` for unknown email *or* bad password (does not leak which).

**Side effect:** updates the user's `lastActivityDate` to now.

---

## `user` module

### `user.getUser` — mutation

Fetch the current user record. Defined as a mutation (not a query) because it bumps `lastActivityDate`.

**Args:**
- `token: string`

**Returns:** the full `users` document (`_id`, `_creationTime`, `userId`, `username`, `email`, `emailVerified`, `imageUrl?`, `lastActivityDate`).

**Throws:** `"Invalid token"`, `"User not found"`.

---

### `user.updateUser` — mutation

Update the current user's `username` and optionally `imageUrl`.

**Args:**
- `token: string`
- `username: string`
- `imageUrl?: string`

**Returns:** the pre-update `users` document.

**Throws:** `"Invalid token"`, `"User not found"`.

---

## `solve` module

### `solve.getSolves` — query

Return all solves for the authenticated user, unordered.

**Args:**
- `token: string`

**Returns:** array of `solves` documents:
```ts
{
  _id: Id<'solves'>;
  _creationTime: number;   // ms since epoch — use this for timestamps
  userId: string;
  cubeType: string;
  time: number;            // seconds
  scramble: string;
  dnf: boolean;
}[]
```

**Throws:** `"Invalid token"`.

**Live updates:** because this is a query, the client subscription auto-refreshes whenever `createSolve` or `deleteSolve` runs.

---

### `solve.createSolve` — mutation

Record a new solve for the authenticated user.

**Args:**
- `token: string`
- `cubeType: string` — e.g., `"3x3"`. Not currently validated against an enum.
- `time: number` — seconds, e.g., `12.34`
- `scramble: string`
- `dnf: boolean`

**Returns:** `Id<'solves'>` (the new document's id).

**Throws:** `"Invalid token"`.

---

### `solve.deleteSolve` — mutation

Delete one of the authenticated user's solves.

**Args:**
- `token: string`
- `solveId: Id<'solves'>` — import `Id` from `@convex/_generated/dataModel`

**Returns:** `{ status: 'success' }`.

**Throws:** `"Invalid token"`, `"Solve not found or access denied"` (covers both nonexistent rows and rows owned by another user).

---

### `solve.getStats` — query

Aggregate performance stats over all of the user's solves.

**Args:**
- `token: string`

**Returns:**
```ts
{
  best_ao5:   number;  // best rolling avg of 5 (seconds), 0 if fewer than 5 solves
  best_ao12:  number;  // best rolling avg of 12
  best_ao100: number;  // best rolling avg of 100
  best_time:  number;  // single best, 0 if no solves
  total_solves: number;
}
```

**Throws:** `"Invalid token"`.

**Note:** DNF solves are not currently excluded from averages — they're treated as regular times.

---

## Schema reference

Defined in `convex/schema.ts`:

| Table | Fields | Indexes |
|---|---|---|
| `users` | `userId`, `username`, `email`, `emailVerified`, `imageUrl?`, `lastActivityDate` | `by_userId`, `by_email` |
| `passwords` | `userId`, `hashedPassword` | `by_userId` |
| `solves` | `userId`, `cubeType`, `time`, `scramble`, `dnf` | `by_userId` |

All tables also carry the Convex-managed `_id` and `_creationTime` fields.

## Adding a new function

1. Add or extend a file in `/convex`. Export `query({...})` or `mutation({...})`.
2. For protected functions, take `token: v.string()` and call `await verifyToken(args.token)` first — throw if `null`.
3. Save. `npm run convex:dev` hot-reloads the deployment and regenerates `_generated/api.d.ts`.
4. Call from the client via `useQuery(api.<module>.<fn>, args)` or `useMutation(api.<module>.<fn>)`.
