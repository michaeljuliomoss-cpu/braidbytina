"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import {
    Scissors,
    FileText,
    Eye,
    TrendingUp,
    Plus,
    ArrowRight,
    MessageCircle,
    Clock,
    Sparkles,
    Calendar as CalendarIcon,
    User
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function AdminDashboard() {
    const services = useQuery(api.services.getServices) || [];
    const photos = useQuery(api.gallery.getGallery) || [];
    const content = useQuery(api.content.getAllContent) || {};
    const appointments = useQuery(api.appointments.getAllAppointments) || [];

    const upcomingAppointments = appointments
        .filter(app => app.status === "pending" || app.status === "confirmed")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="space-y-12">
            <header>
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-5xl md:text-6xl font-black text-white tracking-tighter"
                >
                    Welcome Back<span className="text-primary">,</span> Jestinna
                </motion.h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Appointments Feed */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 glass-dark rounded-[2.5rem] border border-white/5 p-8"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-white tracking-tight">Upcoming Appointments</h2>
                        <Link href="/admin/appointments" className="text-primary hover:text-white transition-colors flex items-center gap-2 font-bold group">
                            Full Calendar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {upcomingAppointments.length === 0 ? (
                            <div className="py-20 text-center space-y-4">
                                <CalendarIcon className="w-12 h-12 text-gray-700 mx-auto" />
                                <p className="text-gray-500 font-bold">No upcoming appointments found.</p>
                            </div>
                        ) : (
                            upcomingAppointments.map((app) => (
                                <div key={app._id} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center border border-white/10 shrink-0">
                                            <User className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{app.customerName}</h3>
                                            <p className="text-sm text-gray-500 font-medium">{app.serviceName} • {format(new Date(app.date), "MMM do")} @ {app.timeSlot}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-1 inline-block ${app.status === "confirmed" ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                                            }`}>
                                            {app.status}
                                        </div>
                                        <p className="text-xl font-black text-white">${app.totalPrice}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <Link href="/admin/appointments" className="mt-8 block w-full bg-white/5 hover:bg-white/10 text-white text-center py-5 rounded-2xl transition-all font-bold border border-white/5">
                        Manage All Bookings
                    </Link>
                </motion.div>

                {/* Quick Actions & Content Info */}
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-dark rounded-[2.5rem] border border-white/5 p-8"
                    >
                        <h2 className="text-2xl font-black text-white tracking-tight mb-6">Quick Actions</h2>
                        <div className="space-y-4">
                            <Link href="/admin/appointments" className="flex items-center gap-4 p-5 bg-primary/10 hover:bg-primary/20 rounded-3xl group transition-all border border-primary/20">
                                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                    <CalendarIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Manage Bookings</p>
                                    <p className="text-xs text-primary font-bold uppercase tracking-wider">Appointments</p>
                                </div>
                            </Link>

                            <Link href="/admin/services" className="flex items-center gap-4 p-5 bg-white/5 hover:bg-white/10 rounded-3xl group transition-all border border-white/5">
                                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-white border border-white/10">
                                    <Scissors className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Update Style List</p>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Services</p>
                                </div>
                            </Link>

                            <Link href="/admin/gallery" className="flex items-center gap-4 p-5 bg-white/5 hover:bg-white/10 rounded-3xl group transition-all border border-white/5">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500 border border-purple-500/10">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Add Portfolio Photo</p>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Gallery</p>
                                </div>
                            </Link>

                            <Link href="/admin/content" className="flex items-center gap-4 p-5 bg-white/5 hover:bg-white/10 rounded-3xl group transition-all border border-white/5">
                                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-white border border-white/10">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Update Policies</p>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Site Content</p>
                                </div>
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-primary/20 to-black rounded-[2.5rem] border border-primary/20 p-8 relative overflow-hidden group"
                    >
                        <div className="relative z-10">
                            <MessageCircle className="w-10 h-10 text-primary mb-4" />
                            <h3 className="text-xl font-black text-white mb-2 tracking-tight">Need help?</h3>
                            <p className="text-sm text-gray-400 font-medium mb-6 leading-relaxed">
                                Contact the development team for any technical issues or feature requests.
                            </p>
                            <button className="text-primary font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                Get Support <ArrowRight size={16} />
                            </button>
                        </div>
                        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

