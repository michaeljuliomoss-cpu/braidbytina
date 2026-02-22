import { mutation } from "./_generated/server";

export const initialize = mutation({
    args: {},
    handler: async (ctx) => {
        const servicesCount = await ctx.db.query("services").collect();
        if (servicesCount.length > 0) {
            console.log("Already seeded services.");
        } else {
            await ctx.db.insert("services", {
                name: "Knotless Box Braids",
                price: 180,
                duration: "4-6 Hours",
                description: "Professional knotless braids starting seamless at the root. Gentle on edges, lightweight.",
                imageUrl: "/images/knotless_braids_1771781969882.png"
            });
            await ctx.db.insert("services", {
                name: "Butterfly Locs",
                price: 160,
                duration: "4-5 Hours",
                description: "Beautiful textured distress faux locs. Perfect for a boho look.",
                imageUrl: "/images/butterfly_locs_1771782031798.png"
            });
            await ctx.db.insert("services", {
                name: "Stitch Braids",
                price: 100,
                duration: "2-3 Hours",
                description: "Extremely neat feed-in stitch braids. Classic and elegant protective styling.",
                imageUrl: "/images/stitch_braids_1771782056618.png"
            });
            await ctx.db.insert("services", {
                name: "Fulani Braids",
                price: 140,
                duration: "3-5 Hours",
                description: "Traditional tribal patterns combining neat cornrows in the front and box braids in the back.",
                imageUrl: "/images/fulani_braids_1771782085714.png"
            });
        }

        const contentCount = await ctx.db.query("siteContent").collect();
        if (contentCount.length > 0) {
            console.log("Already seeded content.");
        } else {
            const initialContent = [
                { key: "heroTitle", value: "Flawless Protective Styles" },
                { key: "heroSubtitle", value: "Book with the best braider in town for knotless, locs, and stitch braids." },
                { key: "hours", value: "Mon-Sat: 9am - 7pm\nSun: Closed" },
                { key: "depositPolicy", value: "A $25 non-refundable deposit is required to secure your appointment." },
            ];
            for (const item of initialContent) {
                await ctx.db.insert("siteContent", item);
            }
        }
    },
});
