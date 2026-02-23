"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ServiceCard from "@/components/ServiceCard";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Sparkles, ArrowRight } from "lucide-react";
import { useRef } from "react";
import Link from "next/link";

export default function Home() {
  const services = useQuery(api.services.getServices) || [];
  const photos = useQuery(api.gallery.getGallery) || [];
  const contentData = useQuery(api.content.getAllContent) as any;

  // Merge dynamic content with defaults to prevent flashing empty text
  const content = {
    heroTitle: contentData?.heroTitle || "Premium Braiding Services.",
    heroSubtitle: contentData?.heroSubtitle || "Elegance in every strand. Specialized in knotless braids and creative styling.",
    logoUrl: contentData?.logoUrl || "/images/briadbytinatranparent.png",
    bio: contentData?.bio || "With years of professional experience, Tina crafts precision braids that don't just look good—they feel good. We prioritize hair health and individual transformation.",
    aboutImageUrl: contentData?.aboutImageUrl || "/images/media__1771778558925.png"
  };

  const ref = useRef(null);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section - Clean White Makeover Style */}
      <section ref={ref} className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-[#fff5f8] pt-32 pb-12 md:pt-40 md:pb-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-[#fff5f8] to-[#fff5f8] z-0" />

        <div className="relative z-20 container mx-auto px-6 text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            {/* Prominent Logo Integration */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-6 md:mb-10 drop-shadow-[0_20px_50px_rgba(242,138,178,0.3)]"
            >
              <img
                src={content.logoUrl}
                alt="BraidsByTina Logo"
                className="w-full max-w-[300px] md:max-w-[500px] h-auto px-4 md:px-0"
              />
            </motion.div>

            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-primary/20 text-primary border-2 border-primary/30 px-6 py-2 rounded-full text-[10px] md:text-sm font-black tracking-widest uppercase mb-6 md:mb-8 flex items-center shadow-sm"
            >
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-2" /> Premiere Protective Styling
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-4xl md:text-9xl font-black tracking-tighter mb-6 md:mb-8 text-secondary leading-[0.85]"
            >
              {content.heroTitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-base md:text-2xl font-bold text-gray-400 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4"
            >
              {content.heroSubtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto px-6 sm:px-0"
            >
              <Link
                href="/book"
                className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-10 py-4 md:px-12 md:py-5 rounded-full font-black text-lg md:text-xl transition-all shadow-2xl shadow-primary/30 flex items-center justify-center group"
              >
                Book Your Style <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/gallery"
                className="w-full sm:w-auto bg-white border-2 border-primary/20 text-primary hover:border-primary px-10 py-4 md:px-12 md:py-5 rounded-full font-black text-lg md:text-xl transition-all flex items-center justify-center"
              >
                Our Work
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 z-20 text-primary/30"
        >
          <ChevronDown className="w-10 h-10" />
        </motion.div>
      </section>

      {/* Featured Services Preview - Light Theme */}
      <section className="py-32 bg-stone-50 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <p className="text-primary font-bold uppercase tracking-widest mb-4">Masterfully Crafted</p>
              <h2 className="text-5xl md:text-7xl font-black tracking-tight text-secondary">
                Our Top <span className="text-primary italic">Requests.</span>
              </h2>
            </div>
            <Link href="/services" className="text-primary font-bold flex items-center group text-lg">
              View Price List <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {services.length > 0 ? services.slice(0, 3).map((service, index) => (
              <ServiceCard key={service._id} {...service} />
            )) : (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-96 rounded-3xl bg-gray-100 animate-pulse" />
              ))
            )}
          </div>
        </div>
      </section>


      {/* About Teaser - Clean Light Layout */}
      <section className="py-32 bg-stone-50 text-secondary relative overflow-hidden">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative group order-2 lg:order-1">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border border-black/5 relative z-10 shadow-2xl">
              <img src={content.aboutImageUrl} alt="Tina" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0" />
          </div>
          <div className="space-y-8 order-1 lg:order-2">
            <p className="text-primary font-black uppercase tracking-[0.2em] text-sm">Meet your stylist</p>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-secondary">
              Confidence, <br /><span className="text-primary italic">Redefined.</span>
            </h2>
            <p className="text-xl text-gray-500 leading-relaxed font-bold">
              {content.bio}
            </p>
            <Link href="/about" className="inline-flex items-center gap-2 text-primary font-black text-2xl border-b-4 border-primary pb-2 hover:gap-4 transition-all">
              Discover Our Story <ArrowRight size={28} />
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Preview - Clean White Layout */}
      <section className="py-32 bg-white overflow-hidden relative">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-8xl font-black text-secondary tracking-tighter mb-12">
            The <span className="text-primary italic">Portfolio.</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-16">
            {photos.length > 0 ? photos.slice(0, 4).map((photo) => (
              <motion.div
                key={photo._id}
                whileHover={{ y: -10 }}
                className="aspect-square rounded-3xl overflow-hidden border border-black/5 shadow-lg group"
              >
                <img src={photo.url || ""} className="w-full h-full object-cover transition-all duration-500" />
              </motion.div>
            )) : (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="aspect-square rounded-3xl bg-gray-100 animate-pulse" />
              ))
            )}
          </div>

          <Link href="/gallery" className="bg-primary hover:bg-primary-dark text-white px-10 py-5 rounded-full font-black text-xl transition-all shadow-xl shadow-primary/30 inline-block">
            View All Work
          </Link>
        </div>
      </section>
    </div>
  );
}
