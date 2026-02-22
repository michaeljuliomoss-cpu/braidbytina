"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface ServiceProps {
    name: string;
    price: number;
    duration: string;
    description: string;
    imageUrl?: string;
}

export default function ServiceCard({ name, price, duration, description, imageUrl }: ServiceProps) {
    // Pre-fill the whatsapp message with the specific service title
    const whatsappUrl = `https://wa.me/12425537275?text=${encodeURIComponent(
        `Hello Tina! I'm interested in booking an appointment for ${name}.`
    )}`;

    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all border border-black/5 flex flex-col group"
        >
            <div className="relative h-64 md:h-72 lg:h-80 overflow-hidden bg-stone-100">
                <img
                    src={imageUrl || "/logo.png"}
                    alt={name}
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-primary text-white font-black px-4 py-2 rounded-full text-lg shadow-xl border-2 border-white">
                    ${price}
                </div>
            </div>

            <div className="p-8 flex-grow flex flex-col bg-white">
                <h3 className="text-2xl font-black tracking-tighter mb-3 text-secondary group-hover:text-primary transition-colors">{name}</h3>

                <div className="flex items-center text-primary font-black mb-4 bg-primary/10 px-3 py-1.5 rounded-xl w-fit">
                    <Clock className="w-5 h-5 mr-2" />
                    {duration}
                </div>

                <p className="text-gray-500 font-bold leading-relaxed mb-8 flex-grow">
                    {description}
                </p>

                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-full transition-all active:scale-95 shadow-lg shadow-primary/20"
                >
                    Book This Style
                </a>
            </div>
        </motion.div>
    );
}
