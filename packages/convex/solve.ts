import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { verifyToken } from "./auth";

type Stats = {
  best_time: number;
  best_ao5: number;
  best_ao12: number;
  best_ao100: number;
  total_solves: number;
};

const EMPTY_STATS: Stats = { best_time: 0, best_ao5: 0, best_ao12: 0, best_ao100: 0, total_solves: 0 };
const AVERAGES = [[5, "best_ao5"], [12, "best_ao12"], [100, "best_ao100"]] as const;

// csTimer-style trimmed mean: drop ceil(5%) from each end. DNFs are Infinity, so a surviving DNF makes the average DNF.
const trimmedMean = (times: number[]) => {
  const trim = Math.ceil(times.length * 0.05);
  const kept = [...times].sort((a, b) => a - b).slice(trim, -trim);
  return kept.reduce((a, b) => a + b, 0) / kept.length;
};

const better = (best: number, t: number) => (t !== Infinity && (best === 0 || t < best) ? t : best);

// Folds `added` (chronological) into `stats`. `prior` is the up-to-99 solves right before them, so windows can span both.
const foldStats = (stats: Stats, prior: number[], added: number[]): Stats => {
  const seq = [...prior, ...added];
  const next: Stats = {
    best_time: added.reduce(better, stats.best_time),
    best_ao5: stats.best_ao5,
    best_ao12: stats.best_ao12,
    best_ao100: stats.best_ao100,
    total_solves: stats.total_solves + added.length,
  };
  for (const [n, key] of AVERAGES) {
    for (let end = Math.max(prior.length, n - 1); end < seq.length; end++) {
      next[key] = better(next[key], parseFloat(trimmedMean(seq.slice(end - n + 1, end + 1)).toFixed(2)));
    }
  }
  return next;
};

// WCA-style: times are cut down to the hundredth, never rounded up. The epsilon absorbs float error (1.15 * 100 = 114.99999999999999).
const toCentis = (t: number) => Math.floor(t * 100 + 1e-9) / 100;

const effectiveTime = (s: { time: number; dnf: boolean; plus2?: boolean }) =>
  s.dnf ? Infinity : s.time + (s.plus2 ? 2 : 0);

const solvesByUser = (ctx: QueryCtx, userId: string) =>
  ctx.db.query("solves").withIndex("by_userId", (q) => q.eq("userId", userId));

const recentTimes = async (ctx: QueryCtx, userId: string) =>
  (await solvesByUser(ctx, userId).order("desc").take(99)).map(effectiveTime).reverse();

const statsRow = (ctx: QueryCtx, userId: string) =>
  ctx.db.query("userStats").withIndex("by_userId", (q) => q.eq("userId", userId)).unique();

// ponytail: full scan of the user's solves (~1MB at 4k). Only runs on delete, penalty changes and first-time backfill.
const computeAllStats = async (ctx: QueryCtx, userId: string) =>
  foldStats(EMPTY_STATS, [], (await solvesByUser(ctx, userId).collect()).map(effectiveTime));

const recomputeStats = async (ctx: MutationCtx, userId: string) => {
  const stats = await computeAllStats(ctx, userId);
  const row = await statsRow(ctx, userId);
  if (row) await ctx.db.patch(row._id, stats);
  else await ctx.db.insert("userStats", { userId, ...stats });
};

const addToStats = async (ctx: MutationCtx, userId: string, prior: number[], added: number[]) => {
  const row = await statsRow(ctx, userId);
  if (!row) return recomputeStats(ctx, userId);
  await ctx.db.patch(row._id, foldStats(row, prior, added));
};

const DAY_MS = 86_400_000;
const dayOf = (t: number) => Math.floor(t / DAY_MS) * DAY_MS;
const MAX_BUCKETS = 3650;
const MAX_WINDOW_SOLVES = 5000;

type Bucket = { day: number; count: number; dnfs: number; sum: number; best: number };

const foldBucket = (b: Bucket, times: number[]): Bucket =>
  times.reduce(
    (acc, t) =>
      t === Infinity
        ? { ...acc, dnfs: acc.dnfs + 1 }
        : { ...acc, count: acc.count + 1, sum: acc.sum + t, best: better(acc.best, t) },
    b,
  );

const emptyBucket = (day: number): Bucket => ({ day, count: 0, dnfs: 0, sum: 0, best: 0 });

const groupBuckets = (solves: { _creationTime: number; time: number; dnf: boolean; plus2?: boolean }[]): Bucket[] => {
  const byDay = new Map<number, Bucket>();
  for (const s of solves) {
    const day = dayOf(s._creationTime);
    byDay.set(day, foldBucket(byDay.get(day) ?? emptyBucket(day), [effectiveTime(s)]));
  }
  return [...byDay.values()].sort((a, b) => a.day - b.day);
};

const bucketRow = (ctx: QueryCtx, userId: string, day: number) =>
  ctx.db.query("solveBuckets").withIndex("by_user_day", (q) => q.eq("userId", userId).eq("day", day)).unique();

const hasBuckets = async (ctx: QueryCtx, userId: string) =>
  (await ctx.db.query("solveBuckets").withIndex("by_user_day", (q) => q.eq("userId", userId)).first()) !== null;

const upsertBucket = async (ctx: MutationCtx, userId: string, b: Bucket) => {
  const row = await bucketRow(ctx, userId, b.day);
  if (b.count + b.dnfs === 0) {
    if (row) await ctx.db.delete(row._id);
  } else if (row) await ctx.db.patch(row._id, b);
  else await ctx.db.insert("solveBuckets", { userId, ...b });
};

// Full rebuild from the solves table. Used for users who predate buckets, so it has to read everything once.
const rebuildBuckets = async (ctx: MutationCtx, userId: string) => {
  for (const row of await ctx.db.query("solveBuckets").withIndex("by_user_day", (q) => q.eq("userId", userId)).collect()) {
    await ctx.db.delete(row._id);
  }
  for (const b of groupBuckets(await solvesByUser(ctx, userId).collect())) await upsertBucket(ctx, userId, b);
};

// Recomputes one day from its solves. Skipped for users without buckets, whose chart is computed on read.
const rebuildDay = async (ctx: MutationCtx, userId: string, day: number) => {
  if (!(await hasBuckets(ctx, userId))) return;
  const solves = await ctx.db
    .query("solves")
    .withIndex("by_userId", (q) => q.eq("userId", userId).gte("_creationTime", day).lt("_creationTime", day + DAY_MS))
    .collect();
  await upsertBucket(ctx, userId, foldBucket(emptyBucket(day), solves.map(effectiveTime)));
};

// Call after the new solves are inserted, so the legacy rebuild path sees them.
const addToBuckets = async (ctx: MutationCtx, userId: string, times: number[]) => {
  const day = dayOf(Date.now());
  if (!(await hasBuckets(ctx, userId))) return rebuildBuckets(ctx, userId);
  const row = await bucketRow(ctx, userId, day);
  await upsertBucket(ctx, userId, foldBucket(row ?? emptyBucket(day), times));
};

const toPoint = (b: Bucket) => ({
  day: b.day,
  count: b.count,
  dnfs: b.dnfs,
  mean: b.count ? b.sum / b.count : null,
  best: b.best || null,
});

// Daily aggregates for the "all time" chart, oldest first.
export const getSolveBuckets = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const rows = await ctx.db
      .query("solveBuckets")
      .withIndex("by_user_day", (q) => q.eq("userId", decoded.userId))
      .order("desc")
      .take(MAX_BUCKETS);
    if (rows.length) return rows.reverse().map(toPoint);
    return groupBuckets(await solvesByUser(ctx, decoded.userId).collect()).slice(-MAX_BUCKETS).map(toPoint);
  },
});

// Raw solves from `since` on, oldest first, for the short-range chart views.
export const getSolvesSince = query({
  args: { token: v.string(), since: v.number() },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const rows = await ctx.db
      .query("solves")
      .withIndex("by_userId", (q) => q.eq("userId", decoded.userId).gte("_creationTime", args.since))
      .order("desc")
      .take(MAX_WINDOW_SOLVES);
    return rows.reverse();
  },
});

// Newest first, capped, for the dashboard's recent list.
export const getRecentSolves = query({
  args: { token: v.string(), limit: v.number() },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    return await solvesByUser(ctx, decoded.userId).order("desc").take(Math.min(Math.max(args.limit, 1), 100));
  },
});

// Newest first, for the timer's history list.
export const listSolves = query({
  args: {
    token: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    return await solvesByUser(ctx, decoded.userId).order("desc").paginate(args.paginationOpts);
  },
});

export const createSolve = mutation({
  args: {
    token: v.string(),
    cubeType: v.string(),
    time: v.number(),
    scramble: v.string(),
    dnf: v.boolean(),
  },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const time = toCentis(args.time);
    const prior = await recentTimes(ctx, decoded.userId);
    const id = await ctx.db.insert("solves", {
      userId: decoded.userId,
      cubeType: args.cubeType,
      time,
      scramble: args.scramble,
      dnf: args.dnf,
    });
    await addToStats(ctx, decoded.userId, prior, [effectiveTime({ ...args, time })]);
    await addToBuckets(ctx, decoded.userId, [effectiveTime({ ...args, time })]);
    return id;
  },
});

export const deleteSolve = mutation({
  args: {
    token: v.string(),
    solveId: v.id("solves"),
  },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const solve = await ctx.db.get(args.solveId);
    if (!solve || solve.userId !== decoded.userId) {
      throw new Error("Solve not found or access denied");
    }

    await ctx.db.delete(args.solveId);
    await recomputeStats(ctx, decoded.userId);
    await rebuildDay(ctx, decoded.userId, dayOf(solve._creationTime));
    return { status: "success" };
  },
});

export const setPenalty = mutation({
  args: {
    token: v.string(),
    solveId: v.id("solves"),
    penalty: v.union(v.literal("none"), v.literal("plus2"), v.literal("dnf")),
  },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const solve = await ctx.db.get(args.solveId);
    if (!solve || solve.userId !== decoded.userId) {
      throw new Error("Solve not found or access denied");
    }

    await ctx.db.patch(args.solveId, { dnf: args.penalty === "dnf", plus2: args.penalty === "plus2" });
    await recomputeStats(ctx, decoded.userId);
    await rebuildDay(ctx, decoded.userId, dayOf(solve._creationTime));
    return { status: "success" };
  },
});

export const getStats = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const row = await statsRow(ctx, decoded.userId);
    if (!row) return await computeAllStats(ctx, decoded.userId);
    const { best_time, best_ao5, best_ao12, best_ao100, total_solves } = row;
    return { best_time, best_ao5, best_ao12, best_ao100, total_solves };
  },
});

export const importSolves = mutation({
  args: {
    token: v.string(),
    solves: v.array(
      v.object({
        cubeType: v.string(),
        time: v.number(),
        scramble: v.string(),
        dnf: v.boolean(),
        plus2: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const solves = args.solves.map((s) => ({ ...s, time: toCentis(s.time) }));
    const prior = await recentTimes(ctx, decoded.userId);
    for (const solve of solves) {
      await ctx.db.insert("solves", { ...solve, userId: decoded.userId });
    }
    await addToStats(ctx, decoded.userId, prior, solves.map(effectiveTime));
    await addToBuckets(ctx, decoded.userId, solves.map(effectiveTime));
    return { imported: solves.length };
  },
});
