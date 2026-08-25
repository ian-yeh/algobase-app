import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { verifyToken } from "./auth";

export const getCspCustomizations = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const rows = await ctx.db
      .query("cspCaseCustomization")
      .withIndex("by_user", (q) => q.eq("userId", decoded.userId))
      .collect();

    return Object.fromEntries(
      rows.map((r) => [r.caseId, { evenAlg: r.evenAlg, oddAlg: r.oddAlg, notes: r.notes, swapped: r.swapped }])
    );
  },
});

// Pass an empty string to clear a field back to the stock algorithm / no notes.
export const setCspCustomization = mutation({
  args: {
    token: v.string(),
    caseId: v.string(),
    field: v.union(v.literal("evenAlg"), v.literal("oddAlg"), v.literal("notes")),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const existing = await ctx.db
      .query("cspCaseCustomization")
      .withIndex("by_user_case", (q) => q.eq("userId", decoded.userId).eq("caseId", args.caseId))
      .first();

    const value = args.value.trim() === "" ? undefined : args.value;

    if (existing) {
      await ctx.db.patch(existing._id, { [args.field]: value, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("cspCaseCustomization", {
        userId: decoded.userId,
        caseId: args.caseId,
        [args.field]: value,
        updatedAt: Date.now(),
      });
    }
    return { [args.field]: value };
  },
});

// Swaps which algorithm block is labeled "Even" vs "Odd" for one case, for this user only.
export const setCspSwapped = mutation({
  args: {
    token: v.string(),
    caseId: v.string(),
    swapped: v.boolean(),
  },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const existing = await ctx.db
      .query("cspCaseCustomization")
      .withIndex("by_user_case", (q) => q.eq("userId", decoded.userId).eq("caseId", args.caseId))
      .first();

    const swapped = args.swapped ? true : undefined;

    if (existing) {
      await ctx.db.patch(existing._id, { swapped, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("cspCaseCustomization", {
        userId: decoded.userId,
        caseId: args.caseId,
        swapped,
        updatedAt: Date.now(),
      });
    }
    return { swapped: args.swapped };
  },
});
