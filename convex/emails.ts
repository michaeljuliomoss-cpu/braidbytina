import { v } from "convex/values";
import { action } from "./_generated/server";

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
        const TINA_EMAIL = process.env.TINA_EMAIL || "michaelMoss@gmail.com"; // Fallback for now

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
            const error = await response.text();
            console.error("Resend API Error:", error);
        }
    },
});
