"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Upload,
    X,
    Image as ImageIcon,
    Trash2,
    Sparkles,
    CheckCircle2
} from "lucide-react";

export default function GalleryManager() {
    const photos = useQuery(api.gallery.getGallery);
    const addImage = useMutation(api.gallery.addImage);
    const deleteImage = useMutation(api.gallery.deleteImage);
    const generateUploadUrl = useMutation(api.services.generateUploadUrl);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [caption, setCaption] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile) return;
        setLoading(true);

        try {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": imageFile.type },
                body: imageFile,
            });
            const { storageId } = await result.json();

            await addImage({
                imageId: storageId,
                caption: caption || undefined
            });

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setIsModalOpen(false);
                setImageFile(null);
                setImagePreview(null);
                setCaption("");
            }, 1500);
        } catch (error) {
            console.error(error);
            alert("Error uploading to gallery");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: any) => {
        if (confirm("Remove this photo from your portfolio?")) {
            await deleteImage({ id });
        }
    };

    return (
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-2">Portfolio Gallery</h1>
                    <p className="text-gray-500 font-medium">Showcase your best work to inspire your clients.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary-dark text-white px-8 py-5 rounded-3xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] text-lg"
                >
                    <Plus size={24} /> Add Photo
                </button>
            </header>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {!photos ? (
                    Array(8).fill(0).map((_, i) => (
                        <div key={i} className="aspect-square bg-white/5 rounded-[2rem] animate-pulse border border-white/5" />
                    ))
                ) : photos.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                        <ImageIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-500 italic">No gallery items yet</h2>
                        <p className="text-gray-600 mt-2">Upload your first masterpiece!</p>
                    </div>
                ) : (
                    photos.map((photo) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={photo._id}
                            className="relative aspect-square group rounded-[2rem] overflow-hidden border border-white/5 bg-secondary shadow-2xl"
                        >
                            <img src={photo.url || ""} alt={photo.caption || "Gallery item"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                                <p className="text-white font-bold mb-4 line-clamp-2">{photo.caption || "Tina's Masterpiece"}</p>
                                <button
                                    onClick={() => handleDelete(photo._id)}
                                    className="p-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all shadow-lg scale-90 group-hover:scale-100"
                                >
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative w-full max-w-xl bg-secondary rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden"
                        >
                            <div className="p-10 md:p-12 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <Sparkles className="text-primary w-5 h-5" />
                                            <h2 className="text-3xl font-black text-white tracking-tighter">New Masterpiece</h2>
                                        </div>
                                        <p className="text-gray-500 font-medium">Add a photo to your public portfolio.</p>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all">
                                        <X size={28} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="relative group overflow-hidden rounded-[2.5rem] border-2 border-dashed border-white/10 hover:border-primary/50 bg-white/5 transition-all aspect-square max-h-[300px] mx-auto">
                                        {imagePreview ? (
                                            <div className="relative h-full w-full">
                                                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    <div className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
                                                        <Upload size={20} /> Change
                                                    </div>
                                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                                </label>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center h-full w-full cursor-pointer p-8 text-center group">
                                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                    <Upload className="text-primary w-8 h-8" />
                                                </div>
                                                <p className="font-bold text-white text-lg">Select Portfolio Photo</p>
                                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                            </label>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Caption (Optional)</label>
                                        <input
                                            type="text"
                                            value={caption}
                                            onChange={(e) => setCaption(e.target.value)}
                                            placeholder="e.g. Fresh Knotless Set for Christmas"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all font-medium"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || success || !imageFile}
                                        className={`w-full py-5 rounded-3xl font-black text-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${success
                                                ? "bg-green-500 text-white"
                                                : "bg-primary text-white shadow-xl shadow-primary/20 disabled:opacity-30 disabled:grayscale"
                                            }`}
                                    >
                                        {loading ? (
                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }} className="w-6 h-6 border-4 border-white border-t-transparent rounded-full" />
                                        ) : success ? (
                                            <><CheckCircle2 className="w-6 h-6" /> Uploaded!</>
                                        ) : (
                                            "Add to Portfolio"
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
