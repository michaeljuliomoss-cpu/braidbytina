"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import ServiceCard from "@/components/ServiceCard";
import { motion } from "framer-motion";
import { Sparkles, Scissors, Phone } from "lucide-react";

export default function ServicesPage() {
    const services = useQuery(api.services.getServices) || [];

    return (
        <div className="pt-32 pb-24 min-h-screen bg-white">
            <div className="container mx-auto px-6">
                <header className="mb-16 text-center max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-8 border border-primary/20"
                    >
                        <Scissors size={18} /> Professional Stylings
                    </motion.div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-secondary mb-6">
                        The Service <span className="text-primary italic">Catalogue.</span>
                    </h1>
                    <p className="text-xl text-gray-400 font-bold leading-relaxed">
                        Explore our wide range of protective styles. From classic knotless to creative locs,
                        we ensure every strand is handled with precision and care.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12 pb-24 border-b border-black/5">
                    {services.length > 0 ? (
                        services.map((service: any, index: number) => (
                            <motion.div
                                key={service._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <ServiceCard {...service} />
                            </motion.div>
                        ))
                    ) : (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="aspect-[4/5] bg-stone-100 rounded-[3rem] animate-pulse border border-black/5" />
                        ))
                    )}
                </div>

                <div className="mt-24 text-center">
                    <h2 className="text-3xl font-black tracking-tighter text-secondary mb-4">Don't see what you're looking for?</h2>
                    <p className="text-gray-400 font-bold mb-8">We offer custom stylings and consultations. Reach out to us directly.</p>
                    <a
                        href="https://wa.me/12425537275"
                        className="inline-flex items-center gap-2 bg-primary text-white px-10 py-5 rounded-full font-black text-lg hover:bg-primary-dark transition-all shadow-xl shadow-primary/30"
                    >
                        <Phone size={20} /> Custom Request
                    </a>
                </div>
            </div>
        </div>
    );
}
