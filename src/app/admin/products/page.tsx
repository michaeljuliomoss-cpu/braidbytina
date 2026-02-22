"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Search,
    Trash2,
    Edit2,
    ShoppingBag,
    CheckCircle2,
    XCircle,
    Package,
    DollarSign,
    Image as ImageIcon
} from "lucide-react";

export default function ProductManager() {
    const products = useQuery(api.products.getProducts) || [];
    const addProduct = useMutation(api.products.addProduct);
    const updateProduct = useMutation(api.products.updateProduct);
    const deleteProduct = useMutation(api.products.deleteProduct);

    const [isAdding, setIsAdding] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [inStock, setInStock] = useState(true);

    const resetForm = () => {
        setName("");
        setPrice("");
        setDescription("");
        setImageUrl("");
        setInStock(true);
        setIsAdding(false);
        setEditingProduct(null);
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setName(product.name);
        setPrice(product.price.toString());
        setDescription(product.description);
        setImageUrl(product.imageUrl || "");
        setInStock(product.inStock);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const productData = {
            name,
            price: parseFloat(price),
            description,
            imageUrl: imageUrl || undefined,
            inStock
        };

        if (editingProduct) {
            await updateProduct({ id: editingProduct._id, ...productData });
        } else {
            await addProduct(productData);
        }
        resetForm();
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-2">Product Store</h1>
                    <p className="text-gray-500 font-medium">Manage hair care products, extensions, and accessories.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
                >
                    <Plus size={22} /> Add Product
                </button>
            </header>

            {/* Search & Stats */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="relative flex-grow">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-primary transition-all font-bold"
                    />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-4 flex items-center gap-4">
                    <Package className="text-primary" size={24} />
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none">Total Units</p>
                        <p className="text-xl font-black text-white">{products.length}</p>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                    <motion.div
                        layout
                        key={product._id}
                        className="glass-dark border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6"
                    >
                        <div className="flex justify-between items-start">
                            <div className="w-20 h-20 bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                                <img
                                    src={product.imageUrl || "/images/briadbytinatranparent.png"}
                                    className="w-full h-full object-cover"
                                    alt={product.name}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => deleteProduct({ id: product._id })}
                                    className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-2xl font-black text-white tracking-tight">{product.name}</h3>
                                {product.inStock ? (
                                    <CheckCircle2 size={16} className="text-green-500" />
                                ) : (
                                    <XCircle size={16} className="text-red-500" />
                                )}
                            </div>
                            <p className="text-gray-500 font-medium text-sm line-clamp-2">{product.description}</p>
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                            <span className="text-2xl font-black text-primary">${product.price}</span>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${product.inStock ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                }`}>
                                {product.inStock ? "In Stock" : "Sold Out"}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {(isAdding || editingProduct) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={resetForm}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-xl bg-secondary border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-black text-white tracking-tighter">
                                        {editingProduct ? "Edit Product" : "New Product"}
                                    </h2>
                                    <button type="button" onClick={resetForm} className="text-gray-500 hover:text-white transition-colors">
                                        <XCircle size={32} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Product Details</label>
                                        <div className="relative">
                                            <ShoppingBag className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={20} />
                                            <input
                                                required
                                                placeholder="Product Name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:border-primary transition-all font-bold text-lg"
                                            />
                                        </div>
                                        <div className="relative">
                                            <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={20} />
                                            <input
                                                required
                                                type="number"
                                                placeholder="Price (USD)"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:border-primary transition-all font-bold text-lg"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
                                        <textarea
                                            required
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all font-medium resize-none leading-relaxed"
                                            rows={3}
                                            placeholder="Tell clients why they'll love this..."
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Appearance</label>
                                        <div className="relative">
                                            <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={20} />
                                            <input
                                                placeholder="Image URL (empty = default logo)"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:border-primary transition-all font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <div>
                                            <p className="text-white font-bold">In Stock</p>
                                            <p className="text-xs text-gray-500">Show as available for purchase</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setInStock(!inStock)}
                                            className={`w-14 h-8 rounded-full transition-all relative ${inStock ? "bg-primary" : "bg-gray-700"}`}
                                        >
                                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${inStock ? "left-7" : "left-1"}`} />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary-dark text-white py-6 rounded-3xl font-black text-xl transition-all shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {editingProduct ? "Save Changes" : "Create Product"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
