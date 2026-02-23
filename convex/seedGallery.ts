import { mutation } from "./_generated/server";

export const seedGallery = mutation({
    args: {},
    handler: async (ctx) => {
        // Clear existing gallery if any
        const existing = await ctx.db.query("gallery").collect();
        for (const img of existing) {
            await ctx.db.delete(img._id);
        }

        const placeholders = [
            { imageUrl: "/images/knotless_braids_1771781969882.png", caption: "Knotless Perfection" },
            { imageUrl: "/images/butterfly_locs_1771782031798.png", caption: "Boho Butterfly Locs" },
            { imageUrl: "/images/stitch_braids_1771782056618.png", caption: "Neat Stitch Braids" },
            { imageUrl: "/images/fulani_braids_1771782085714.png", caption: "Fulani Magic" },
            { imageUrl: "/images/knotless_braids_1771781969882.png", caption: "Signature Knotless" },
            { imageUrl: "/images/butterfly_locs_1771782031798.png", caption: "Distressed Locs" },
            { imageUrl: "/images/stitch_braids_1771782056618.png", caption: "Sleek Cornrows" },
            { imageUrl: "/images/fulani_braids_1771782085714.png", caption: "Tribal Braids" },
            { imageUrl: "/images/knotless_braids_1771781969882.png", caption: "Jumbo Knotless" },
            { imageUrl: "/images/butterfly_locs_1771782031798.png", caption: "Long Butterfly Locs" },
            { imageUrl: "/images/stitch_braids_1771782056618.png", caption: "Creative Stitch" },
            { imageUrl: "/images/fulani_braids_1771782085714.png", caption: "Designer Parts" },
        ];

        for (const p of placeholders) {
            await ctx.db.insert("gallery", p);
        }

        return "Gallery seeded successfully";
    },
});
