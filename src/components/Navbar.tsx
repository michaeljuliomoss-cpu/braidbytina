"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Services", href: "/services" },
        { name: "Gallery", href: "/gallery" },
        { name: "Shop", href: "/products" },
        { name: "Book", href: "/book" },
        { name: "About", href: "/about" },
    ];

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-lg py-4 shadow-sm border-b border-black/5" : "bg-transparent py-6"
                }`}
        >
            <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
                <Link href="/" className="group flex items-center gap-3">
                    <div className="w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden px-1 py-1">
                        <img src="/images/briadbytinatranparent.png" alt="BraidsByTina Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-secondary">
                        BraidsByTina<span className="text-primary italic">.</span>
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-secondary hover:text-primary font-bold transition-all hover:scale-105"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link
                        href="/book"
                        className="bg-primary hover:bg-primary-dark text-white px-8 py-2.5 rounded-full font-black transition-all hover:scale-105 shadow-xl shadow-primary/20 active:scale-95"
                    >
                        Book Appointment
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-secondary hover:text-primary"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden absolute top-full left-0 w-full bg-white border-t border-black/5 shadow-2xl"
                    >
                        <div className="flex flex-col py-6 px-6 space-y-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="text-lg font-black text-secondary hover:text-primary transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link
                                href="/book"
                                onClick={() => setIsOpen(false)}
                                className="bg-primary text-white text-center px-6 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-xl shadow-primary/10"
                            >
                                Book Appointment
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
