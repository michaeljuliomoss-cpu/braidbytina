import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createAppointment = mutation({
    args: {
        customerName: v.string(),
        customerEmail: v.string(),
        customerPhone: v.string(),
        serviceId: v.id("services"),
        serviceName: v.string(),
        date: v.string(),
        timeSlot: v.string(),
        totalPrice: v.number(),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("appointments", {
            ...args,
            status: "pending",
        });
    },
});

export const getAppointmentsByDate = query({
    args: { date: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("appointments")
            .withIndex("by_date", (q) => q.eq("date", args.date))
            .filter((q) => q.neq(q.field("status"), "cancelled"))
            .collect();
    },
});

export const getBlockedDates = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("blockedDates").collect();
    },
});

export const getAllAppointments = query({
    args: {},
    handler: async (ctx) => {
        const appointments = await ctx.db.query("appointments").collect();
        // Sort by date manually if index isn't enough or for multi-criteria
        return appointments.sort((a, b) => b.date.localeCompare(a.date));
    },
});

export const updateAppointmentStatus = mutation({
    args: { id: v.id("appointments"), status: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { status: args.status });
    },
});

export const blockDate = mutation({
    args: { date: v.string(), reason: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("blockedDates")
            .withIndex("by_date", (q) => q.eq("date", args.date))
            .first();
        if (existing) return existing._id;
        return await ctx.db.insert("blockedDates", args);
    },
});

export const unblockDate = mutation({
    args: { date: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("blockedDates")
            .withIndex("by_date", (q) => q.eq("date", args.date))
            .first();
        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});
