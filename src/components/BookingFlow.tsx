"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, startOfDay, isBefore, isSameDay } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
    ChevronRight,
    ChevronLeft,
    Calendar as CalendarIcon,
    Clock,
    User,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    ShieldCheck
} from "lucide-react";

type Step = "service" | "datetime" | "details" | "success";

export default function BookingFlow() {
    const services = useQuery(api.services.getServices) || [];
    const createAppointment = useMutation(api.appointments.createAppointment);
    const blockedDates = useQuery(api.appointments.getBlockedDates) || [];

    const [currentStep, setCurrentStep] = useState<Step>("service");
    const [selectedService, setSelectedService] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const [customerInfo, setCustomerInfo] = useState({
        name: "",
        email: "",
        phone: "",
        notes: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hardcoded time slots for now - typically braiders have set start times
    const timeSlots = ["09:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM"];

    // Fetch appointments for the selected date to hide taken slots
    const dayAppointments = useQuery(
        api.appointments.getAppointmentsByDate,
        selectedDate ? { date: format(selectedDate, "yyyy-MM-dd") } : "skip"
    );

    const takenSlots = dayAppointments?.map(app => app.timeSlot) || [];
    const availableSlots = timeSlots.filter(slot => {
        // First check if slot is already booked
        if (takenSlots.includes(slot)) return false;

        // Then check if it's today and the time has already passed
        if (selectedDate && isSameDay(selectedDate, new Date())) {
            const [time, ampm] = slot.split(" ");
            let [hours, minutes] = time.split(":").map(Number);
            if (ampm === "PM" && hours !== 12) hours += 12;
            if (ampm === "AM" && hours === 12) hours = 0;

            const slotTime = new Date();
            slotTime.setHours(hours, minutes, 0, 0);

            return slotTime > new Date();
        }

        return true;
    });

    const handleServiceSelect = (service: any) => {
        setSelectedService(service);
        setCurrentStep("datetime");
    };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        setSelectedTime(null);
    };

    const handleBooking = async () => {
        if (!selectedService || !selectedDate || !selectedTime) return;

        setIsSubmitting(true);
        try {
            await createAppointment({
                customerName: customerInfo.name,
                customerEmail: customerInfo.email,
                customerPhone: customerInfo.phone,
                serviceId: selectedService._id,
                serviceName: selectedService.name,
                date: format(selectedDate, "yyyy-MM-dd"),
                timeSlot: selectedTime,
                totalPrice: selectedService.price,
                notes: customerInfo.notes
            });
            setCurrentStep("success");
        } catch (error) {
            console.error(error);
            alert("Booking failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Disabled dates logic
    const disabledDays = [
        ...blockedDates.map(d => new Date(d.date)),
        { before: startOfDay(new Date()) } // Can't book in past
    ];

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Progress Bar */}
            <div className="flex justify-between mb-12 px-2 max-w-md mx-auto">
                {(["service", "datetime", "details"] as Step[]).map((step, idx) => {
                    const isActive = currentStep === step || (currentStep === "success" && step === "details");
                    const index = ["service", "datetime", "details"].indexOf(currentStep);
                    const isCompleted = ["service", "datetime", "details"].indexOf(step) < index;

                    return (
                        <div key={step} className="flex flex-col items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${isActive ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30" :
                                isCompleted ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
                                }`}>
                                {isCompleted ? <CheckCircle2 size={18} /> : idx + 1}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? "text-primary" : "text-gray-400"}`}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {currentStep === "service" && (
                    <motion.div
                        key="service"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="text-4xl font-black text-secondary tracking-tighter">Choose Your Style</h2>
                            <p className="text-gray-400 font-bold">Select the service you'd like to book with Tina.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service) => (
                                <button
                                    key={service._id}
                                    onClick={() => handleServiceSelect(service)}
                                    className="group relative bg-stone-50 hover:bg-white p-6 rounded-[2.5rem] border border-black/5 hover:border-primary/30 text-left transition-all hover:shadow-2xl hover:-translate-y-1"
                                >
                                    <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-200">
                                        <img src={service.resolvedImageUrl} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <h3 className="text-xl font-black text-secondary leading-tight mb-1">{service.name}</h3>
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-400 mb-4">
                                        <span className="text-primary">${service.price}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span>{service.duration}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black uppercase tracking-widest text-primary/50 opacity-0 group-hover:opacity-100 transition-opacity">Select Service</span>
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {currentStep === "datetime" && (
                    <motion.div
                        key="datetime"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <button onClick={() => setCurrentStep("service")} className="p-3 bg-gray-100 rounded-2xl text-gray-400 hover:text-secondary transition-colors">
                                <ChevronLeft size={24} />
                            </button>
                            <div>
                                <h2 className="text-3xl font-black text-secondary tracking-tighter">Day & Time</h2>
                                <p className="text-gray-400 font-bold text-sm">When should we get started?</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            <div className="lg:col-span-7 bg-stone-50 p-8 rounded-[3rem] border border-black/5 shadow-inner">
                                <style>{`
                                    .rdp { --rdp-accent-color: #f28ab2; --rdp-background-color: #f28ab2; margin: 0; }
                                    .rdp-day_selected { background-color: var(--rdp-accent-color) !important; color: white !important; font-weight: 800; border-radius: 1rem; }
                                    .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: rgba(242, 138, 178, 0.1); color: #f28ab2; border-radius: 1rem; }
                                    .rdp-head_cell { font-weight: 900; color: #aaa; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; }
                                    .rdp-caption_label { font-weight: 900; font-size: 1.25rem; color: #1a1a1a; }
                                `}</style>
                                <DayPicker
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDateSelect}
                                    disabled={disabledDays}
                                    className="mx-auto"
                                />
                            </div>

                            <div className="lg:col-span-5 space-y-6">
                                <div className="bg-white/50 p-6 rounded-3xl border border-black/5">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-secondary mb-4 flex items-center gap-2">
                                        <Clock size={16} className="text-primary" /> Available Slots
                                    </h4>
                                    {!selectedDate ? (
                                        <p className="text-gray-400 font-bold italic py-8 text-center text-sm">Please select a date first</p>
                                    ) : availableSlots.length === 0 ? (
                                        <p className="text-red-400 font-bold italic py-8 text-center text-sm">This day is fully booked!</p>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            {availableSlots.map((time) => (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`py-4 rounded-2xl font-black transition-all ${selectedTime === time
                                                        ? "bg-secondary text-white shadow-xl scale-105"
                                                        : "bg-white border border-black/5 text-secondary hover:border-primary/30"
                                                        }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {selectedTime && (
                                    <button
                                        onClick={() => setCurrentStep("details")}
                                        className="w-full bg-primary text-white py-5 rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 group"
                                    >
                                        Next Step <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {currentStep === "details" && (
                    <motion.div
                        key="details"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-2xl mx-auto space-y-8"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <button onClick={() => setCurrentStep("datetime")} className="p-3 bg-gray-100 rounded-2xl text-gray-400 hover:text-secondary transition-colors">
                                <ChevronLeft size={24} />
                            </button>
                            <div>
                                <h2 className="text-3xl font-black text-secondary tracking-tighter">Your Details</h2>
                                <p className="text-gray-400 font-bold text-sm">Almost there! We just need a few things.</p>
                            </div>
                        </div>

                        <div className="bg-stone-50 p-10 rounded-[3rem] border border-black/5 shadow-2xl space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={customerInfo.name}
                                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                        className="w-full bg-white border border-black/5 rounded-2xl px-6 py-4 text-secondary font-bold focus:outline-none focus:border-primary transition-all"
                                        placeholder="Jestinna Tina"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        value={customerInfo.phone}
                                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                        className="w-full bg-white border border-black/5 rounded-2xl px-6 py-4 text-secondary font-bold focus:outline-none focus:border-primary transition-all"
                                        placeholder="1242xxxxxxx"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={customerInfo.email}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                    className="w-full bg-white border border-black/5 rounded-2xl px-6 py-4 text-secondary font-bold focus:outline-none focus:border-primary transition-all"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Special Notes (Optional)</label>
                                <textarea
                                    value={customerInfo.notes}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                                    className="w-full bg-white border border-black/5 rounded-2xl px-6 py-4 text-secondary font-bold focus:outline-none focus:border-primary transition-all h-32 resize-none"
                                    placeholder="Any specific requests or hair concerns..."
                                />
                            </div>

                            <div className="pt-4 border-t border-black/5">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total to Pay</p>
                                        <p className="text-3xl font-black text-secondary">${selectedService?.price}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Booking For</p>
                                        <p className="text-sm font-black text-primary">{selectedDate ? format(selectedDate, "MMM do") : ""} @ {selectedTime}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleBooking}
                                    disabled={!customerInfo.name || !customerInfo.email || !customerInfo.phone || isSubmitting}
                                    className="w-full bg-secondary text-white py-5 rounded-[2rem] font-black text-xl shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? "Processing..." : "Confirm Booking"}
                                </button>
                                <p className="text-[10px] text-center text-gray-400 font-bold mt-4 max-w-xs mx-auto">
                                    By clicking confirm, you agree to our policies and understand a deposit may be required.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {currentStep === "success" && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-xl mx-auto text-center space-y-8 py-12"
                    >
                        <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30">
                            <CheckCircle2 size={48} />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black text-secondary tracking-tighter">Appointment Requested!</h2>
                            <p className="text-gray-500 font-bold text-lg leading-relaxed">
                                Thank you, {customerInfo.name.split(" ")[0]}! Your request for <span className="text-primary">{selectedService?.name}</span> has been received. Tina will review and confirm your slot shortly.
                            </p>
                        </div>
                        <div className="bg-stone-50 p-8 rounded-[3rem] border border-black/5 space-y-4">
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-gray-400">Date</span>
                                <span className="text-secondary">{selectedDate ? format(selectedDate, "EEEE, MMMM do") : ""}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-gray-400">Time</span>
                                <span className="text-secondary">{selectedTime}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-gray-400">Location</span>
                                <span className="text-secondary">Home-based (Address via WhatsApp)</span>
                            </div>
                        </div>
                        <button
                            onClick={() => window.location.href = "/"}
                            className="bg-primary text-white px-10 py-5 rounded-full font-black text-xl shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                        >
                            Return Home
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

