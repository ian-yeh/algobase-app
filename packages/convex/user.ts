import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { verifyToken } from "./auth";

export const updateUser = mutation({
  args: {
    token: v.string(),
    username: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), decoded.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      username: args.username,
      imageUrl: args.imageUrl,
      lastActivityDate: Date.now(),
    });

    return user;
  },
});

export const setCountry = mutation({
  args: {
    token: v.string(),
    country: v.string(),
  },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), decoded.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { country: args.country });
    return { country: args.country };
  },
});

export const getMe = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), decoded.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    return {
      userId: user.userId,
      username: user.username,
      email: user.email,
      country: user.country ?? null,
      bookmarkedCompetitions: user.bookmarkedCompetitions ?? [],
      cubeshapeCases: user.cubeshapeCases ?? null,
      cubeshapeMiddle: user.cubeshapeMiddle ?? "random",
      whatsNewSeen: user.whatsNewSeen ?? null,
    };
  },
});

export const setCubeshapeSettings = mutation({
  args: {
    token: v.string(),
    cases: v.optional(v.array(v.string())),
    middle: v.optional(v.union(v.literal("random"), v.literal("solved"), v.literal("flipped"))),
  },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", decoded.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      ...(args.cases !== undefined && { cubeshapeCases: args.cases }),
      ...(args.middle !== undefined && { cubeshapeMiddle: args.middle }),
    });
    return null;
  },
});

export const setWhatsNewSeen = mutation({
  args: {
    token: v.string(),
    version: v.string(),
  },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", decoded.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { whatsNewSeen: args.version });
    return null;
  },
});

export const getUser = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), decoded.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Update lastActivityDate
    await ctx.db.patch(user._id, {
      lastActivityDate: Date.now(),
    });

    return user;
  },
});
