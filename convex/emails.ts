import { v } from "convex/values";
import { action } from "./_generated/server";

// Helper functions for ICS generation
function formatDateForIcs(dateStr: string, timeStr: string): string {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') hours = '00';
    if (modifier.toLowerCase() === 'pm') hours = String(parseInt(hours, 10) + 12);

    const paddedHours = String(hours).padStart(2, '0');
    return `${dateStr.replace(/-/g, '')}T${paddedHours}${minutes}00`;
}

function calculateEndTimeIcs(startIcs: string, durationStr?: string): string {
    const year = parseInt(startIcs.substring(0, 4));
    const month = parseInt(startIcs.substring(4, 6)) - 1;
    const day = parseInt(startIcs.substring(6, 8));
    const hours = parseInt(startIcs.substring(9, 11));
    const minutes = parseInt(startIcs.substring(11, 13));

    const dt = new Date(Date.UTC(year, month, day, hours, minutes, 0));

    let durationMins = 120;
    const lower = (durationStr || "").toLowerCase();
    const value = parseFloat(lower);
    if (!isNaN(value)) {
        if (lower.includes('min')) durationMins = value;
        else if (lower.includes('hour') || lower.includes('hr')) durationMins = value * 60;
    }

    dt.setUTCMinutes(dt.getUTCMinutes() + durationMins);

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00`;
}

function generateIcsBase64(customerName: string, serviceName: string, dateStr: string, timeStr: string, durationStr?: string): string {
    const startIcs = formatDateForIcs(dateStr, timeStr);
    const endIcs = calculateEndTimeIcs(startIcs, durationStr);
    const nowIcs = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@braidsbytina.com`;

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//BraidsByTina//Booking//EN',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${nowIcs}`,
        `DTSTART;TZID=America/New_York:${startIcs}`,
        `DTEND;TZID=America/New_York:${endIcs}`,
        `SUMMARY:BraidsByTina - ${serviceName}`,
        `DESCRIPTION:Hair braiding appointment at BraidsByTina.`,
        `LOCATION:BraidsByTina Salon`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    return Buffer.from(icsContent).toString('base64');
}

export const sendBookingEmail = action({
    args: {
        customerName: v.string(),
        customerEmail: v.string(),
        customerPhone: v.string(),
        serviceName: v.string(),
        date: v.string(),
        timeSlot: v.string(),
        totalPrice: v.number(),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const TINA_EMAIL = process.env.TINA_EMAIL || "michaeljuliomoss@gmail.com";

        if (!RESEND_API_KEY) {
            console.error("RESEND_API_KEY not found in environment variables");
            return;
        }

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "BraidByTina <onboarding@resend.dev>",
                to: [TINA_EMAIL],
                subject: `New Booking: ${args.serviceName} - ${args.customerName}`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 20px; background-color: #fffafb;">
            <h2 style="color: #f28ab2; text-align: center; font-size: 24px;">New Appointment! 🧶</h2>
            <div style="background-color: white; padding: 20px; border-radius: 15px; border: 1px solid #f28ab222;">
              <p style="margin: 10px 0;"><strong>👤 Customer:</strong> ${args.customerName}</p>
              <p style="margin: 10px 0;"><strong>✂️ Service:</strong> ${args.serviceName}</p>
              <p style="margin: 10px 0;"><strong>📅 Date:</strong> ${args.date}</p>
              <p style="margin: 10px 0;"><strong>⏰ Time:</strong> ${args.timeSlot}</p>
              <p style="margin: 10px 0;"><strong>💰 Price:</strong> $${args.totalPrice}</p>
              <p style="margin: 10px 0;"><strong>📞 Phone:</strong> ${args.customerPhone}</p>
              <p style="margin: 10px 0;"><strong>📝 Notes:</strong> ${args.notes || "None"}</p>
            </div>
            <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
              This booking is auto-confirmed and added to your calendar.
            </p>
          </div>
        `,
            }),
        });

        if (!response.ok) {
            console.error("Resend API Error (Admin):", await response.text());
        }
    },
});

export const sendCustomerConfirmation = action({
    args: {
        customerName: v.string(),
        customerEmail: v.string(),
        serviceName: v.string(),
        date: v.string(),
        timeSlot: v.string(),
        duration: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        if (!RESEND_API_KEY) return;

        // Generate Google Calendar URL Template
        const startIcs = formatDateForIcs(args.date, args.timeSlot);
        const endIcs = calculateEndTimeIcs(startIcs, args.duration);
        const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('BraidsByTina - ' + args.serviceName)}&dates=${startIcs}/${endIcs}&details=Hair%20braiding%20appointment&location=BraidsByTina%20Salon`;

        // Generate ICS buffer for Apple/Outlook
        const base64Ics = generateIcsBase64(args.customerName, args.serviceName, args.date, args.timeSlot, args.duration);

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "BraidByTina <onboarding@resend.dev>",
                to: [args.customerEmail],
                subject: `Your Appointment is Confirmed! 💇‍♀️`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 20px; background-color: #fffafb;">
            <h2 style="color: #f28ab2; text-align: center; font-size: 24px;">You're booked! ✨</h2>
            <div style="background-color: white; padding: 20px; border-radius: 15px; border: 1px solid #f28ab222; text-align: center;">
              <p style="font-size: 16px;">Hi ${args.customerName},</p>
              <p style="font-size: 16px;">Your appointment has been successfully scheduled!</p>
              <div style="background: #fdf2f8; padding: 15px; border-radius: 10px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Service:</strong> ${args.serviceName}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${args.date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${args.timeSlot}</p>
              </div>
              <p>Attached is an invite to add this to your Apple or Outlook calendar.</p>
              <a href="${googleCalUrl}" style="display: inline-block; background-color: #f28ab2; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-top: 10px;">Add to Google Calendar</a>
            </div>
            <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
              See you soon at BraidsByTina!
            </p>
          </div>
        `,
                attachments: [
                    {
                        filename: "invite.ics",
                        content: base64Ics,
                    }
                ]
            }),
        });

        if (!response.ok) {
            console.error("Resend API Error (Customer Conf):", await response.text());
        }
    },
});

export const sendCustomerReminder = action({
    args: {
        customerName: v.string(),
        customerEmail: v.string(),
        serviceName: v.string(),
        timeSlot: v.string(),
    },
    handler: async (ctx, args) => {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        if (!RESEND_API_KEY) return;

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "BraidByTina <onboarding@resend.dev>",
                to: [args.customerEmail],
                subject: `Reminder: Your appointment is in 1 hour! 💇‍♀️`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 20px; background-color: #fffafb;">
            <h2 style="color: #f28ab2; text-align: center; font-size: 24px;">See you soon! ✨</h2>
            <div style="background-color: white; padding: 20px; border-radius: 15px; border: 1px solid #f28ab222; text-align: center;">
              <p style="font-size: 16px;">Hi ${args.customerName},</p>
              <p style="font-size: 16px;">This is a quick reminder that your appointment for <strong>${args.serviceName}</strong> is coming up in approximately 1 hour at <strong>${args.timeSlot}</strong>.</p>
            </div>
          </div>
        `
            }),
        });

        if (!response.ok) {
            console.error("Resend API Error (Reminder):", await response.text());
        }
    }
});

export const sendCustomerRequestReceived = action({
    args: {
        customerName: v.string(),
        customerEmail: v.string(),
        serviceName: v.string(),
        date: v.string(),
        timeSlot: v.string(),
        depositInstructions: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        if (!RESEND_API_KEY) return;

        const depositText = args.depositInstructions
            ? `<div style="background: #fdf2f8; padding: 15px; border-radius: 10px; margin: 20px 0;">
                 <h3 style="margin-top: 0; color: #f28ab2;">Deposit Instructions</h3>
                 <p style="white-space: pre-wrap; margin-bottom: 0;">${args.depositInstructions}</p>
               </div>`
            : `<p>A deposit is required to secure your appointment. Tina will reach out to you shortly with deposit instructions.</p>`;

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "BraidByTina <onboarding@resend.dev>",
                to: [args.customerEmail],
                subject: `Booking Request Received - Deposit Required 💇‍♀️`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 20px; background-color: #fffafb;">
            <h2 style="color: #f28ab2; text-align: center; font-size: 24px;">Request Received! ✨</h2>
            <div style="background-color: white; padding: 20px; border-radius: 15px; border: 1px solid #f28ab222; text-align: center;">
              <p style="font-size: 16px;">Hi ${args.customerName},</p>
              <p style="font-size: 16px;">Your appointment request for <strong>${args.serviceName}</strong> on <strong>${args.date}</strong> at <strong>${args.timeSlot}</strong> has been received!</p>
              
              ${depositText}

              <p style="font-size: 14px; color: #666; margin-top: 20px;">Once your deposit is confirmed, you will receive a final confirmation email with your calendar invite.</p>
            </div>
            <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
              See you soon at BraidsByTina!
            </p>
          </div>
        `
            }),
        });

        if (!response.ok) {
            console.error("Resend API Error (Request Received):", await response.text());
        }
    }
});
