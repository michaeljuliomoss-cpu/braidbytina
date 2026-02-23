import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
    path: "/ical",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token");

        // Basic security check - in production you might want a unique per-user token stored in DB
        // For this solo-admin site, a shared secret is simple and effective.
        if (token !== "braidbytina-calendar-secret-2025") {
            return new Response("Unauthorized", { status: 401 });
        }

        const data = await ctx.runQuery(api.appointments.getIcalData);

        let ical = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//BraidByTina//BookingSystem//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "X-WR-CALNAME:BraidByTina Appointments",
            "X-WR-TIMEZONE:America/Nassau", // Default to Bahamas/Eastern
        ];

        for (const app of data) {
            // Parse start date/time
            // date: YYYY-MM-DD, timeSlot: "HH:MM AM"
            const [h_m, ampm] = app.timeSlot.split(" ");
            let [hours, minutes] = h_m.split(":").map(Number);
            if (ampm === "PM" && hours !== 12) hours += 12;
            if (ampm === "AM" && hours === 12) hours = 0;

            const start = new Date(`${app.date}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`);

            // Calculate end time
            const durationHours = parseDuration(app.duration);
            const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

            const formatCalDate = (date: Date) => {
                return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
            };

            const uid = `${app._id}@braidbytina.com`;

            ical.push("BEGIN:VEVENT");
            ical.push(`UID:${uid}`);
            ical.push(`DTSTAMP:${formatCalDate(new Date())}`);
            ical.push(`DTSTART:${formatCalDate(start)}`);
            ical.push(`DTEND:${formatCalDate(end)}`);
            ical.push(`SUMMARY:${app.serviceName} - ${app.customerName}`);
            ical.push(`DESCRIPTION:Customer: ${app.customerName}\\nPhone: ${app.customerPhone}\\nEmail: ${app.customerEmail}\\nNotes: ${app.notes || "None"}`);
            ical.push(`STATUS:${app.status === "confirmed" ? "CONFIRMED" : "TENTATIVE"}`);
            ical.push("END:VEVENT");
        }

        ical.push("END:VCALENDAR");

        return new Response(ical.join("\r\n"), {
            status: 200,
            headers: {
                "Content-Type": "text/calendar; charset=utf-8",
                "Content-Disposition": 'attachment; filename="braidbytina-appointments.ics"',
            },
        });
    }),
});

function parseDuration(duration: string): number {
    const match = duration.match(/(\d+)/g);
    if (!match) return 2;
    return Math.max(...match.map(Number));
}

export default http;
