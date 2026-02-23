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
                from: "BraidByTina <notifications@resend.dev>", // This will change to her domain once verified
                to: ["michaelMoss@gmail.com"], // Hardcoded for now - we should probably store Tina's email in Convex too!
                subject: `New Booking: ${args.serviceName} - ${args.customerName}`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #f28ab2;">New Appointment Confirmed!</h2>
            <p><strong>Customer:</strong> ${args.customerName}</p>
            <p><strong>Service:</strong> ${args.serviceName}</p>
            <p><strong>Date:</strong> ${args.date}</p>
            <p><strong>Time:</strong> ${args.timeSlot}</p>
            <p><strong>Total Price:</strong> $${args.totalPrice}</p>
            <p><strong>Phone:</strong> ${args.customerPhone}</p>
            <p><strong>Notes:</strong> ${args.notes || "None"}</p>
            <hr style="border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #666;">This appointment has been automatically added to your dashboard and calendar feed.</p>
          </div>
        `,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Failed to send email via Resend:", error);
        }
    },
});
