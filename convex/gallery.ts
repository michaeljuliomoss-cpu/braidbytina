import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getGallery = query({
    args: {},
    handler: async (ctx) => {
        const images = await ctx.db.query("gallery").collect();
        return await Promise.all(
            images.map(async (image) => ({
                ...image,
                url: image.imageId ? await ctx.storage.getUrl(image.imageId) : image.imageUrl,
            }))
        );
    },
});

export const addImage = mutation({
    args: {
        imageId: v.optional(v.id("_storage")),
        imageUrl: v.optional(v.string()),
        caption: v.optional(v.string()),
        order: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("gallery", args);
    },
});

export const deleteImage = mutation({
    args: { id: v.id("gallery") },
    handler: async (ctx, args) => {
        const image = await ctx.db.get(args.id);
        if (!image) return;
        await ctx.db.delete(args.id);
        // Note: We don't delete the storage item here to be safe, 
        // but in a real prod app you might want to.
    },
});
