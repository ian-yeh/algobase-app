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
});
