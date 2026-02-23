"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import { Clock, ShieldCheck, MapPin, Instagram, Phone } from "lucide-react";

export default function AboutPage() {
    const contentData = useQuery(api.content.getAllContent) as any;

    // Merge dynamic content with defaults to prevent flashing empty text
    const content = {
        hours: contentData?.hours || "Mon-Sat: 9am - 7pm\nSun: Closed",
        depositPolicy: contentData?.depositPolicy || "A $25 non-refundable deposit is required to secure your appointment.",
        bio: contentData?.bio || "With a passion for precision and a commitment to hair health, I've spent years perfecting the art of protective styling. My goal is to make every client feel empowered and beautiful, one braid at a time.",
        aboutImageUrl: contentData?.aboutImageUrl || "/images/media__1771778558925.png",
        aboutTitle: contentData?.aboutTitle || "The Hands Behind the Hair.",
        aboutTagline: contentData?.aboutTagline || "Meet Tina"
    };

    return (
        <div className="pt-32 pb-24 min-h-screen bg-white">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                    >
                        <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border border-black/5">
                            <img
                                src={content.aboutImageUrl}
                                alt="Tina"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-10 -right-10 bg-primary p-12 rounded-[3rem] shadow-2xl hidden md:block">
                            <p className="text-white font-black text-4xl tracking-tighter italic">Since 2018</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-12"
                    >
                        <div>
                            <p className="text-primary font-bold uppercase tracking-widest mb-4">{content.aboutTagline}</p>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-secondary mb-6">
                                {content.aboutTitle}
                            </h1>
                            <p className="text-xl text-gray-500 leading-relaxed font-bold">
                                {content.bio}
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-stone-50 p-8 rounded-[2rem] border border-black/5 shadow-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                        <Clock size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-secondary">Business Hours</h3>
                                </div>
                                <p className="text-lg text-gray-500 whitespace-pre-line font-bold leading-relaxed">
                                    {content.hours}
                                </p>
                            </div>

                            <div className="bg-stone-50 p-8 rounded-[2rem] border border-black/5 shadow-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-secondary">Deposit & Booking</h3>
                                </div>
                                <p className="text-lg text-gray-500 font-bold leading-relaxed">
                                    {content.depositPolicy}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <a
                                href="https://wa.me/12425537275"
                                className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-black hover:bg-primary-dark transition-all shadow-lg shadow-primary/30"
                            >
                                <Phone size={20} /> Text to Book
                            </a>
                            <a
                                href="https://www.tiktok.com/@tinnasobless"
                                className="flex items-center gap-3 bg-white border border-black/10 text-secondary px-8 py-4 rounded-full font-black hover:scale-105 transition-all shadow-md"
                            >
                                <Instagram size={20} /> TikTok
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
