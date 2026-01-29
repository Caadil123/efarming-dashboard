"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Globe, Plus, Trash2, GripVertical, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface ContentSection {
    subtitle: string;
    content: string;
}

export default function PostEditPage() {
    const { showToast } = useToast();
    const router = useRouter();
    const params = useParams();
    const isNew = params.id === "new";

    const [formData, setFormData] = React.useState({
        title: "",
        slug: "",
        excerpt: "", // Short Description for Website Card
        featuredImage: "",
        status: "DRAFT",
        contentSections: [] as ContentSection[]
    });

    const [loading, setLoading] = React.useState(!isNew);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        if (!isNew) {
            fetchPost();
        } else {
            // Default first section for new posts
            setFormData(prev => ({
                ...prev,
                contentSections: [{ subtitle: "Introduction", content: "" }]
            }));
        }
    }, [isNew]);

    const fetchPost = async () => {
        try {
            const res = await fetch(`/api/posts/${params.id}`);
            const data = await res.json();

            // Ensure contentSections is an array
            const sections = Array.isArray(data.contentSections) ? data.contentSections : [];

            setFormData({
                title: data.title || "",
                slug: data.slug || "",
                excerpt: data.excerpt || "",
                featuredImage: data.featuredImage || "",
                status: data.status || "DRAFT",
                contentSections: sections.length > 0 ? sections : [{ subtitle: "", content: "" }]
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: slugify(title)
        }));
    };

    const addSection = () => {
        setFormData(prev => ({
            ...prev,
            contentSections: [...prev.contentSections, { subtitle: "", content: "" }]
        }));
    };

    const removeSection = (index: number) => {
        if (formData.contentSections.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            contentSections: prev.contentSections.filter((_, i) => i !== index)
        }));
    };

    const updateSection = (index: number, field: keyof ContentSection, value: string) => {
        const newSections = [...formData.contentSections];
        newSections[index][field] = value;
        setFormData(prev => ({ ...prev, contentSections: newSections }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: uploadFormData,
            });
            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, featuredImage: data.url }));
            }
        } catch (err) {
            console.error("Upload error:", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) {
            showToast("Please enter a Post Name.", "error");
            return;
        }

        setSaving(true);
        try {
            const url = isNew ? "/api/posts" : `/api/posts/${params.id}`;
            const method = isNew ? "POST" : "PATCH";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                showToast(isNew ? "Post created successfully" : "Post updated successfully");
                router.push("/dashboard/posts");
                router.refresh();
            } else {
                const data = await res.json();
                showToast(`Error: ${data.error || "Failed to save post"}`, "error");
            }
        } catch (err) {
            console.error(err);
            showToast("An unexpected error occurred", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <Link
                    href="/dashboard/posts"
                    className="group inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors font-bold text-sm"
                >
                    <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Articles
                </Link>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, status: p.status === "DRAFT" ? "PUBLISHED" : "DRAFT" }))}
                        className={cn(
                            "px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest border transition-all shadow-sm active:scale-95",
                            formData.status === "PUBLISHED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                        )}
                    >
                        {formData.status === "PUBLISHED" ? "● Published" : "○ Draft Mode"}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-xl font-bold flex items-center transition-all shadow-lg shadow-green-100 disabled:opacity-50 active:scale-95"
                    >
                        <Save size={18} className="mr-2" />
                        {saving ? "Saving..." : "Save Article"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Teaser & Media (Website Card Data) */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-6 bg-green-500 rounded-full" />
                            Website Card
                        </h2>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Featured Image</label>
                            <div className="relative group aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex flex-col items-center justify-center transition-colors hover:border-green-300">
                                {formData.featuredImage ? (
                                    <>
                                        <img src={formData.featuredImage} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-xs shadow-lg active:scale-95 transition-all">
                                                Change Image
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, featuredImage: "" }))}
                                                className="bg-rose-500 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg active:scale-95 transition-all"
                                            >
                                                Remove Image
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <label className="cursor-pointer text-center p-4 w-full h-full flex flex-col items-center justify-center group/label">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3 text-gray-400 group-hover/label:text-green-500 transition-colors">
                                            <ImageIcon size={24} />
                                        </div>
                                        <p className="text-[11px] font-bold text-gray-400 group-hover/label:text-green-600 transition-colors">
                                            Click to upload image
                                        </p>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Short Description</label>
                            <textarea
                                rows={4}
                                value={formData.excerpt}
                                onChange={(e) => setFormData(p => ({ ...p, excerpt: e.target.value }))}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-green-400 outline-none transition-all text-sm font-medium text-gray-700 leading-relaxed placeholder:text-gray-300"
                                placeholder="This summary appears on the news landing page..."
                            />
                        </div>
                    </div>
                </div>

                {/* Right Side: Detailed Article Builder */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-10 space-y-8">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Post Name (Headline)</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={handleTitleChange}
                                className="w-full px-0 bg-transparent border-0 border-b-2 border-gray-100 focus:border-green-500 outline-none transition-all text-3xl font-black text-gray-900 placeholder:text-gray-200"
                                placeholder="Enter article name..."
                            />
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                                        <Plus size={20} />
                                    </span>
                                    Article Sections
                                </h2>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-tighter bg-gray-50 px-3 py-1 rounded-full">
                                    Deep Dive Details
                                </p>
                            </div>

                            <div className="space-y-8">
                                {formData.contentSections.map((section, index) => (
                                    <div key={index} className="relative group bg-gray-50/50 rounded-3xl p-6 border border-gray-100/50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500">
                                        <button
                                            onClick={() => removeSection(index)}
                                            className="absolute -top-3 -right-3 w-8 h-8 bg-white text-rose-500 border border-rose-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white shadow-sm"
                                        >
                                            <Trash2 size={14} />
                                        </button>

                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                value={section.subtitle}
                                                onChange={(e) => updateSection(index, "subtitle", e.target.value)}
                                                className="w-full bg-transparent border-0 font-black text-gray-800 focus:ring-0 placeholder:text-gray-300 text-lg"
                                                placeholder="Section Subtitle (Optional)..."
                                            />
                                            <div className="h-px bg-gray-100 w-1/4" />
                                            <textarea
                                                rows={6}
                                                value={section.content}
                                                onChange={(e) => updateSection(index, "content", e.target.value)}
                                                className="w-full bg-transparent border-0 focus:ring-0 text-gray-600 leading-relaxed font-medium placeholder:text-gray-300 resize-none"
                                                placeholder="Write the deep-dive content for this section..."
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addSection}
                                className="w-full py-6 border-2 border-dashed border-gray-200 rounded-[2rem] text-gray-400 font-black text-sm uppercase tracking-widest hover:border-green-300 hover:text-green-500 hover:bg-green-50/30 transition-all flex flex-col items-center gap-2 group"
                            >
                                <div className="w-10 h-10 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-green-500 group-hover:rotate-90 transition-all shadow-sm">
                                    <Plus size={24} />
                                </div>
                                Add New Article Section
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
