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
            status: "pending",
        });

        const depositContent = await ctx.db
            .query("siteContent")
            .withIndex("by_key", (q) => q.eq("key", "deposit-instructions"))
            .first();
        const depositInstructions = depositContent?.value;

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

        // Send Request Received Email with Deposit Instructions
        await ctx.scheduler.runAfter(0, api.emails.sendCustomerRequestReceived, {
            customerName: args.customerName,
            customerEmail: args.customerEmail,
            serviceName: args.serviceName,
            date: args.date,
            timeSlot: args.timeSlot,
            depositInstructions: depositInstructions,
        });

        return appointmentId;
    },
});

export const confirmAppointment = mutation({
    args: { id: v.id("appointments") },
    handler: async (ctx, args) => {
        const appointment = await ctx.db.get(args.id);
        if (!appointment) throw new Error("Appointment not found");

        await ctx.db.patch(args.id, { status: "confirmed" });

        const service = await ctx.db.get(appointment.serviceId);

        // Trigger Google Calendar Push
        await ctx.scheduler.runAfter(0, internal.calendarApi.createEvent, {
            appointmentId: args.id,
            customerName: appointment.customerName,
            customerEmail: appointment.customerEmail,
            customerPhone: appointment.customerPhone,
            serviceName: appointment.serviceName,
            date: appointment.date,
            timeSlot: appointment.timeSlot,
            duration: service?.duration,
            notes: appointment.notes,
        });

        // Trigger Customer Confirmation Email with Calendar Links
        await ctx.scheduler.runAfter(0, api.emails.sendCustomerConfirmation, {
            customerName: appointment.customerName,
            customerEmail: appointment.customerEmail,
            serviceName: appointment.serviceName,
            date: appointment.date,
            timeSlot: appointment.timeSlot,
            duration: service?.duration,
        });

        // Schedule the 1-hour reminder for the customer
        const [time, modifier] = appointment.timeSlot.split(' ');
        let [hours, minutes] = time.split(':');
        let h = parseInt(hours, 10);
        if (h === 12) h = 0;
        if (modifier.toLowerCase() === 'pm') h += 12;

        const appointmentTime = new Date(`${appointment.date} ${appointment.timeSlot} EST`);
        const oneHourMillis = 60 * 60 * 1000;
        let scheduledTime = appointmentTime.getTime() - oneHourMillis;

        if (scheduledTime <= Date.now()) {
            scheduledTime = Date.now() + 10000;
        }

        await ctx.scheduler.runAt(scheduledTime, api.emails.sendCustomerReminder, {
            customerName: appointment.customerName,
            customerEmail: appointment.customerEmail,
            serviceName: appointment.serviceName,
            timeSlot: appointment.timeSlot,
        });
    }
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
