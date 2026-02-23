"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar as CalendarIcon,
    User,
    Clock,
    Phone,
    Mail,
    MessageCircle,
    CheckCircle2,
    XCircle,
    MoreHorizontal,
    Search,
    ChevronRight,
    Filter
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";

export default function AppointmentManager() {
    const appointments = useQuery(api.appointments.getAllAppointments) || [];
    const updateStatus = useMutation(api.appointments.updateAppointmentStatus);

    const [filter, setFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAppId, setSelectedAppId] = useState<Id<"appointments"> | null>(null);

    const filteredAppointments = appointments
        .filter(app => {
            const matchesFilter = filter === "all" || app.status === filter;
            const matchesSearch =
                app.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleStatusUpdate = async (id: Id<"appointments">, status: string) => {
        try {
            await updateStatus({ id, status });
        } catch (error) {
            console.error(error);
            alert("Failed to update status");
        }
    };

    const stats = {
        total: appointments.length,
        pending: appointments.filter(a => a.status === "pending").length,
        confirmed: appointments.filter(a => a.status === "confirmed").length,
        completed: appointments.filter(a => a.status === "completed").length,
    };

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <p className="text-primary font-black uppercase tracking-widest text-[10px] md:text-xs">Management</p>
                    <h1 className="text-2xl md:text-6xl font-black text-white tracking-tighter">
                        Bookings<span className="text-primary">.</span>
                    </h1>
                </div>

                <div className="flex bg-white/5 p-1 rounded-xl md:rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide">
                    {["all", "pending", "confirmed", "completed", "cancelled"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 md:px-4 py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? "bg-primary text-white shadow-lg" : "text-gray-500 hover:text-white"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[
                    { label: "Total Bookings", value: stats.total, color: "text-white" },
                    { label: "Pending Review", value: stats.pending, color: "text-primary" },
                    { label: "Confirmed", value: stats.confirmed, color: "text-green-500" },
                    { label: "Completed", value: stats.completed, color: "text-purple-500" },
                ].map((stat, i) => (
                    <div key={i} className="glass-dark border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] text-center">
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
                        <p className={`text-2xl md:text-3xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* List View */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or service..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-white font-bold focus:outline-none focus:border-primary/50"
                        />
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredAppointments.map((app) => (
                                <motion.div
                                    key={app._id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => setSelectedAppId(app._id)}
                                    className={`p-3 md:p-6 rounded-3xl border transition-all cursor-pointer group ${selectedAppId === app._id
                                        ? "bg-primary/10 border-primary/30"
                                        : "bg-white/5 border-white/5 hover:border-white/10"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 md:gap-6">
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-secondary flex items-center justify-center border border-white/10 shrink-0">
                                                <User className="w-6 h-6 md:w-8 md:h-8 text-white/20" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg md:text-xl font-black text-white mb-0.5 md:mb-1 leading-tight">{app.customerName}</h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] md:text-sm font-bold text-gray-500">
                                                    <span className="flex items-center gap-1.5"><CalendarIcon size={12} className="text-primary" /> {format(new Date(app.date), "MMM do")}</span>
                                                    <span className="flex items-center gap-1.5"><Clock size={12} className="text-primary" /> {app.timeSlot}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 md:gap-6">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs md:text-sm font-black text-gray-400 mb-1">{app.serviceName}</p>
                                                <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block ${app.status === "confirmed" ? "bg-green-500/10 text-green-500" :
                                                    app.status === "pending" ? "bg-primary/20 text-primary" : "bg-gray-800 text-gray-400"
                                                    }`}>
                                                    {app.status}
                                                </div>
                                            </div>
                                            <ChevronRight className={`text-gray-700 group-hover:text-primary transition-all ${selectedAppId === app._id ? "rotate-90 text-primary" : ""}`} />
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {selectedAppId === app._id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-8 mt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                                    <div className="space-y-4 md:space-y-6">
                                                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 md:gap-4">
                                                            <a href={`tel:${app.customerPhone}`} className="flex items-center gap-3 p-3 md:p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group/link">
                                                                <Phone size={16} className="text-primary" />
                                                                <div className="overflow-hidden">
                                                                    <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Phone</p>
                                                                    <p className="text-white text-xs md:text-base font-bold truncate group-hover/link:text-primary">{app.customerPhone}</p>
                                                                </div>
                                                            </a>
                                                            <a href={`mailto:${app.customerEmail}`} className="flex items-center gap-3 p-3 md:p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group/link">
                                                                <Mail size={16} className="text-primary" />
                                                                <div className="overflow-hidden">
                                                                    <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Email</p>
                                                                    <p className="text-white text-xs md:text-base font-bold truncate group-hover/link:text-primary">{app.customerEmail}</p>
                                                                </div>
                                                            </a>
                                                        </div>
                                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Notes from Customer</p>
                                                            <p className="text-white font-medium text-xs md:text-sm leading-relaxed italic line-clamp-4">"{app.notes || "No special requests"}"</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4 md:space-y-6">
                                                        <div className="flex flex-col xs:flex-row gap-3">
                                                            {app.status === "pending" && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleStatusUpdate(app._id, "confirmed"); }}
                                                                    className="flex-1 bg-green-500 text-white font-black py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-all text-sm"
                                                                >
                                                                    <CheckCircle2 size={16} /> Confirm
                                                                </button>
                                                            )}
                                                            {app.status === "confirmed" && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleStatusUpdate(app._id, "completed"); }}
                                                                    className="flex-1 bg-purple-600 text-white font-black py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-all text-sm"
                                                                >
                                                                    <CheckCircle2 size={16} /> Complete
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(app._id, "cancelled"); }}
                                                                className="flex-1 bg-red-500/10 text-red-500 font-black py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all text-sm"
                                                            >
                                                                <XCircle size={16} /> Cancel
                                                            </button>
                                                        </div>
                                                        <a
                                                            href={`https://wa.me/${app.customerPhone.replace(/[^0-9]/g, '')}?text=Hi ${app.customerName.split(' ')[0]}, this is Tina from Braids by Tina regarding your ${app.serviceName} appointment on ${format(new Date(app.date), "MMM do")}.`}
                                                            target="_blank"
                                                            className="w-full bg-[#25D366] text-white font-black py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-all text-sm"
                                                        >
                                                            <MessageCircle size={18} /> Open WhatsApp
                                                        </a>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredAppointments.length === 0 && (
                            <div className="py-40 text-center space-y-4">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Filter className="text-gray-700" size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-white">No matches found</h3>
                                <p className="text-gray-500 font-bold">Try adjusting your filters or search query.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Availability Management */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-dark border border-white/5 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem]">
                        <h2 className="text-lg md:text-2xl font-black text-white tracking-tight mb-6">Calendar Summary</h2>
                        <div className="space-y-3 md:space-y-4">
                            {/* Simple grouped view */}
                            {Array.from({ length: 5 }).map((_, i) => {
                                const date = addDays(new Date(), i);
                                const dayAppointments = appointments?.filter(app =>
                                    format(new Date(app.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                                ) || [];

                                return (
                                    <div key={i} className="flex items-center justify-between p-3 md:p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div>
                                            <p className="text-white font-bold text-sm">{format(date, 'EEE, MMM d')}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                                {dayAppointments.length} Bookings
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${dayAppointments.length > 5 ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500"
                                            }`}>
                                            {dayAppointments.length > 5 ? "Busy" : "Available"}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-8 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white mb-2">Block Out Dates</h3>
                            <p className="text-sm text-gray-400 font-medium mb-6">
                                Need a day off? Block specific dates here to prevent new bookings.
                            </p>
                            <button className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-primary hover:text-white transition-all">
                                Manage Availability
                            </button>
                        </div>
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper to avoid issues with addDays in codeblock
function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
