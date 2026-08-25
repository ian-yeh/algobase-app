import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    username: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    imageUrl: v.optional(v.string()),
    lastActivityDate: v.number(), // Unix timestamp
    country: v.optional(v.string()), // ISO 3166-1 alpha-2, e.g. "CA"
    bookmarkedCompetitions: v.optional(v.array(v.string())), // WCA competition IDs
    swapCspParity: v.optional(v.boolean()), // some people trace Square-1 CSP parity the opposite way - swap even/odd labels for them
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  passwords: defineTable({
    userId: v.string(),
    hashedPassword: v.string(),
  })
    .index("by_userId", ["userId"]),

  solves: defineTable({
    userId: v.string(),
    cubeType: v.string(), // "3x3", "2x2", etc.
    time: v.number(), // seconds, e.g., 45.32
    scramble: v.string(),
    dnf: v.boolean(),
  })
    .index("by_userId", ["userId"]),

  cspCaseProgress: defineTable({
    userId: v.string(),
    caseId: v.string(), // CspCase.id, e.g. "kite-kite"
    status: v.literal("learned"), // row presence = learned; absent = not learned
    updatedAt: v.number(), // ms since epoch
  })
    .index("by_user", ["userId"])
    .index("by_user_case", ["userId", "caseId"]),

  cspCaseCustomization: defineTable({
    userId: v.string(),
    caseId: v.string(), // CspCase.id, e.g. "kite-kite"
    evenAlg: v.optional(v.string()), // user's own algorithm text, overrides the stock one
    oddAlg: v.optional(v.string()),
    notes: v.optional(v.string()),
    swapped: v.optional(v.boolean()), // display evenAlg's block as "Odd" and oddAlg's block as "Even" for this case only
    updatedAt: v.number(), // ms since epoch
  })
    .index("by_user", ["userId"])
    .index("by_user_case", ["userId", "caseId"]),

  competitionCache: defineTable({
    country: v.string(), // ISO 3166-1 alpha-2
    fetchedAt: v.number(), // ms since epoch
    comps: v.array(v.any()),
  })
    .index("by_country", ["country"]),
});
