"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { ShoppingBag, Sparkles } from "lucide-react";

export default function ProductsPage() {
    const products = useQuery(api.products.getProducts) || [];

    return (
        <main className="min-h-screen bg-white pt-32 pb-20">
            {/* Header */}
            <section className="container mx-auto px-6 mb-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto flex flex-col items-center"
                >
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-primary/20 text-primary border-2 border-primary/30 px-6 py-2 rounded-full text-[10px] md:text-sm font-black tracking-widest uppercase mb-8 flex items-center shadow-sm"
                    >
                        <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-2" /> Premiere Accessories
                    </motion.span>

                    <h1 className="text-6xl md:text-9xl font-black text-secondary tracking-tighter mb-8 leading-[0.85]">
                        The <span className="text-primary italic">Essentials.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 font-bold max-w-2xl">
                        Hand-selected hair care products and custom accessories to maintain your style and keep your hair healthy.
                    </p>
                </motion.div>
            </section>

            {/* Products Grid */}
            <section className="container mx-auto px-6">
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                        {products.map((product) => (
                            <ProductCard key={product._id} {...product} />
                        ))}
                    </div>
                ) : (
                    <div className="py-40 text-center border-4 border-dashed border-gray-50 rounded-[4rem]">
                        <ShoppingBag size={100} className="mx-auto text-gray-100 mb-8" />
                        <h2 className="text-4xl font-black text-gray-300 tracking-tighter mb-4">Store Selection Coming Soon</h2>
                        <p className="text-xl text-gray-400 font-bold">We're updating our stock with the best braiding essentials.</p>
                    </div>
                )}
            </section>

            {/* Support/Info */}
            <section className="container mx-auto px-6 mt-40">
                <div className="bg-secondary rounded-[3.5rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-0" />
                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight">Need a Recommendation?</h2>
                        <p className="text-xl text-gray-400 font-bold max-w-2xl mx-auto">
                            Not sure which products are best for your hair type or braid style? Send us a message and we'll help you pick.
                        </p>
                        <a
                            href="https://wa.me/12425537275?text=Hello%20Tina!%20I%20have%20a%20question%20about%20your%20products."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex bg-primary hover:bg-primary-dark text-white px-12 py-5 rounded-full font-black text-xl transition-all shadow-2xl shadow-primary/30 active:scale-95"
                        >
                            Ask Tina Anything
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}
