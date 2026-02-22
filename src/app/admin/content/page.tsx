"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion } from "framer-motion";
import {
    Save,
    FileText,
    Clock,
    ShieldAlert,
    Sparkles,
    Info,
    CheckCircle2,
    Upload,
    User,
    Image as ImageIcon
} from "lucide-react";

export default function ContentManager() {
    const content = useQuery(api.content.getAllContent);
    const updateContent = useMutation(api.content.updateContent);
    const generateUploadUrl = useMutation(api.content.generateUploadUrl);

    const [heroTitle, setHeroTitle] = useState("");
    const [heroSubtitle, setHeroSubtitle] = useState("");
    const [hours, setHours] = useState("");
    const [depositPolicy, setDepositPolicy] = useState("");
    const [bio, setBio] = useState("");
    const [logoUrl, setLogoUrl] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (content) {
            setHeroTitle(content.heroTitle || "");
            setHeroSubtitle(content.heroSubtitle || "");
            setHours(content.hours || "");
            setDepositPolicy(content.depositPolicy || "");
            setBio(content.bio || "");
            setLogoUrl(content.logoUrl || "");
        }
    }, [content]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();

            // In a real app we'd resolve the URL from storageId
            // For now, we'll use a hack to get the public URL or just store the storageId
            // Convex doesn't have a direct "get URL from client" easily without another query
            // but we can save it and let the server handle it
            await updateContent({ key: "logoStorageId", value: storageId });
            alert("Image uploaded! It will be applied after sync.");
        } catch (error) {
            console.error(error);
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updates = [
                { key: "heroTitle", value: heroTitle },
                { key: "heroSubtitle", value: heroSubtitle },
                { key: "hours", value: hours },
                { key: "depositPolicy", value: depositPolicy },
                { key: "bio", value: bio },
                { key: "logoUrl", value: logoUrl },
            ];

            for (const update of updates) {
                await updateContent(update);
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (error) {
            console.error(error);
            alert("Error saving content");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12 pb-20 max-w-5xl">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-2">Site Content</h1>
                    <p className="text-gray-500 font-medium">Customize your brand message and important site info.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading || success}
                    className={`bg-primary hover:bg-primary-dark text-white px-10 py-5 rounded-3xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] ${success ? "bg-green-500 shadow-green-500/20" : ""
                        }`}
                >
                    {loading ? (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                    ) : success ? (
                        <><CheckCircle2 size={22} /> Saved Changes</>
                    ) : (
                        <><Save size={22} /> Sync Website</>
                    )}
                </button>
            </header>

            <div className="grid grid-cols-1 gap-10">
                {/* Branding Section */}
                <ContentSection
                    icon={ImageIcon}
                    title="Logo & Branding"
                    description="Update your logo or primary brand image."
                >
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="w-32 h-32 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden relative group">
                            {logoUrl ? (
                                <img src={logoUrl} className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="text-white/10 w-10 h-10" />
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-4 flex-1">
                            <InputField
                                label="Logo Image URL"
                                value={logoUrl}
                                onChange={setLogoUrl}
                                placeholder="Paste an image URL or upload below"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-primary font-bold flex items-center gap-2 hover:text-white transition-colors"
                            >
                                <Upload size={18} /> Upload New Logo
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                        </div>
                    </div>
                </ContentSection>

                {/* Hero Section Management */}
                <ContentSection
                    icon={Sparkles}
                    title="Hero Landing"
                    description="The first thing your clients see when they visit."
                >
                    <div className="space-y-6">
                        <InputField
                            label="Hero Primary Title"
                            value={heroTitle}
                            onChange={setHeroTitle}
                            placeholder="e.g. Masterful Braids, Premium Quality."
                        />
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Sub-Headline</label>
                            <textarea
                                value={heroSubtitle}
                                onChange={(e) => setHeroSubtitle(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all font-medium resize-none text-lg"
                                rows={3}
                                placeholder="A shorter mission statement..."
                            />
                        </div>
                    </div>
                </ContentSection>

                {/* Bio Section */}
                <ContentSection
                    icon={User}
                    title="About Tina"
                    description="Share your story and passion with your clients."
                >
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full h-48 bg-white/5 border border-white/10 rounded-[2rem] p-6 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all font-medium resize-none leading-relaxed"
                        placeholder="Write your professional bio here..."
                    />
                </ContentSection>

                {/* Policies & Hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <ContentSection
                        icon={Clock}
                        title="Business Hours"
                        description="Display your current availability."
                    >
                        <textarea
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="w-full h-48 bg-white/5 border border-white/10 rounded-[2rem] p-6 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all font-medium resize-none leading-relaxed"
                            placeholder="Mon-Fri: 9am - 6pm..."
                        />
                    </ContentSection>

                    <ContentSection
                        icon={ShieldAlert}
                        title="Deposit Policy"
                        description="Important info about booking security."
                    >
                        <textarea
                            value={depositPolicy}
                            onChange={(e) => setDepositPolicy(e.target.value)}
                            className="w-full h-48 bg-white/5 border border-white/10 rounded-[2rem] p-6 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all font-medium resize-none leading-relaxed"
                            placeholder="Non-refundable deposit required..."
                        />
                    </ContentSection>
                </div>
            </div>
        </div>
    );
}

function ContentSection({ icon: Icon, title, description, children }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-[3rem] border border-white/5 overflow-hidden"
        >
            <div className="p-10 md:p-12 space-y-8">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                        <Icon size={28} className="text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
                        <p className="text-gray-500 font-medium text-sm">{description}</p>
                    </div>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </motion.div>
    );
}

function InputField({ label, value, onChange, placeholder }: any) {
    return (
        <div className="space-y-3">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all font-bold text-xl tracking-tight"
                placeholder={placeholder}
            />
        </div>
    );
}
