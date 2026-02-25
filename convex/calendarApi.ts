"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { google } from "googleapis";

const CALENDAR_IDS = [
    "millerjestina10@gmail.com",
    "michaeljuliomoss@gmail.com"
];
const TIMEZONE = "America/New_York"; // Assuming EDT/EST as default

// Setup Google Calendar API
function getCalendarClient() {
    const clientEmail = process.env.GOOGLE_CALENDAR_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_CALENDAR_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
        throw new Error("Missing Google Calendar credentials. Setup GOOGLE_CALENDAR_CLIENT_EMAIL and GOOGLE_CALENDAR_PRIVATE_KEY in environment variables.");
    }

    const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
        scopes: ['https://www.googleapis.com/auth/calendar.events']
    });

    return google.calendar({ version: 'v3', auth });
}

// Convert "2026-02-25" and "09:30 AM" to Date object in EDT
function parseDateString(dateStr: string, timeStr: string): Date {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
        hours = '00';
    }

    if (modifier === 'PM' || modifier === 'pm') {
        hours = String(parseInt(hours, 10) + 12);
    }

    const paddedHours = String(hours).padStart(2, '0');
    return new Date(`${dateStr}T${paddedHours}:${minutes}:00`);
}

function parseDurationMinutes(durationStr: string): number {
    if (!durationStr) return 120; // default 2 hours
    const lower = durationStr.toLowerCase();
    const value = parseFloat(lower);
    if (isNaN(value)) return 120;

    if (lower.includes('min')) {
        return value;
    }
    if (lower.includes('hour') || lower.includes('hr')) {
        return value * 60;
    }
    return 120;
}

// Format local date back to "YYYY-MM-DDTHH:mm:ss" for Google API
function toLocalIsoString(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export const createEvent = internalAction({
    args: {
        appointmentId: v.id("appointments"),
        customerName: v.string(),
        customerEmail: v.string(),
        customerPhone: v.string(),
        serviceName: v.string(),
        date: v.string(),
        timeSlot: v.string(),
        duration: v.optional(v.string()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        try {
            const calendar = getCalendarClient();

            const startDate = parseDateString(args.date, args.timeSlot);
            const durationMins = parseDurationMinutes(args.duration || "2 Hours");

            const endDate = new Date(startDate.getTime() + durationMins * 60000);

            const event = {
                summary: `${args.serviceName} - ${args.customerName}`,
                description: `Client: ${args.customerName}\nPhone: ${args.customerPhone}\nEmail: ${args.customerEmail}\n\nNotes:\n${args.notes || "No notes provided."}\n\nSystem ID: ${args.appointmentId}`,
                start: {
                    dateTime: toLocalIsoString(startDate),
                    timeZone: TIMEZONE,
                },
                end: {
                    dateTime: toLocalIsoString(endDate),
                    timeZone: TIMEZONE,
                },
                extendedProperties: {
                    private: {
                        convexAppointmentId: args.appointmentId
                    }
                }
            };

            const createdIds: (string | null)[] = await Promise.all(CALENDAR_IDS.map(async (calendarId) => {
                try {
                    const response = await calendar.events.insert({
                        calendarId: calendarId,
                        requestBody: event,
                    });
                    console.log(`Successfully created event on ${calendarId}:`, response.data.htmlLink);
                    return response.data.id || null;
                } catch (err) {
                    console.error(`Failed to push to calendar ${calendarId}:`, err);
                    return null;
                }
            }));

            // Return first successful ID or null
            return createdIds.find(id => id !== null) || null;

        } catch (error) {
            console.error("Failed to execute Calendar insert action:", error);
            return null;
        }
    }
});

export const updateEventStatus = internalAction({
    args: {
        appointmentId: v.id("appointments"),
        status: v.string(),
        googleEventId: v.optional(v.string()), // Deprecated since we now use multi-calendars
    },
    handler: async (ctx, args) => {
        try {
            const calendar = getCalendarClient();

            await Promise.all(CALENDAR_IDS.map(async (calendarId) => {
                try {
                    // Search for the event on this specific calendar using the private extended property
                    const searchResponse = await calendar.events.list({
                        calendarId: calendarId,
                        privateExtendedProperty: [`convexAppointmentId=${args.appointmentId}`]
                    });

                    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
                        return; // Event not found on this calendar, maybe creating it failed originally
                    }

                    const eventId = searchResponse.data.items[0].id as string;

                    if (args.status === 'cancelled') {
                        const event = await calendar.events.get({
                            calendarId: calendarId,
                            eventId: eventId
                        });

                        if (event.data.summary && !event.data.summary.includes("[CANCELLED]")) {
                            await calendar.events.patch({
                                calendarId: calendarId,
                                eventId: eventId,
                                requestBody: {
                                    summary: `[CANCELLED] ${event.data.summary}`
                                }
                            });
                        }
                    } else if (args.status === 'confirmed') {
                        const event = await calendar.events.get({
                            calendarId: calendarId,
                            eventId: eventId
                        });

                        if (event.data.summary && event.data.summary.includes("[CANCELLED]")) {
                            await calendar.events.patch({
                                calendarId: calendarId,
                                eventId: eventId,
                                requestBody: {
                                    summary: event.data.summary.replace("[CANCELLED] ", "")
                                }
                            });
                        }
                    }
                } catch (err) {
                    console.error(`Failed to update event status on ${calendarId}:`, err);
                }
            }));

            console.log("Successfully ran update sync across Google Calendars");
        } catch (error) {
            console.error("Failed to execute update Google Calendar action:", error);
        }
    }
});

export const deleteEvent = internalAction({
    args: {
        appointmentId: v.id("appointments"),
    },
    handler: async (ctx, args) => {
        try {
            const calendar = getCalendarClient();

            await Promise.all(CALENDAR_IDS.map(async (calendarId) => {
                try {
                    const searchResponse = await calendar.events.list({
                        calendarId: calendarId,
                        privateExtendedProperty: [`convexAppointmentId=${args.appointmentId}`]
                    });

                    if (searchResponse.data.items && searchResponse.data.items.length > 0) {
                        const eventId = searchResponse.data.items[0].id as string;
                        await calendar.events.delete({
                            calendarId: calendarId,
                            eventId: eventId
                        });
                        console.log(`Successfully deleted Google Calendar event on ${calendarId}`);
                    }
                } catch (err) {
                    console.error(`Failed to delete event on ${calendarId}:`, err);
                }
            }));

        } catch (error) {
            console.error("Failed to execute delete Google Calendar action:", error);
        }
    }
});
