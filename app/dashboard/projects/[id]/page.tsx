"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Globe } from "lucide-react";
import Link from "next/link";
import { slugify } from "@/lib/utils";

export default function ProjectEditPage() {
    const router = useRouter();
    const params = useParams();
    const isNew = params.id === "new";

    const [formData, setFormData] = React.useState({
        title: "",
        slug: "",
        summary: "",
        description: "",
        status: "DRAFT",
        coverImageUrl: "",
        startDate: "",
        endDate: "",
    });
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
            setFormData(data);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = isNew ? "/api/projects" : `/api/projects/${params.id}`;
            const method = isNew ? "POST" : "PATCH";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) router.push("/dashboard/projects");
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
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
                        className={`px-4 py-2 rounded-lg font-medium flex items-center border ${formData.status === "PUBLISHED"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                    >
                        <Globe size={18} className="mr-2" />
                        {formData.status === "PUBLISHED" ? "Published" : "Draft"}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center transition-colors disabled:opacity-50"
                    >
                        <Save size={18} className="mr-2" />
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Project Title</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={handleTitleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all text-lg font-medium text-gray-900 placeholder:text-gray-400"
                        placeholder="Enter project name..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                    <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm italic"
                        placeholder="project-url-slug"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">End Date (Optional)</label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData(p => ({ ...p, endDate: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Summary (Short)</label>
                    <input
                        type="text"
                        value={formData.summary}
                        onChange={(e) => setFormData(p => ({ ...p, summary: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                        placeholder="Brief overview of the project..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Description</label>
                    <textarea
                        rows={8}
                        value={formData.description}
                        onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                        placeholder="Detailed description of the project, impact, and results..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image URL</label>
                    <input
                        type="text"
                        value={formData.coverImageUrl}
                        onChange={(e) => setFormData(p => ({ ...p, coverImageUrl: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                        placeholder="https://example.com/project-cover.jpg"
                    />
                </div>
            </div>
        </div>
    );
}
