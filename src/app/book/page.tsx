"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

export default function BookingPage() {
    // This is where you will paste your Acuity or Calendly embed link
    const bookingUrl = ""; // Placeholder for your link

    return (
        <main className="min-h-screen bg-white pt-32 pb-20">
            {/* Header section */}
            <section className="container mx-auto px-6 mb-16">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest border border-primary/20"
                    >
                        <Calendar size={18} /> Schedule Your Session
                    </motion.div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-secondary leading-none">
                        Secure Your <span className="text-primary italic">Style.</span>
                    </h1>
                    <p className="text-xl text-gray-400 font-bold max-w-2xl mx-auto leading-relaxed">
                        Pick a date and time that works for you. A $25 non-refundable deposit is required to confirm your appointment.
                    </p>
                </div>
            </section>

            {/* Booking Widget Area */}
            <section className="container mx-auto px-6 max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative bg-stone-50 rounded-[3rem] overflow-hidden border border-black/5 shadow-2xl min-h-[700px] flex flex-col items-center justify-center p-8 text-center"
                >
                    {bookingUrl ? (
                        <iframe
                            src={bookingUrl}
                            width="100%"
                            height="800"
                            frameBorder="0"
                            className="w-full h-[800px]"
                        ></iframe>
                    ) : (
                        <div className="max-w-md space-y-8">
                            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                <Clock size={48} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-secondary mb-4">Almost Ready!</h2>
                                <p className="text-gray-500 font-bold leading-relaxed">
                                    We're just finishing the setup of our professional scheduling tool.
                                    In the meantime, you can book directly via WhatsApp.
                                </p>
                            </div>
                            <a
                                href="https://wa.me/12425537275?text=Hello%20Tina!%20I'd%20like%20to%20book%20an%20appointment."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-primary hover:bg-primary-dark text-white px-10 py-5 rounded-full font-black text-xl transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
                            >
                                <Phone size={24} /> Book via WhatsApp
                            </a>
                        </div>
                    )}
                </motion.div>
            </section>

            {/* Preparation/Policies */}
            <section className="container mx-auto px-6 mt-32 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-sm hover:shadow-xl transition-all space-y-6">
                        <div className="w-14 h-14 bg-secondary/5 rounded-2xl flex items-center justify-center text-secondary">
                            <ShieldCheck size={28} />
                        </div>
                        <h3 className="text-2xl font-black text-secondary">Deposit Policy</h3>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            A $25 deposit is required for all bookings. This is non-refundable and goes toward your total service cost.
                        </p>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-sm hover:shadow-xl transition-all space-y-6">
                        <div className="w-14 h-14 bg-secondary/5 rounded-2xl flex items-center justify-center text-secondary">
                            <Clock size={28} />
                        </div>
                        <h3 className="text-2xl font-black text-secondary">Punctuality</h3>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Please arrive on time. After 15 minutes, a $15 late fee applies. After 30 minutes, your appointment may be cancelled.
                        </p>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-sm hover:shadow-xl transition-all space-y-6">
                        <div className="w-14 h-14 bg-secondary/5 rounded-2xl flex items-center justify-center text-secondary">
                            <MapPin size={28} />
                        </div>
                        <h3 className="text-2xl font-black text-secondary">Pre-Appointment</h3>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Please arrive with your hair washed, blown out, and product-free unless your service includes a wash.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
