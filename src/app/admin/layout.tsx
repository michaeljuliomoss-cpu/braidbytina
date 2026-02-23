"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import {
    LayoutDashboard,
    Scissors,
    FileText,
    LogOut,
    User,
    Menu,
    X,
    Sparkles,
    ShoppingBag,
    Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Redirect to login if path is not /admin/login and no token
    useEffect(() => {
        const storedToken = localStorage.getItem("adminToken");
        if (!storedToken && pathname !== "/admin/login") {
            router.push("/admin/login");
        }
        setToken(storedToken);
    }, [pathname, router]);

    // Validate session with Convex
    const isValid = useQuery(api.admin.validateSession, { token: token || undefined });

    useEffect(() => {
        if (token && isValid === false && pathname !== "/admin/login") {
            localStorage.removeItem("adminToken");
            router.push("/admin/login");
        }
    }, [isValid, token, pathname, router]);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        router.push("/admin/login");
    };

    const menuItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Bookings", href: "/admin/appointments", icon: Calendar },
        { name: "Services", href: "/admin/services", icon: Scissors },
        { name: "Portfolio", href: "/admin/gallery", icon: Sparkles },
        { name: "Site Content", href: "/admin/content", icon: FileText },
    ];

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    // Loading state while validating
    if (token && isValid === undefined) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-primary font-black text-2xl tracking-tighter"
                >
                    Authenticating...
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex w-72 flex-col bg-secondary/50 border-r border-white/5 backdrop-blur-xl fixed inset-y-0 z-50">
                <Link href="/" className="p-8 border-b border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors group">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tighter text-white">Admin</h2>
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest leading-none mt-1">BraidsByTina Suite</p>
                    </div>
                </Link>

                <nav className="flex-grow p-6 space-y-2 mt-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-semibold ${isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 w-full px-5 py-4 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all font-semibold"
                    >
                        <LogOut size={22} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow lg:pl-72 flex flex-col min-h-screen">
                {/* Header - Mobile */}
                <header className="lg:hidden h-20 glass-dark border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-40">
                    <Link href="/" className="text-xl font-bold tracking-tighter text-white hover:text-primary transition-colors">
                        BraidsByTina<span className="text-primary">.</span>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white">
                        <Menu size={28} />
                    </button>
                </header>

                <section className="p-6 md:p-12 lg:p-16 max-w-7xl mx-auto w-full">
                    {children}
                </section>
            </main>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-80 bg-secondary z-[70] lg:hidden flex flex-col border-r border-white/10"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <Link href="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform">
                                        <Sparkles className="w-6 h-6 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-black tracking-tighter text-white">Admin</h2>
                                </Link>
                                <button onClick={() => setIsSidebarOpen(false)} className="text-white hover:text-primary transition-colors">
                                    <X size={28} />
                                </button>
                            </div>
                            <nav className="flex-grow p-6 space-y-4">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center gap-4 px-6 py-5 rounded-3xl transition-all font-bold text-lg ${pathname === item.href
                                            ? "bg-primary text-white shadow-xl shadow-primary/30"
                                            : "text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        <item.icon size={24} />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                            <div className="p-6 border-t border-white/5 mb-8">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-4 w-full px-6 py-5 text-red-500 font-bold text-lg hover:bg-red-500/10 rounded-3xl transition-all"
                                >
                                    <LogOut size={24} />
                                    Logout
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
