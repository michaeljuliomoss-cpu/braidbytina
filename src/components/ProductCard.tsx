"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Check, X } from "lucide-react";

interface ProductCardProps {
    name: string;
    price: number;
    description: string;
    imageUrl?: string;
    inStock: boolean;
}

export default function ProductCard({ name, price, description, imageUrl, inStock }: ProductCardProps) {
    const whatsappUrl = `https://wa.me/12425537275?text=Hello%20Tina!%20I%27m%20interested%20in%20the%20${encodeURIComponent(name)}.`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-black/5 shadow-sm hover:shadow-2xl transition-all duration-500"
        >
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                <img
                    src={imageUrl || "/images/briadbytinatranparent.png"}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-black text-secondary shadow-sm">
                        ${price}
                    </span>
                    {inStock ? (
                        <span className="bg-green-500/10 backdrop-blur-md border border-green-500/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-green-600 flex items-center gap-1 shadow-sm">
                            <Check size={12} /> In Stock
                        </span>
                    ) : (
                        <span className="bg-red-500/10 backdrop-blur-md border border-red-500/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-1 shadow-sm">
                            <X size={12} /> Sold Out
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-4">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tight text-secondary group-hover:text-primary transition-colors">
                        {name}
                    </h3>
                    <p className="text-gray-400 font-medium line-clamp-2 text-sm leading-relaxed">
                        {description}
                    </p>
                </div>

                <a
                    href={inStock ? whatsappUrl : "#"}
                    target={inStock ? "_blank" : undefined}
                    rel={inStock ? "noopener noreferrer" : undefined}
                    className={`w-full py-4 rounded-full font-black flex items-center justify-center gap-2 transition-all ${inStock
                            ? "bg-secondary hover:bg-primary text-white shadow-xl shadow-secondary/10 hover:shadow-primary/20 active:scale-95"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                >
                    <ShoppingBag size={18} />
                    {inStock ? "Order via WhatsApp" : "Unavailable"}
                </a>
            </div>
        </motion.div>
    );
}
