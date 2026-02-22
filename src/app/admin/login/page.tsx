"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, Sparkles } from "lucide-react";

export default function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const login = useMutation(api.admin.login);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const token = await login({ username, password });
            localStorage.setItem("adminToken", token);
            router.push("/admin");
        } catch (err: any) {
            setError(err.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-6">
            <div className="absolute inset-0 z-0 bg-cover bg-center opacity-20 filter blur-sm" style={{ backgroundImage: "url('/images/knotless_braids_1771781969882.png')" }} />
            <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/80 to-primary/20 z-0" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="glass-dark p-10 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-2xl">
                    <div className="flex flex-col items-center mb-10 text-center">
                        <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mb-6 border border-primary/30">
                            <Sparkles className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Admin Login</h1>
                        <p className="text-gray-400 font-medium">BraidByTina Management Suite</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-500 text-center py-3 rounded-xl text-sm font-bold"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        >
                            {loading ? "Authenticating..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        <Link href="/" className="hover:text-primary transition-colors underline-offset-4 hover:underline font-medium">
                            Back to Website
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// Minimal missing Link import
import Link from "next/link";
