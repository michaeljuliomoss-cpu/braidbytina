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

        const productsCount = await ctx.db.query("products").collect();
        if (productsCount.length > 0) {
            console.log("Already seeded products.");
        } else {
            const initialProducts = [
                {
                    name: "Grip & Slay Edge Control",
                    price: 15,
                    description: "Maximum hold for sleek edges without the white flakes. Infused with honey and argan oil.",
                    inStock: true,
                    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800"
                },
                {
                    name: "Professional Braid Foam",
                    price: 12,
                    description: "Lock in your style and eliminate frizz. Quick-drying formula with a refreshing scent.",
                    inStock: true,
                    imageUrl: "https://images.unsplash.com/photo-1599305090598-fe1757dfc6c2?auto=format&fit=crop&q=80&w=800"
                },
                {
                    name: "Nourishing Growth Oil",
                    price: 20,
                    description: "Soothe your scalp and promote healthy hair growth. Perfect for daily maintenance.",
                    inStock: true,
                    imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800"
                },
                {
                    name: "Satin Hair Bonnet",
                    price: 25,
                    description: "Protect your braids while you sleep. Premium double-layered satin for all hair types.",
                    inStock: true,
                    imageUrl: "https://images.unsplash.com/photo-1631730359585-38a4935ccbbd?auto=format&fit=crop&q=80&w=800"
                }
            ];
            for (const product of initialProducts) {
                await ctx.db.insert("products", product);
            }
        }
    },
});
