import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

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
        // Double booking prevention
        const existing = await ctx.db
            .query("appointments")
            .withIndex("by_date", (q) => q.eq("date", args.date))
            .filter((q) => q.and(
                q.eq(q.field("timeSlot"), args.timeSlot),
                q.neq(q.field("status"), "cancelled")
            ))
            .first();

        if (existing) {
            throw new Error("This time slot is already booked.");
        }

        const appointmentId = await ctx.db.insert("appointments", {
            ...args,
            status: "confirmed",
        });

        // Trigger email notification to Tina
        await ctx.scheduler.runAfter(0, api.emails.sendBookingEmail, {
            customerName: args.customerName,
            customerEmail: args.customerEmail,
            customerPhone: args.customerPhone,
            serviceName: args.serviceName,
            date: args.date,
            timeSlot: args.timeSlot,
            totalPrice: args.totalPrice,
            notes: args.notes,
        });

        // Trigger WhatsApp notification to the group
        await ctx.scheduler.runAfter(0, api.whatsapp.sendWhatsAppNotification, {
            customerName: args.customerName,
            serviceName: args.serviceName,
            date: args.date,
            timeSlot: args.timeSlot,
            totalPrice: args.totalPrice,
        });

        const service = await ctx.db.get(args.serviceId);

        // Trigger Google Calendar Push
        await ctx.scheduler.runAfter(0, internal.calendarApi.createEvent, {
            appointmentId,
            customerName: args.customerName,
            customerEmail: args.customerEmail,
            customerPhone: args.customerPhone,
            serviceName: args.serviceName,
            date: args.date,
            timeSlot: args.timeSlot,
            duration: service?.duration,
            notes: args.notes,
        });

        // Trigger Customer Confirmation Email
        await ctx.scheduler.runAfter(0, api.emails.sendCustomerConfirmation, {
            customerName: args.customerName,
            customerEmail: args.customerEmail,
            serviceName: args.serviceName,
            date: args.date,
            timeSlot: args.timeSlot,
            duration: service?.duration,
        });

        // Schedule the 1-hour reminder for the customer
        // Calculate timestamp for exactly 1 hour before the appointment
        // We use EST logic here just like the ICS generator (assuming local New York time)
        const [time, modifier] = args.timeSlot.split(' ');
        let [hours, minutes] = time.split(':');
        let h = parseInt(hours, 10);
        if (h === 12) h = 0;
        if (modifier.toLowerCase() === 'pm') h += 12;

        // Parse date
        const [year, month, day] = args.date.split('-');

        // Build an explicit JS date assuming New York time (EDT/EST fallback)
        const appointmentTime = new Date(`${args.date} ${args.timeSlot} EST`);
        const oneHourMillis = 60 * 60 * 1000;
        let scheduledTime = appointmentTime.getTime() - oneHourMillis;

        // Prevent scheduling in the past
        if (scheduledTime <= Date.now()) {
            scheduledTime = Date.now() + 10000; // schedule in 10 seconds if it's already within an hour
        }

        // Use runAt to execute it at that precise absolute time
        await ctx.scheduler.runAt(scheduledTime, api.emails.sendCustomerReminder, {
            customerName: args.customerName,
            customerEmail: args.customerEmail,
            serviceName: args.serviceName,
            timeSlot: args.timeSlot,
        });

        return appointmentId;
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

        // Trigger Google Calendar update
        await ctx.scheduler.runAfter(0, internal.calendarApi.updateEventStatus, {
            appointmentId: args.id,
            status: args.status,
        });
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
export const getIcalData = query({
    args: {},
    handler: async (ctx) => {
        const appointments = await ctx.db
            .query("appointments")
            .filter((q) => q.neq(q.field("status"), "cancelled"))
            .collect();

        const services = await ctx.db.query("services").collect();
        const servicesMap = new Map(services.map(s => [s._id, s]));

        return appointments.map(app => ({
            ...app,
            duration: servicesMap.get(app.serviceId)?.duration || "2 Hours"
        }));
    },
});
