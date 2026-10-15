import { mutation, query, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { verifyToken } from "./auth";

// Alg text is validated client-side (the parsers live in the puzzle packages); the server only caps sizes.
const MAX_TEXT = 2000;
const MAX_BULK = 500;

function checkText(...values: (string | undefined)[]) {
  if (values.some((s) => s !== undefined && s.length > MAX_TEXT)) throw new Error("Text too long");
}

async function ownedList(ctx: QueryCtx, token: string, listId: Id<"algLists">) {
  const decoded = await verifyToken(token);
  if (!decoded) throw new Error("Invalid token");
  const list = await ctx.db.get(listId);
  if (!list || list.userId !== decoded.userId) throw new Error("List not found");
  return list;
}

async function ownedEntry(ctx: QueryCtx, token: string, entryId: Id<"algEntries">) {
  const entry = await ctx.db.get(entryId);
  if (!entry) throw new Error("Entry not found");
  await ownedList(ctx, token, entry.listId);
  return entry;
}

function listEntries(ctx: QueryCtx, listId: Id<"algLists">) {
  return ctx.db
    .query("algEntries")
    .withIndex("by_list_order", (q) => q.eq("listId", listId))
    .collect();
}

export const getLists = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) throw new Error("Invalid token");
    return await ctx.db
      .query("algLists")
      .withIndex("by_user", (q) => q.eq("userId", decoded.userId))
      .collect();
  },
});

export const getList = query({
  args: { token: v.string(), listId: v.id("algLists") },
  handler: async (ctx, args) => {
    const list = await ownedList(ctx, args.token, args.listId);
    return { list, entries: await listEntries(ctx, list._id) };
  },
});

// Public, no token: returns null unless the owner has sharing turned on.
export const getSharedList = query({
  args: { listId: v.string() },
  handler: async (ctx, args) => {
    const listId = ctx.db.normalizeId("algLists", args.listId);
    const list = listId && (await ctx.db.get(listId));
    if (!list || !list.isShared) return null;
    return { list: { ...list, userId: "" }, entries: await listEntries(ctx, list._id) };
  },
});

export const createList = mutation({
  args: { token: v.string(), name: v.string(), puzzle: v.union(v.literal("3x3"), v.literal("sq1")) },
  handler: async (ctx, args) => {
    const decoded = await verifyToken(args.token);
    if (!decoded) throw new Error("Invalid token");
    checkText(args.name);
    return await ctx.db.insert("algLists", {
      userId: decoded.userId,
      name: args.name.trim() || "Untitled list",
      puzzle: args.puzzle,
      topColor: "yellow",
      isShared: false,
    });
  },
});

export const updateList = mutation({
  args: {
    token: v.string(),
    listId: v.id("algLists"),
    name: v.optional(v.string()),
    topColor: v.optional(v.union(v.literal("white"), v.literal("yellow"))),
    isShared: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await ownedList(ctx, args.token, args.listId);
    checkText(args.name);
    const { token: _token, listId, ...patch } = args;
    if (patch.name !== undefined) patch.name = patch.name.trim() || "Untitled list";
    await ctx.db.patch(listId, patch);
  },
});

export const deleteList = mutation({
  args: { token: v.string(), listId: v.id("algLists") },
  handler: async (ctx, args) => {
    await ownedList(ctx, args.token, args.listId);
    for (const entry of await listEntries(ctx, args.listId)) await ctx.db.delete(entry._id);
    await ctx.db.delete(args.listId);
  },
});

// Appends in the given order - used by both the single-add form and bulk paste.
export const addEntries = mutation({
  args: {
    token: v.string(),
    listId: v.id("algLists"),
    entries: v.array(v.object({ name: v.string(), alg: v.string(), notes: v.string() })),
  },
  handler: async (ctx, args) => {
    await ownedList(ctx, args.token, args.listId);
    if (args.entries.length > MAX_BULK) throw new Error(`At most ${MAX_BULK} entries at once`);
    const last = await ctx.db
      .query("algEntries")
      .withIndex("by_list_order", (q) => q.eq("listId", args.listId))
      .order("desc")
      .first();
    let order = last?.order ?? 0;
    for (const entry of args.entries) {
      checkText(entry.name, entry.alg, entry.notes);
      order += 1;
      await ctx.db.insert("algEntries", {
        listId: args.listId,
        name: entry.name.trim(),
        alg: entry.alg.trim(),
        notes: entry.notes,
        order,
      });
    }
  },
});

// Bulk edit: the list becomes exactly `entries`, in order. Existing rows are reused (keeping their notes)
// by matching alg first, then non-empty name; rows nothing matched are deleted.
export const replaceEntries = mutation({
  args: {
    token: v.string(),
    listId: v.id("algLists"),
    entries: v.array(v.object({ name: v.string(), alg: v.string() })),
  },
  handler: async (ctx, args) => {
    await ownedList(ctx, args.token, args.listId);
    if (args.entries.length > MAX_BULK) throw new Error(`At most ${MAX_BULK} entries at once`);
    const lines = args.entries.map((e) => ({ name: e.name.trim(), alg: e.alg.trim() }));
    lines.forEach((l) => checkText(l.name, l.alg));

    const unused = await listEntries(ctx, args.listId);
    const take = (match: (e: (typeof unused)[number]) => boolean) => {
      const i = unused.findIndex(match);
      return i === -1 ? undefined : unused.splice(i, 1)[0];
    };
    const byAlg = lines.map((l) => take((e) => e.alg === l.alg));
    const matched = byAlg.map((m, i) => m ?? (lines[i].name ? take((e) => e.name === lines[i].name) : undefined));

    for (const [i, line] of lines.entries()) {
      const existing = matched[i];
      if (existing) await ctx.db.patch(existing._id, { ...line, order: i + 1 });
      else await ctx.db.insert("algEntries", { listId: args.listId, ...line, notes: "", order: i + 1 });
    }
    for (const entry of unused) await ctx.db.delete(entry._id);
  },
});

export const updateEntry = mutation({
  args: {
    token: v.string(),
    entryId: v.id("algEntries"),
    name: v.string(),
    alg: v.string(),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    await ownedEntry(ctx, args.token, args.entryId);
    checkText(args.name, args.alg, args.notes);
    await ctx.db.patch(args.entryId, { name: args.name.trim(), alg: args.alg.trim(), notes: args.notes });
  },
});

// Omitting `status` clears it.
export const setEntryStatus = mutation({
  args: {
    token: v.string(),
    entryId: v.id("algEntries"),
    status: v.optional(v.union(v.literal("learning"), v.literal("learned"))),
  },
  handler: async (ctx, args) => {
    await ownedEntry(ctx, args.token, args.entryId);
    await ctx.db.patch(args.entryId, { status: args.status });
  },
});

// The client picks `order` as the midpoint between the new neighbours.
export const moveEntry = mutation({
  args: { token: v.string(), entryId: v.id("algEntries"), order: v.number() },
  handler: async (ctx, args) => {
    await ownedEntry(ctx, args.token, args.entryId);
    await ctx.db.patch(args.entryId, { order: args.order });
  },
});

export const deleteEntry = mutation({
  args: { token: v.string(), entryId: v.id("algEntries") },
  handler: async (ctx, args) => {
    await ownedEntry(ctx, args.token, args.entryId);
    await ctx.db.delete(args.entryId);
  },
});
