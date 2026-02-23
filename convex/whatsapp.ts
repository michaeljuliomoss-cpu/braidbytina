import { v } from "convex/values";
import { action } from "./_generated/server";

export const sendWhatsAppNotification = action({
    args: {
        customerName: v.string(),
        serviceName: v.string(),
        date: v.string(),
        timeSlot: v.string(),
        totalPrice: v.number(),
    },
    handler: async (ctx, args) => {
        // These will be set in the Convex Dashboard as Environment Variables
        const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL; // e.g., https://api.ultramsg.com/instanceXXXX/messages/chat
        const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
        const WHATSAPP_GROUP_ID = process.env.WHATSAPP_GROUP_ID; // The ID of the WhatsApp group

        if (!WHATSAPP_API_URL || !WHATSAPP_TOKEN || !WHATSAPP_GROUP_ID) {
            console.error("WhatsApp credentials missing in Convex Dashboard");
            return;
        }

        const message = `*New Booking Alert!* 🧶\n\n` +
            `👤 *Customer:* ${args.customerName}\n` +
            `✂️ *Service:* ${args.serviceName}\n` +
            `📅 *Date:* ${args.date}\n` +
            `⏰ *Time:* ${args.timeSlot}\n` +
            `💰 *Total Price:* $${args.totalPrice}\n\n` +
            `_Check the Admin Dashboard for details._`;

        const response = await fetch(WHATSAPP_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                token: WHATSAPP_TOKEN,
                to: WHATSAPP_GROUP_ID,
                body: message,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Failed to send WhatsApp message:", error);
        }
    },
});
