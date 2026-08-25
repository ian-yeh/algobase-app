import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { verifyToken } from "./auth";

// Returns the set of case IDs the user has marked learned.
export const getCspProgress = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const rows = await ctx.db
      .query("cspCaseProgress")
      .withIndex("by_user", (q) => q.eq("userId", decoded.userId))
      .collect();

    return Object.fromEntries(rows.map((r) => [r.caseId, true as const]));
  },
});

export const setCspCaseLearned = mutation({
  args: {
    token: v.string(),
    caseId: v.string(),
    learned: v.boolean(),
  },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const existing = await ctx.db
      .query("cspCaseProgress")
      .withIndex("by_user_case", (q) => q.eq("userId", decoded.userId).eq("caseId", args.caseId))
      .first();

    if (!args.learned) {
      if (existing) await ctx.db.delete(existing._id);
      return { learned: false };
    }

    if (existing) {
      await ctx.db.patch(existing._id, { updatedAt: Date.now() });
    } else {
      await ctx.db.insert("cspCaseProgress", {
        userId: decoded.userId,
        caseId: args.caseId,
        status: "learned",
        updatedAt: Date.now(),
      });
    }
    return { learned: true };
  },
});
