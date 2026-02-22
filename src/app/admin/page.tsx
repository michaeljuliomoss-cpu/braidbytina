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
    Sparkles
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
    const services = useQuery(api.services.getServices) || [];
    const photos = useQuery(api.gallery.getGallery) || [];
    const content = useQuery(api.content.getAllContent) || {};

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
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-primary font-bold uppercase tracking-[0.2em] text-sm mb-3"
                >
                    Overview Console
                </motion.p>
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-5xl md:text-6xl font-black text-white tracking-tighter"
                >
                    Welcome Back<span className="text-primary">,</span> Tina
                </motion.h1>
            </header>

            {/* Quick Stats */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <StatCard
                    icon={Scissors}
                    label="Total Styles"
                    value={services.length.toString()}
                    color="bg-primary"
                    trend="+1 this month"
                />
                <StatCard
                    icon={Eye}
                    label="Portfolio"
                    value={photos.length.toString()}
                    color="bg-purple-500"
                    trend="Showcase items"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Avg. Price"
                    value={`$${Math.round(services.reduce((acc, s) => acc + s.price, 0) / (services.length || 1))}`}
                    color="bg-blue-500"
                    trend="Based on styles"
                />
                <StatCard
                    icon={Clock}
                    label="Last Update"
                    value="Today"
                    color="bg-orange-500"
                    trend="2 hours ago"
                />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Services Feed */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 glass-dark rounded-[2.5rem] border border-white/5 p-8"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-white tracking-tight">Recent Styles</h2>
                        <Link href="/admin/services" className="text-primary hover:text-white transition-colors flex items-center gap-2 font-bold group">
                            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {services.slice(0, 4).map((service) => (
                            <div key={service._id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary border border-white/10 shrink-0">
                                        <img src={service.resolvedImageUrl} alt={service.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{service.name}</h3>
                                        <p className="text-sm text-gray-500 font-medium">{service.duration}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-white">${service.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link href="/admin/services" className="mt-8 block w-full bg-white/5 hover:bg-white/10 text-white text-center py-5 rounded-2xl transition-all font-bold border border-white/5">
                        Manage All Services
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
                            <Link href="/admin/services" className="flex items-center gap-4 p-5 bg-primary/10 hover:bg-primary/20 rounded-3xl group transition-all border border-primary/20">
                                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Add New Style</p>
                                    <p className="text-xs text-primary font-bold uppercase tracking-wider">Services</p>
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

function StatCard({ icon: Icon, label, value, color, trend }: any) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
            }}
            className="glass-dark p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group"
        >
            <div className="relative z-10">
                <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-black/20 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon size={28} />
                </div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
                <h3 className="text-4xl font-black text-white tracking-tighter mb-4">{value}</h3>
                <p className="text-xs font-bold text-primary tracking-wide bg-primary/10 px-3 py-1.5 rounded-full inline-block">
                    {trend}
                </p>
            </div>
            <div className={`absolute -right-8 -top-8 w-32 h-32 ${color}/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
        </motion.div>
    );
}
