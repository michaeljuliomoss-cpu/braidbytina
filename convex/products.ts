import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getProducts = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("products").collect();
    },
});

export const addProduct = mutation({
    args: {
        name: v.string(),
        price: v.number(),
        description: v.string(),
        imageUrl: v.optional(v.string()),
        imageId: v.optional(v.id("_storage")),
        inStock: v.boolean(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("products", args);
    },
});

export const updateProduct = mutation({
    args: {
        id: v.id("products"),
        name: v.string(),
        price: v.number(),
        description: v.string(),
        imageUrl: v.optional(v.string()),
        imageId: v.optional(v.id("_storage")),
        inStock: v.boolean(),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

export const deleteProduct = mutation({
    args: { id: v.id("products") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
