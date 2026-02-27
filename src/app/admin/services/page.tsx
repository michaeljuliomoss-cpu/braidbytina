"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Upload,
    X,
    Clock,
    DollarSign,
    CheckCircle2,
    AlertCircle
} from "lucide-react";

export default function ServicesManager() {
    const services = useQuery(api.services.getServices);
    const addService = useMutation(api.services.addService);
    const updateService = useMutation(api.services.updateService);
    const deleteService = useMutation(api.services.deleteService);
    const generateUploadUrl = useMutation(api.services.generateUploadUrl);

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [duration, setDuration] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const filteredServices = services?.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const resetForm = () => {
        setName("");
        setPrice("");
        setDuration("");
        setDescription("");
        setImageFile(null);
        setImagePreview(null);
        setEditingId(null);
        setLoading(false);
    };

    const handleEdit = (service: any) => {
        setEditingId(service._id);
        setName(service.name);
        setPrice(service.price.toString());
        setDuration(service.duration);
        setDescription(service.description);
        setImagePreview(service.resolvedImageUrl);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageId = undefined;

            // Handle Image Upload if new file selected
            if (imageFile) {
                const postUrl = await generateUploadUrl();
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": imageFile.type },
                    body: imageFile,
                });
                const { storageId } = await result.json();
                imageId = storageId;
            }

            const serviceData = {
                name,
                price: Number(price),
                duration,
                description,
                ...(imageId && { imageId }),
            };

            if (editingId) {
                await updateService({ id: editingId as any, ...serviceData });
            } else {
                await addService(serviceData as any);
            }

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setIsModalOpen(false);
                resetForm();
            }, 1500);
        } catch (error) {
            console.error(error);
            alert("Error saving service");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: any) => {
        if (confirm("Are you sure you want to delete this service?")) {
            await deleteService({ id });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-10 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-2">Service Manager</h1>
                    <p className="text-gray-500 font-medium">Add, update, or remove your braiding styles.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-primary hover:bg-primary-dark text-white px-8 py-5 rounded-3xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 active:scale-[0.98] md:w-auto w-full text-lg"
                >
                    <Plus size={24} /> New Style
                </button>
            </header>

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={24} />
                <input
                    type="text"
                    placeholder="Search for a style..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-3xl py-6 pl-16 pr-8 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium text-lg focus:bg-white/10"
                />
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {!services ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-[450px] bg-white/5 rounded-[2.5rem] animate-pulse border border-white/5" />
                    ))
                ) : filteredServices?.map((service) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={service._id}
                        className="group glass-dark rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-primary/30 transition-all shadow-2xl"
                    >
                        <div className="relative h-64">
                            <img
                                src={service.resolvedImageUrl}
                                alt={service.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute top-6 right-6 flex gap-2">
                                <button
                                    onClick={() => handleEdit(service)}
                                    className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-primary transition-all shadow-lg"
                                >
                                    <Edit2 size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(service._id)}
                                    className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-red-500 transition-all shadow-lg"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                            <div className="absolute bottom-6 left-6">
                                <div className="bg-black/40 backdrop-blur-lg border border-white/20 px-4 py-2 rounded-xl">
                                    <p className="text-white font-black text-xl tracking-tight">${service.price}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-4">
                            <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors tracking-tight">{service.name}</h3>
                            <div className="flex items-center gap-2 text-primary font-bold bg-primary/10 w-fit px-4 py-1.5 rounded-full text-sm">
                                <Clock size={16} /> {service.duration}
                            </div>
                            <p className="text-gray-400 text-sm font-medium line-clamp-2 leading-relaxed h-10">
                                {service.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal Tooltip-ish Info */}
            {filteredServices?.length === 0 && searchTerm && (
                <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                    <AlertCircle className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-500 italic">No styles found matching "{searchTerm}"</h2>
                    <button onClick={() => setSearchTerm("")} className="mt-4 text-primary font-bold hover:underline">Clear search</button>
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative w-full max-w-2xl bg-secondary rounded-[3rem] border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="p-10 md:p-12 space-y-8 overflow-y-auto scrollbar-hide">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tighter">
                                            {editingId ? "Update Style" : "New Braiding Style"}
                                        </h2>
                                        <p className="text-gray-500 font-medium">Fill in the details for your clients.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all"
                                    >
                                        <X size={28} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Image Upload Area */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Style Presentation</label>
                                        <div className="relative group overflow-hidden rounded-[2.5rem] border-2 border-dashed border-white/10 hover:border-primary/50 bg-white/5 transition-all h-60">
                                            {imagePreview ? (
                                                <div className="relative h-full w-full">
                                                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <label className="cursor-pointer bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
                                                            <Upload size={20} /> Change Image
                                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                                        </label>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center justify-center h-full w-full cursor-pointer p-8 text-center group">
                                                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                        <Upload className="text-primary w-8 h-8" />
                                                    </div>
                                                    <p className="font-bold text-white text-lg">Click to upload photo</p>
                                                    <p className="text-gray-500 text-sm mt-1">Recommended: 4:5 or 1:1 Aspect Ratio</p>
                                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Style Name" value={name} onChange={setName} placeholder="e.g. Medium Bohemian Knotless" />
                                        <InputField label="Starting Price ($)" value={price} onChange={setPrice} placeholder="180" type="number" />
                                        <InputField label="Duration" value={duration} onChange={setDuration} placeholder="e.g. 4-6 Hours" />
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all font-medium resize-none"
                                                rows={3}
                                                placeholder="Explain the style, size, or what's included..."
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || success}
                                        className={`w-full py-5 rounded-[2rem] font-black text-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${success
                                            ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                                            : "bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary-dark"
                                            }`}
                                    >
                                        {loading ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                                                className="w-6 h-6 border-4 border-white border-t-transparent rounded-full"
                                            />
                                        ) : success ? (
                                            <><CheckCircle2 className="w-6 h-6" /> Success!</>
                                        ) : (
                                            editingId ? "Update Style Data" : "Publish to Website"
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function InputField({ label, value, onChange, placeholder, type = "text" }: any) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all font-medium"
                placeholder={placeholder}
                required
            />
        </div>
    );
}
