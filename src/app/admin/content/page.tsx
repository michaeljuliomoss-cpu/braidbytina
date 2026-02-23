"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
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
    Layout,
    Settings,
    Image as ImageIcon
} from "lucide-react";

export default function ContentManager() {
    const content = useQuery(api.content.getAllContent) as any;
    const updateContent = useMutation(api.content.updateContent);
    const generateUploadUrl = useMutation(api.content.generateUploadUrl);

    const [activeTab, setActiveTab] = useState("general");

    const [heroTitle, setHeroTitle] = useState("");
    const [heroSubtitle, setHeroSubtitle] = useState("");
    const [hours, setHours] = useState("");
    const [depositPolicy, setDepositPolicy] = useState("");
    const [bio, setBio] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [aboutImageUrl, setAboutImageUrl] = useState("");
    const [aboutTitle, setAboutTitle] = useState("");
    const [aboutTagline, setAboutTagline] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const aboutPhotoRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (content) {
            setHeroTitle(content.heroTitle || "");
            setHeroSubtitle(content.heroSubtitle || "");
            setHours(content.hours || "");
            setDepositPolicy(content.depositPolicy || "");
            setBio(content.bio || "");
            setLogoUrl(content.logoUrl || "");
            setAboutImageUrl(content.aboutImageUrl || "");
            setAboutTitle(content.aboutTitle || "");
            setAboutTagline(content.aboutTagline || "");
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
            await updateContent({ key: "logoStorageId", value: storageId });
            alert("Logo uploaded successfully!");
        } catch (error) {
            console.error(error);
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

            await updateContent({ key: "aboutImageStorageId", value: storageId });
            alert("Founder photo uploaded successfully!");
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
                { key: "aboutImageUrl", value: aboutImageUrl },
                { key: "aboutTitle", value: aboutTitle },
                { key: "aboutTagline", value: aboutTagline },
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

    const tabs = [
        { id: "general", label: "General", icon: Settings },
        { id: "home", label: "Home Page", icon: Layout },
        { id: "about", label: "About Page", icon: User },
        { id: "policies", label: "Policies", icon: ShieldAlert },
    ];

    return (
        <div className="space-y-12 pb-20 max-w-5xl">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-2">Content Manager</h1>
                    <p className="text-gray-500 font-medium text-sm md:text-base">Refine your brand's presence across the entire site.</p>
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
                        <><CheckCircle2 size={22} /> Saved Successfully</>
                    ) : (
                        <><Save size={22} /> Push Updates Live</>
                    )}
                </button>
            </header>

            {/* Tab Navigation */}
            <div className="flex flex-nowrap overflow-x-auto scrollbar-hide gap-2 p-2 bg-white/5 rounded-[2rem] border border-white/10 w-full md:w-fit px-4 md:px-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-gray-500 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeTab === "general" && (
                        <motion.div
                            key="general"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-10"
                        >
                            <ContentSection
                                icon={ImageIcon}
                                title="Logo & Site Identity"
                                description="Update your logo and core brand visuals."
                            >
                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                    <div className="w-40 h-40 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden relative group">
                                        {logoUrl ? (
                                            <img src={logoUrl} className="w-full h-full object-contain p-4" />
                                        ) : (
                                            <ImageIcon className="text-white/10 w-12 h-12" />
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        <InputField
                                            label="Current Logo URL"
                                            value={logoUrl}
                                            onChange={setLogoUrl}
                                            placeholder="https://..."
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all border border-white/10"
                                        >
                                            <Upload size={18} className="text-primary" /> Replace Logo Image
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                                    </div>
                                </div>
                            </ContentSection>
                        </motion.div>
                    )}

                    {activeTab === "home" && (
                        <motion.div
                            key="home"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-10"
                        >
                            <ContentSection
                                icon={Sparkles}
                                title="Hero Section Branding"
                                description="The high-impact message at the top of your home page."
                            >
                                <div className="space-y-8">
                                    <InputField
                                        label="Main Headline"
                                        value={heroTitle}
                                        onChange={setHeroTitle}
                                        placeholder="e.g. Premium Braiding Services."
                                    />
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Hero Description</label>
                                        <textarea
                                            value={heroSubtitle}
                                            onChange={(e) => setHeroSubtitle(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all font-medium resize-none text-lg h-32"
                                            placeholder="Describe your services in 1-2 sentences..."
                                        />
                                    </div>
                                </div>
                            </ContentSection>
                        </motion.div>
                    )}

                    {activeTab === "about" && (
                        <motion.div
                            key="about"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-10"
                        >
                            <ContentSection
                                icon={User}
                                title="Founder Profile"
                                description="Customize everything on your About page."
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Founder Photo</label>
                                        <div className="aspect-[4/5] bg-white/5 rounded-[3rem] border border-white/10 overflow-hidden relative group shadow-2xl">
                                            {aboutImageUrl ? (
                                                <img src={aboutImageUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                                                    <ImageIcon size={64} className="mb-4 opacity-5" />
                                                    <p className="font-black text-sm uppercase tracking-widest">No Image Set</p>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                                                <button
                                                    onClick={() => aboutPhotoRef.current?.click()}
                                                    className="bg-white text-black px-8 py-4 rounded-2xl font-black text-sm shadow-2xl transform scale-90 group-hover:scale-100 transition-all active:scale-95"
                                                >
                                                    Update Photo
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <button
                                                onClick={() => aboutPhotoRef.current?.click()}
                                                className="w-full py-5 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl font-black text-sm border-2 border-primary/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Upload size={18} /> Upload Photo
                                            </button>
                                            <input type="file" ref={aboutPhotoRef} onChange={handleAboutImageUpload} className="hidden" accept="image/*" />
                                            <InputField
                                                label="Image Direct URL"
                                                value={aboutImageUrl}
                                                onChange={setAboutImageUrl}
                                                placeholder="Paste URL here..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        <InputField
                                            label="Founder Name / Display Title"
                                            value={aboutTitle}
                                            onChange={setAboutTitle}
                                            placeholder="e.g. Meet Tina"
                                        />
                                        <InputField
                                            label="About Tagline"
                                            value={aboutTagline}
                                            onChange={setAboutTagline}
                                            placeholder="e.g. Master Braider & Hair Artist"
                                        />
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Founder Biography</label>
                                            <textarea
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                className="w-full h-[400px] bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all font-medium resize-none leading-relaxed text-lg"
                                                placeholder="Your professional story..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </ContentSection>
                        </motion.div>
                    )}

                    {activeTab === "policies" && (
                        <motion.div
                            key="policies"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-10"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <ContentSection
                                    icon={Clock}
                                    title="Business Hours"
                                    description="When you're available for bookings."
                                >
                                    <textarea
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value)}
                                        className="w-full h-64 bg-white/5 border border-white/10 rounded-3xl p-6 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all font-medium resize-none leading-relaxed"
                                        placeholder="Mon-Sun: 9:00 AM - 7:00 PM"
                                    />
                                </ContentSection>

                                <ContentSection
                                    icon={ShieldAlert}
                                    title="Deposit & Booking Policy"
                                    description="Safety and protection for your business."
                                >
                                    <textarea
                                        value={depositPolicy}
                                        onChange={(e) => setDepositPolicy(e.target.value)}
                                        className="w-full h-64 bg-white/5 border border-white/10 rounded-3xl p-6 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all font-medium resize-none leading-relaxed"
                                        placeholder="List your deposit requirements..."
                                    />
                                </ContentSection>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function ContentSection({ icon: Icon, title, description, children }: any) {
    return (
        <div className="glass-dark rounded-[3.5rem] border border-white/5 overflow-hidden">
            <div className="p-10 md:p-14 space-y-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
                        <Icon size={32} className="text-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter">{title}</h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-1">{description}</p>
                    </div>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
}

function InputField({ label, value, onChange, placeholder }: any) {
    return (
        <div className="space-y-3">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all font-bold text-xl tracking-tight"
                placeholder={placeholder}
            />
        </div>
    );
}
