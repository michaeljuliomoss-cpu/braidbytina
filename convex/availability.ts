import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Business hours: 9 AM to 6 PM
const OPEN_HOUR = 9;
const CLOSE_HOUR = 18;

function parseDurationToMinutes(durationStr: string): number {
    if (!durationStr) return 120;
    const lower = durationStr.toLowerCase();
    const value = parseFloat(lower);
    if (isNaN(value)) return 120;
    if (lower.includes("min")) return value;
    if (lower.includes("hour") || lower.includes("hr")) return value * 60;
    return 120;
}

function parseTimeToMinutes(timeStr: string): number {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (hours === 12) hours = 0;
    if (modifier?.toUpperCase() === "PM") hours += 12;
    return hours * 60 + minutes;
}

function minutesToTimeStr(totalMinutes: number): string {
    let h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

// Generate all slots from 9 AM to 6 PM, filtering out ones blocked by existing bookings
export const getAvailableSlots = query({
    args: {
        date: v.string(),
        serviceDuration: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const requestedDuration = parseDurationToMinutes(args.serviceDuration || "2 Hours");

        // Get all non-cancelled appointments for this date
        const dayAppointments = await ctx.db
            .query("appointments")
            .withIndex("by_date", (q) => q.eq("date", args.date))
            .filter((q) => q.neq(q.field("status"), "cancelled"))
            .collect();

        // Get the services to know their durations
        const services = await ctx.db.query("services").collect();
        const servicesMap = new Map(services.map((s) => [s._id, s]));

        // Build list of occupied time ranges [startMin, endMin]
        const occupied: [number, number][] = dayAppointments.map((app) => {
            const startMin = parseTimeToMinutes(app.timeSlot);
            const service = servicesMap.get(app.serviceId);
            const durationMin = parseDurationToMinutes(service?.duration || "2 Hours");
            return [startMin, startMin + durationMin];
        });

        // Generate 1-hour interval candidate slots from OPEN to CLOSE
        const slots: string[] = [];
        for (let min = OPEN_HOUR * 60; min < CLOSE_HOUR * 60; min += 60) {
            const slotEnd = min + requestedDuration;

            // Slot must fit before closing
            if (slotEnd > CLOSE_HOUR * 60) continue;

            // Check if this slot overlaps any occupied range
            const overlaps = occupied.some(
                ([occStart, occEnd]) => min < occEnd && slotEnd > occStart
            );
            if (overlaps) continue;

            slots.push(minutesToTimeStr(min));
        }

        return slots;
    },
});

// Keep old queries for admin availability management
export const getAvailability = query({
    args: { date: v.string() },
    handler: async (ctx, args) => {
        const custom = await ctx.db
            .query("availability")
            .withIndex("by_date", (q) => q.eq("date", args.date))
            .first();

        if (custom) return custom.slots;

        const defaults = await ctx.db.query("defaultSlots").first();
        return defaults?.slots || ["09:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM"];
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
        return defaults?.slots || ["09:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM"];
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
