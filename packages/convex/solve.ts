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

const effectiveTime = (s: { time: number; dnf: boolean }) => (s.dnf ? Infinity : s.time);

const solvesByUser = (ctx: QueryCtx, userId: string) =>
  ctx.db.query("solves").withIndex("by_userId", (q) => q.eq("userId", userId));

const recentTimes = async (ctx: QueryCtx, userId: string) =>
  (await solvesByUser(ctx, userId).order("desc").take(99)).map(effectiveTime).reverse();

const statsRow = (ctx: QueryCtx, userId: string) =>
  ctx.db.query("userStats").withIndex("by_userId", (q) => q.eq("userId", userId)).unique();

// ponytail: full scan of the user's solves (~1MB at 4k). Only runs on delete and first-time backfill.
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

export const getSolves = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    return await solvesByUser(ctx, decoded.userId).collect();
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

    const prior = await recentTimes(ctx, decoded.userId);
    const id = await ctx.db.insert("solves", {
      userId: decoded.userId,
      cubeType: args.cubeType,
      time: args.time,
      scramble: args.scramble,
      dnf: args.dnf,
    });
    await addToStats(ctx, decoded.userId, prior, [effectiveTime(args)]);
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
      })
    ),
  },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const prior = await recentTimes(ctx, decoded.userId);
    for (const solve of args.solves) {
      await ctx.db.insert("solves", { ...solve, userId: decoded.userId });
    }
    await addToStats(ctx, decoded.userId, prior, args.solves.map(effectiveTime));
    return { imported: args.solves.length };
  },
});
