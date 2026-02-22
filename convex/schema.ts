import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    services: defineTable({
        name: v.string(),        // e.g., "Knotless Braids"
        price: v.number(),       // e.g., 150
        duration: v.string(),    // e.g., "4-6 Hours"
        description: v.string(), // Description of the style
        imageId: v.optional(v.id("_storage")),
        imageUrl: v.optional(v.string()), // For local placeholders
    }),

    siteContent: defineTable({
        key: v.string(),         // 'hero-title', 'hero-subtitle', 'deposit-policy'
        value: v.string(),
    }).index("by_key", ["key"]),

    adminUsers: defineTable({
        username: v.string(),
        passwordHash: v.string(), // Bycrypt hash
    }).index("by_username", ["username"]),

    adminSessions: defineTable({
        userId: v.id("adminUsers"),
        token: v.string(),      // Secure session token
        expiresAt: v.number(),  // Timestamp
    }).index("by_token", ["token"]),

    gallery: defineTable({
        imageId: v.id("_storage"),
        caption: v.optional(v.string()),
        order: v.optional(v.number()),
    }),

    products: defineTable({
        name: v.string(),        // e.g., "Edge Control"
        price: v.number(),       // e.g., 15
        description: v.string(), // Product benefits
        imageId: v.optional(v.id("_storage")),
        imageUrl: v.optional(v.string()), // For local placeholders
        inStock: v.boolean(),
    }).index("by_name", ["name"]),
});
