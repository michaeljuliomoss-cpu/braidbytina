import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_SLOTS = ["09:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM"];

export const getAvailability = query({
    args: { date: v.string() },
    handler: async (ctx, args) => {
        const custom = await ctx.db
            .query("availability")
            .withIndex("by_date", (q) => q.eq("date", args.date))
            .first();

        if (custom) return custom.slots;

        const defaults = await ctx.db.query("defaultSlots").first();
        return defaults?.slots || DEFAULT_SLOTS;
    },
});

export const updateAvailability = mutation({
    args: { date: v.string(), slots: v.array(v.string()) },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("availability")
            .withIndex("by_date", (q) => q.eq("date", args.date))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, { slots: args.slots });
        } else {
            await ctx.db.insert("availability", {
                date: args.date,
                slots: args.slots,
            });
        }
    },
});

export const getDefaultSlots = query({
    args: {},
    handler: async (ctx) => {
        const defaults = await ctx.db.query("defaultSlots").first();
        return defaults?.slots || DEFAULT_SLOTS;
    },
});

export const updateDefaultSlots = mutation({
    args: { slots: v.array(v.string()) },
    handler: async (ctx, args) => {
        const existing = await ctx.db.query("defaultSlots").first();
        if (existing) {
            await ctx.db.patch(existing._id, { slots: args.slots });
        } else {
            await ctx.db.insert("defaultSlots", { slots: args.slots });
        }
    },
});
