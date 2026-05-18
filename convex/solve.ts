import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { verifyToken } from "./auth";

export const getSolves = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    return await ctx.db
      .query("solves")
      .filter((q) => q.eq(q.field("userId"), decoded.userId))
      .collect();
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

    return await ctx.db.insert("solves", {
      userId: decoded.userId,
      cubeType: args.cubeType,
      time: args.time,
      scramble: args.scramble,
      dnf: args.dnf,
    });
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

    const solves = await ctx.db
      .query("solves")
      .filter((q) => q.eq(q.field("userId"), decoded.userId))
      .collect();

    const times = solves.map((s) => s.time).filter((t) => !isNaN(t));

    const calculateAO = (arr: number[], n: number) => {
      if (arr.length < n) return 0;
      let best = Infinity;
      for (let i = 0; i <= arr.length - n; i++) {
        const avg =
          arr.slice(i, i + n).reduce((a, b) => a + b, 0) / n;
        if (avg < best) best = avg;
      }
      return best === Infinity ? 0 : parseFloat(best.toFixed(2));
    };

    return {
      best_ao5: calculateAO(times, 5),
      best_ao12: calculateAO(times, 12),
      best_ao100: calculateAO(times, 100),
      best_time: times.length > 0 ? Math.min(...times) : 0,
      total_solves: solves.length,
    };
  },
});
