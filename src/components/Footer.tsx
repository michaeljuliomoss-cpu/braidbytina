"use client";

import Link from "next/link";
import { Instagram, MapPin, Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Footer() {
    const pathname = usePathname();
    const contentData = useQuery(api.content.getAllContent) as any;
    const logoUrl = contentData?.logoUrl || "/images/briadbytinatranparent.png";

    // Don't show footer on admin pages
    if (pathname?.startsWith("/admin")) return null;
    return (
        <footer className="bg-white text-gray-500 py-16 lg:py-24 border-t border-black/5">
            <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-16">
                <div className="space-y-8">
                    <Link href="/" className="group flex items-center gap-3">
                        <div className="w-24 h-24 flex items-center justify-center p-0 group-hover:scale-110 transition-transform overflow-hidden">
                            <img src={logoUrl} alt="BraidsByTina Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-3xl font-black tracking-tighter text-secondary">
                            BraidsByTina<span className="text-primary italic">.</span>
                        </span>
                    </Link>
                    <p className="max-w-xs leading-relaxed font-bold text-lg">
                        Premiere protective transformations crafted with precision. Book your flawless transformation today.
                    </p>
                </div>

                <div className="space-y-6">
                    <h4 className="text-secondary font-black text-xl tracking-tight">Contact Info</h4>
                    <ul className="space-y-4 font-bold">
                        <li className="flex items-center space-x-3">
                            <Phone className="w-6 h-6 text-primary" />
                            <span className="text-lg">(242) 553-7275</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <Instagram className="w-6 h-6 text-primary" />
                            <a href="https://www.tiktok.com/@tinnasobless" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-lg">
                                @tinnasobless (TikTok)
                            </a>
                        </li>
                        <li className="flex items-start space-x-3">
                            <MapPin className="w-6 h-6 text-primary shrink-0" />
                            <span className="text-lg">The Bahamas</span>
                        </li>
                    </ul>
                </div>

                <div className="space-y-6">
                    <h4 className="text-secondary font-black text-xl tracking-tight">Policies</h4>
                    <ul className="space-y-3 font-bold text-lg">
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Deposits required
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Saturdays walk-ins only
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Mon-Fri: 9AM - 6PM
                        </li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto px-6 lg:px-12 mt-16 pt-8 border-t border-black/5 flex flex-col md:flex-row items-center justify-between text-base font-bold">
                <p>&copy; {new Date().getFullYear()} Braids By Tina. All rights reserved.</p>
                <div className="mt-4 md:mt-0 flex items-center space-x-8">
                    <Link href="/gallery" className="hover:text-primary transition-colors">Portfolio</Link>
                    <Link href="/about" className="hover:text-primary transition-colors">About</Link>
                </div>
            </div>
        </footer>
    );
}
