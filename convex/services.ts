import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getServices = query({
    args: {},
    handler: async (ctx) => {
        const services = await ctx.db.query("services").collect();

        // Resolve storage URLs for services that have uploaded images
        return await Promise.all(
            services.map(async (service) => {
                let storageUrl = null;
                if (service.imageId) {
                    storageUrl = await ctx.storage.getUrl(service.imageId);
                }
                return {
                    ...service,
                    resolvedImageUrl: storageUrl || service.imageUrl || "/logo.png"
                };
            })
        );
    },
});

export const addService = mutation({
    args: {
        name: v.string(),
        price: v.number(),
        duration: v.string(),
        description: v.string(),
        imageId: v.optional(v.id("_storage")),
        imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("services", args);
    },
});

export const updateService = mutation({
    args: {
        id: v.id("services"),
        name: v.optional(v.string()),
        price: v.optional(v.number()),
        duration: v.optional(v.string()),
        description: v.optional(v.string()),
        imageId: v.optional(v.id("_storage")),
        imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

export const deleteService = mutation({
    args: { id: v.id("services") },
    handler: async (ctx, args) => {
        const service = await ctx.db.get(args.id);
        if (!service) throw new Error("Service not found");

        // Cleanup orphaned image in storage if it exists
        if (service.imageId) {
            await ctx.storage.delete(service.imageId);
        }

        await ctx.db.delete(args.id);
    },
});

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});
