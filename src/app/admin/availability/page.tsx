"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfDay } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
    Clock,
    Plus,
    X,
    Save,
    Calendar as CalendarIcon,
    Sparkles,
    AlertCircle,
    CheckCircle2
} from "lucide-react";

export default function AvailabilityPage() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [newSlot, setNewSlot] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

    const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

    const customSlots = useQuery((api as any).availability.getAvailability, selectedDate ? { date: dateStr } : "skip");
    const defaultSlots = useQuery((api as any).availability.getDefaultSlots);
    const updateAvailability = useMutation((api as any).availability.updateAvailability);
    const updateDefaultSlots = useMutation((api as any).availability.updateDefaultSlots);

    const [editingSlots, setEditingSlots] = useState<string[] | null>(null);
    const [editingDefaults, setEditingDefaults] = useState(false);

    // Synchronize editing slots when data loads or date changes
    const currentSlots = editingSlots || customSlots || defaultSlots || [];

    const handleAddSlot = () => {
        if (!newSlot) return;
        // Basic validation for time format if needed, but let's keep it flexible
        if (currentSlots.includes(newSlot)) return;
        setEditingSlots([...currentSlots, newSlot].sort((a, b) => {
            // Simple sort: assume HH:MM AM/PM
            return new Date(`2000/01/01 ${a}`).getTime() - new Date(`2000/01/01 ${b}`).getTime();
        }));
        setNewSlot("");
    };

    const handleRemoveSlot = (slot: string) => {
        setEditingSlots(currentSlots.filter((s: string) => s !== slot));
    };

    const handleSave = async () => {
        if (!selectedDate) return;
        setIsSaving(true);
        try {
            if (editingDefaults) {
                await updateDefaultSlots({ slots: currentSlots });
            } else {
                await updateAvailability({ date: dateStr, slots: currentSlots });
            }
            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
            setEditingSlots(null);
        } catch (error) {
            console.error(error);
            setSaveStatus("error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetToDefault = () => {
        setEditingSlots(defaultSlots || []);
    };

    return (
        <div className="space-y-10 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-5xl font-black text-white tracking-tighter"
                    >
                        Availability<span className="text-amber-500">.</span>
                    </motion.h1>
                    <p className="text-gray-500 font-bold mt-2">Manage your working hours and available booking slots.</p>
                </div>

                <button
                    onClick={() => {
                        setEditingDefaults(!editingDefaults);
                        setEditingSlots(null);
                    }}
                    className={`px-6 py-3 rounded-2xl font-black transition-all border flex items-center gap-2 ${editingDefaults
                        ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20"
                        : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                        }`}
                >
                    <Sparkles size={18} />
                    {editingDefaults ? "Editing Defaults" : "Edit Default Slots"}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Calendar (only if not editing defaults) */}
                {!editingDefaults && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-6 glass-dark rounded-[3rem] border border-white/5 p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <CalendarIcon className="text-amber-500" />
                            <h2 className="text-2xl font-black text-white tracking-tight">Select Date</h2>
                        </div>

                        <style>{`
                            .rdp { --rdp-accent-color: #f59e0b; --rdp-background-color: #f59e0b; margin: 0; width: 100%; }
                            .rdp-day_selected { background-color: var(--rdp-accent-color) !important; color: black !important; font-weight: 800; border-radius: 1rem; }
                            .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: rgba(245, 158, 11, 0.1); color: #f59e0b; border-radius: 1rem; }
                            .rdp-head_cell { font-weight: 900; color: #444; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; }
                            .rdp-caption_label { font-weight: 900; font-size: 1.25rem; color: #fff; }
                            .rdp-nav_button { color: #fff; }
                            .rdp-day { color: #aaa; font-weight: 600; }
                        `}</style>
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                                setSelectedDate(date);
                                setEditingSlots(null);
                            }}
                            className="mx-auto"
                        />
                    </motion.div>
                )}

                {/* Right Side: Slot Management */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`${editingDefaults ? "lg:col-span-12" : "lg:col-span-6"} glass-dark rounded-[3rem] border border-white/5 p-8 flex flex-col`}
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Clock className="text-amber-500" />
                            <h2 className="text-2xl font-black text-white tracking-tight">
                                {editingDefaults ? "Default Time Slots" : format(selectedDate || new Date(), "MMMM do")}
                            </h2>
                        </div>
                        {!editingDefaults && (
                            <button
                                onClick={handleResetToDefault}
                                className="text-xs font-black uppercase tracking-widest text-amber-500/50 hover:text-amber-500 transition-colors"
                            >
                                Reset to Default
                            </button>
                        )}
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {currentSlots.map((slot: string) => (
                                <div
                                    key={slot}
                                    className="group relative bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-amber-500/30 transition-all"
                                >
                                    <span className="text-white font-bold">{slot}</span>
                                    <button
                                        onClick={() => handleRemoveSlot(slot)}
                                        className="w-6 h-6 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="09:00 AM"
                                    value={newSlot}
                                    onChange={(e) => setNewSlot(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddSlot()}
                                    className="w-full bg-white/5 border border-dashed border-white/20 rounded-2xl p-4 text-white font-bold placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-all"
                                />
                                <button
                                    onClick={handleAddSlot}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-amber-500 text-black rounded-lg flex items-center justify-center hover:scale-105 transition-transform"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        {currentSlots.length === 0 && (
                            <div className="py-12 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                                <p className="text-gray-500 font-bold italic">No slots defined for this day.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {saveStatus === "success" && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-2 text-green-500 font-bold text-sm"
                                >
                                    <CheckCircle2 size={16} />
                                    Saved!
                                </motion.div>
                            )}
                            {saveStatus === "error" && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-2 text-red-500 font-bold text-sm"
                                >
                                    <AlertCircle size={16} />
                                    Failed to save
                                </motion.div>
                            )}
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving || (editingSlots === null)}
                            className="bg-amber-500 text-black px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                        >
                            <Save size={20} />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
