"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import { Sparkles, Camera } from "lucide-react";

export default function GalleryPage() {
    const photos = useQuery(api.gallery.getGallery) || [];

    const placeholderPhotos = [
        { url: "/images/knotless_braids_1771781969882.png", caption: "Knotless Perfection" },
        { url: "/images/butterfly_locs_1771782031798.png", caption: "Boho Butterfly Locs" },
        { url: "/images/stitch_braids_1771782056618.png", caption: "Neat Stitch Braids" },
        { url: "/images/fulani_braids_1771782085714.png", caption: "Fulani Magic" },
        { url: "/images/knotless_braids_1771781969882.png", caption: "Signature Knotless" },
        { url: "/images/butterfly_locs_1771782031798.png", caption: "Distressed Locs" },
        { url: "/images/stitch_braids_1771782056618.png", caption: "Sleek Cornrows" },
        { url: "/images/fulani_braids_1771782085714.png", caption: "Tribal Braids" },
        { url: "/images/knotless_braids_1771781969882.png", caption: "Jumbo Knotless" },
        { url: "/images/butterfly_locs_1771782031798.png", caption: "Long Butterfly Locs" },
        { url: "/images/stitch_braids_1771782056618.png", caption: "Creative Stitch" },
        { url: "/images/fulani_braids_1771782085714.png", caption: "Designer Parts" },
    ];

    const displayPhotos = photos.length > 0 ? photos : placeholderPhotos;

    return (
        <div className="pt-32 pb-24 min-h-screen bg-white">
            <div className="container mx-auto px-6">
                <header className="mb-16 text-center max-w-3xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-8 border border-primary/20"
                    >
                        <Camera size={18} /> Portfolio Showcase
                    </motion.div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-secondary mb-6">
                        The <span className="text-primary italic">Lookbook</span>
                    </h1>
                    <p className="text-xl text-gray-400 font-bold leading-relaxed">
                        A curated collection of our finest transformations. Browse through our creative
                        styles and find inspiration for your next appointment.
                    </p>
                </header>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 relative z-10">
                    {displayPhotos.map((photo: any, index: number) => (
                        <motion.div
                            key={photo._id || index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -10 }}
                            className="aspect-square rounded-[2rem] overflow-hidden border border-black/5 group cursor-pointer relative shadow-lg bg-stone-50"
                        >
                            <img
                                src={photo.url || ""}
                                alt={photo.caption || "BraidsByTina Style"}
                                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                <p className="text-white font-black text-xl tracking-tight drop-shadow-lg">{photo.caption || "BraidsByTina Style"}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
