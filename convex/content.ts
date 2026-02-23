import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAllContent = query({
    args: {},
    handler: async (ctx) => {
        const rawContent = await ctx.db.query("siteContent").collect();
        const contentMap = rawContent.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        // Resolve image URLs
        const logoUrl = contentMap.logoStorageId
            ? await ctx.storage.getUrl(contentMap.logoStorageId as any)
            : contentMap.logoUrl;

        const aboutImageUrl = contentMap.aboutImageStorageId
            ? await ctx.storage.getUrl(contentMap.aboutImageStorageId as any)
            : contentMap.aboutImageUrl;

        return {
            ...contentMap,
            logoUrl: logoUrl || "",
            aboutImageUrl: aboutImageUrl || "",
        };
    },
});

export const updateContent = mutation({
    args: { key: v.string(), value: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("siteContent")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, { value: args.value });
        } else {
            await ctx.db.insert("siteContent", { key: args.key, value: args.value });
        }
    },
});

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const getImageUrl = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});
