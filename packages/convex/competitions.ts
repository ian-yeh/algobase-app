import { action, mutation, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { verifyToken } from "./auth";

const WCA_BASE = "https://www.worldcubeassociation.org/api/v0";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export interface WcaCompetition {
    id: string;
    name: string;
    short_name?: string;
    city?: string;
    country_iso2?: string;
    start_date?: string;
    end_date?: string;
    registration_open?: string | null;
    registration_close?: string | null;
    website?: string | null;
    venue?: string | null;
    event_ids?: string[];
}

const pickFields = (c: any): WcaCompetition => ({
    id: c.id,
    name: c.name,
    short_name: c.short_name,
    city: c.city,
    country_iso2: c.country_iso2,
    start_date: c.start_date,
    end_date: c.end_date,
    registration_open: c.registration_open,
    registration_close: c.registration_close,
    website: c.website,
    venue: c.venue,
    event_ids: c.event_ids,
});

export const getCachedByCountry = internalQuery({
    args: { country: v.string() },
    handler: async (ctx, args): Promise<WcaCompetition[] | null> => {
        const cached = await ctx.db
            .query("competitionCache")
            .withIndex("by_country", (q) => q.eq("country", args.country))
            .first();
        if (!cached) return null;
        if (Date.now() - cached.fetchedAt > CACHE_TTL_MS) return null;
        return cached.comps as WcaCompetition[];
    },
});

export const writeCacheByCountry = internalMutation({
    args: { country: v.string(), comps: v.array(v.any()) },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("competitionCache")
            .withIndex("by_country", (q) => q.eq("country", args.country))
            .first();
        if (existing) {
            await ctx.db.patch(existing._id, { fetchedAt: Date.now(), comps: args.comps });
        } else {
            await ctx.db.insert("competitionCache", {
                country: args.country,
                fetchedAt: Date.now(),
                comps: args.comps,
            });
        }
    },
});

export const listByCountry = action({
    args: {
        country: v.string(),
    },
    handler: async (ctx, args): Promise<WcaCompetition[]> => {
        const cached = await ctx.runQuery(internal.competitions.getCachedByCountry, {
            country: args.country,
        });
        if (cached) return cached;

        const today = new Date().toISOString().slice(0, 10);
        const url = `${WCA_BASE}/competitions?country_iso2=${encodeURIComponent(args.country)}&start=${today}&sort=start_date&per_page=50`;
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) {
            throw new Error(`WCA API error: ${res.status}`);
        }
        const data = await res.json();
        const comps = Array.isArray(data) ? data.map(pickFields) : [];

        await ctx.runMutation(internal.competitions.writeCacheByCountry, {
            country: args.country,
            comps,
        });

        return comps;
    },
});

export const listBookmarks = action({
    args: {
        ids: v.array(v.string()),
    },
    handler: async (_ctx, args): Promise<WcaCompetition[]> => {
        if (args.ids.length === 0) return [];
        const results = await Promise.all(
            args.ids.map(async (id) => {
                try {
                    const res = await fetch(`${WCA_BASE}/competitions/${encodeURIComponent(id)}`, {
                        headers: { Accept: "application/json" },
                    });
                    if (!res.ok) return null;
                    const data = await res.json();
                    return pickFields(data);
                } catch {
                    return null;
                }
            })
        );
        return results.filter((c): c is WcaCompetition => c !== null);
    },
});

export const addBookmark = mutation({
    args: {
        token: v.string(),
        competitionId: v.string(),
    },
    handler: async (ctx, args) => {
        const decoded = await verifyToken(args.token);
        if (!decoded) throw new Error("Invalid token");

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("userId"), decoded.userId))
            .first();
        if (!user) throw new Error("User not found");

        const current = user.bookmarkedCompetitions ?? [];
        if (current.includes(args.competitionId)) {
            return { bookmarkedCompetitions: current };
        }
        const next = [...current, args.competitionId];
        await ctx.db.patch(user._id, { bookmarkedCompetitions: next });
        return { bookmarkedCompetitions: next };
    },
});

export const removeBookmark = mutation({
    args: {
        token: v.string(),
        competitionId: v.string(),
    },
    handler: async (ctx, args) => {
        const decoded = await verifyToken(args.token);
        if (!decoded) throw new Error("Invalid token");

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("userId"), decoded.userId))
            .first();
        if (!user) throw new Error("User not found");

        const current = user.bookmarkedCompetitions ?? [];
        const next = current.filter((id) => id !== args.competitionId);
        await ctx.db.patch(user._id, { bookmarkedCompetitions: next });
        return { bookmarkedCompetitions: next };
    },
});
