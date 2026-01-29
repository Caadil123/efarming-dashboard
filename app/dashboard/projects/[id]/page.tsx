"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Globe, Plus } from "lucide-react";
import Link from "next/link";
import { slugify, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export default function ProjectEditPage() {
    const { showToast } = useToast();
    const router = useRouter();
    const params = useParams();
    const isNew = params.id === "new";

    const [formData, setFormData] = React.useState({
        title: "",
        summary: "",
        description: "",
        location: "",
        category: "",
        focusAreas: [] as string[],
        status: "DRAFT",
        coverImageUrl: "",
        startDate: "",
        endDate: "",
    });
    const [tagInput, setTagInput] = React.useState("");
    const [loading, setLoading] = React.useState(!isNew);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        if (!isNew) {
            fetchProject();
        }
    }, [isNew]);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${params.id}`);
            const data = await res.json();
            // Format dates for input type="date"
            if (data.startDate) data.startDate = new Date(data.startDate).toISOString().split('T')[0];
            if (data.endDate) data.endDate = new Date(data.endDate).toISOString().split('T')[0];

            setFormData({
                ...data,
                location: data.location || "",
                category: data.category || "",
                focusAreas: data.focusAreas || [],
                coverImageUrl: data.coverImageUrl || "",
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
            title
        }));
    };

    const addTag = (tag: string) => {
        const cleanTag = tag.trim();
        if (cleanTag && !formData.focusAreas.includes(cleanTag)) {
            setFormData(prev => ({
                ...prev,
                focusAreas: [...prev.focusAreas, cleanTag]
            }));
        }
        setTagInput("");
    };

    const removeTag = (index: number) => {
        setFormData(prev => ({
            ...prev,
            focusAreas: prev.focusAreas.filter((_, i) => i !== index)
        }));
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
                setFormData(prev => ({ ...prev, coverImageUrl: data.url }));
            }
        } catch (err) {
            console.error("Upload error:", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) {
            showToast("Please enter a project title.", "error");
            return;
        }

        setSaving(true);
        try {
            const url = isNew ? "/api/projects" : `/api/projects/${params.id}`;
            const method = isNew ? "POST" : "PATCH";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                showToast(isNew ? "Project created successfully" : "Project updated successfully");
                router.push("/dashboard/projects");
                router.refresh();
            } else {
                const data = await res.json();
                showToast(`Error: ${data.error || "Failed to save project"}`, "error");
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between sticky top-0 bg-gray-50/80 backdrop-blur-md z-20 py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                <Link
                    href="/dashboard/projects"
                    className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to list
                </Link>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setFormData(p => ({ ...p, status: p.status === "DRAFT" ? "PUBLISHED" : "DRAFT" }))}
                        className={cn(
                            "px-4 py-2 rounded-lg font-medium flex items-center border transition-all shadow-sm",
                            formData.status === "PUBLISHED"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-white text-gray-700 border-gray-200"
                        )}
                    >
                        <Globe size={18} className="mr-2" />
                        {formData.status === "PUBLISHED" ? "Published" : "Draft"}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center transition-all disabled:opacity-50 shadow-lg shadow-green-100"
                    >
                        <Save size={18} className="mr-2" />
                        {saving ? "Saving..." : isNew ? "Create Project" : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Project Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all text-xl font-bold text-gray-900 placeholder:text-gray-400"
                                    placeholder="Enter project name..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 text-gray-900 outline-none transition-all"
                                        placeholder="e.g. SUSTAINABILITY"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 text-gray-900 outline-none transition-all"
                                        placeholder="e.g. Benadir Region"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Description</label>
                            <textarea
                                rows={12}
                                value={formData.description}
                                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                                placeholder="Detailed description of the project, impact, and results..."
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Featured Image</label>
                            <div className="relative group">
                                <div className="aspect-video w-full rounded-xl bg-gray-100 overflow-hidden border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-4 relative">
                                    {formData.coverImageUrl ? (
                                        <>
                                            <img src={formData.coverImageUrl} className="absolute inset-0 w-full h-full object-cover" alt="Cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm">
                                                    Change Image
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                                </label>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-gray-400 mb-2">
                                                <Globe size={32} />
                                            </div>
                                            <label className="cursor-pointer text-green-600 font-medium text-sm hover:underline">
                                                Upload cover image
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                            </label>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Focus Areas</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.focusAreas.map((tag, i) => (
                                    <span key={i} className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border
                                     border-green-100">
                                        {tag}
                                        <button onClick={() => removeTag(i)} type="button" className="ml-1.5 hover:text-green-900">
                                            <Save size={12} className="rotate-45" /> {/* Just using an icon for close */}
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addTag(tagInput);
                                        }
                                    }}
                                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none text-gray-900 focus:ring-2 focus:ring-green-500"
                                    placeholder="Add focus area..."
                                />
                                <button
                                    type="button"
                                    onClick={() => addTag(tagInput)}
                                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-50">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Project Timeline</label>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Start Date</span>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white text-gray-900 outline-none text-sm transition-all"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">End Date (Optional)</span>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData(p => ({ ...p, endDate: e.target.value }))}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white outline-none text-sm transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
}
