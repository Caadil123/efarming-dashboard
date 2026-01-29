"use client";

import React from "react";
import { Plus, Search, Edit2, Trash2, Handshake, ExternalLink, Globe, X, Upload, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { DeleteModal } from "@/components/ui/delete-modal";

interface Partner {
    id: string;
    name: string;
    imageUrl: string | null;
    url: string | null;
    createdAt: string;
}

export default function PartnershipsPage() {
    const { showToast } = useToast();
    const [partners, setPartners] = React.useState<Partner[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [currentPartner, setCurrentPartner] = React.useState<Partial<Partner>>({});
    const [saving, setSaving] = React.useState(false);

    // Deletion Modal State
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [partnerToDelete, setPartnerToDelete] = React.useState<string | null>(null);
    const [deleting, setDeleting] = React.useState(false);

    React.useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const res = await fetch("/api/partners");
            const data = await res.json();
            setPartners(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            showToast("Failed to fetch partners", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPartner.name) return showToast("Name is required", "error");

        setSaving(true);
        try {
            const isEdit = !!currentPartner.id;
            const url = isEdit ? `/api/partners/${currentPartner.id}` : "/api/partners";
            const method = isEdit ? "PATCH" : "POST";

            const payload = {
                ...currentPartner,
                url: currentPartner.url === "" ? null : currentPartner.url
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                showToast(isEdit ? "Partner updated successfully" : "Partner added successfully");
                setIsModalOpen(false);
                fetchPartners();
            } else {
                const data = await res.json();
                showToast(data.error || "Failed to save partner", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Something went wrong", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setPartnerToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!partnerToDelete) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/partners/${partnerToDelete}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Partner removed successfully");
                setDeleteModalOpen(false);
                fetchPartners();
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to delete partner", "error");
        } finally {
            setDeleting(false);
            setPartnerToDelete(null);
        }
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
                setCurrentPartner(prev => ({ ...prev, imageUrl: data.url }));
                showToast("Logo uploaded successfully");
            }
        } catch (err) {
            console.error("Upload error:", err);
            showToast("Image upload failed", "error");
        }
    };

    const filteredPartners = partners.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Organization Partnerships</h1>
                    <p className="text-gray-500 mt-1 max-w-2xl">
                        Manage your strategic alliances, supporting organizations, and institutional partners.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setCurrentPartner({ name: "", imageUrl: "", url: "" });
                        setIsModalOpen(true);
                    }}
                    className="group bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center transition-all shadow-lg shadow-green-100 active:scale-95"
                >
                    <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Add Partner
                </button>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search partners by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:border-green-500 focus:bg-white border rounded-xl outline-none transition-all text-gray-900 placeholder:text-gray-400 font-medium"
                    />
                </div>
            </div>

            {/* Partners Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                                    <div className="h-3 bg-gray-50 rounded w-1/3" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : filteredPartners.length > 0 ? (
                    filteredPartners.map((partner) => (
                        <div key={partner.id} className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 hover:shadow-green-100/40 hover:border-green-100 transition-all duration-300 relative overflow-hidden">
                            <div className="flex items-center gap-5">
                                <div className="relative h-16 w-16 min-w-[64px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-500">
                                    {partner.imageUrl ? (
                                        <img src={partner.imageUrl} alt={partner.name} className="max-h-full max-w-full object-contain" />
                                    ) : (
                                        <Handshake size={32} className="text-gray-300" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors leading-tight truncate">
                                        {partner.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-[11px] font-black uppercase tracking-widest">
                                        <Globe size={12} className="text-blue-400" />
                                        {partner.url ? (
                                            <a href={partner.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors truncate">
                                                {new URL(partner.url).hostname}
                                            </a>
                                        ) : (
                                            "No Website Linked"
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pt-4 border-t border-gray-50">
                                <button
                                    onClick={() => {
                                        setCurrentPartner(partner);
                                        setIsModalOpen(true);
                                    }}
                                    className="p-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm border border-indigo-100 active:scale-95"
                                    title="Edit Partner"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(partner.id)}
                                    className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm border border-rose-100 active:scale-95"
                                    title="Remove Partner"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 bg-white rounded-[3rem] border border-dashed border-gray-200 text-center">
                        <div className="max-w-xs mx-auto">
                            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 mx-auto mb-6">
                                <Handshake size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No partners found</h3>
                            <p className="text-gray-500 text-sm mb-6 leading-relaxed">Expand your network by adding your first organizational partnership.</p>
                            <button
                                onClick={() => {
                                    setCurrentPartner({ name: "", imageUrl: "", url: "" });
                                    setIsModalOpen(true);
                                }}
                                className="text-green-600 font-bold hover:underline"
                            >
                                Add your first partner
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                        {currentPartner.id ? "Edit Partnership" : "New Partnership"}
                                    </h3>
                                    <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.1em]">Organization details</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                {/* Logo Upload */}
                                <div className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100/50">
                                    <div className="flex items-center gap-5">
                                        <div className="h-20 w-20 min-w-[80px] bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group transition-all hover:border-green-400">
                                            {currentPartner.imageUrl ? (
                                                <img src={currentPartner.imageUrl} className="h-full w-full object-contain p-2" alt="Preview" />
                                            ) : (
                                                <Upload size={20} className="text-slate-300" />
                                            )}
                                            <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Partner Logo</p>
                                            <p className="text-xs font-bold text-slate-900 mt-1">Upload brand logo</p>
                                            <p className="text-[10px] text-slate-400 leading-tight">Recommended: PNG 200x200px</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Partner Name</label>
                                    <input
                                        type="text"
                                        placeholder="Organization name..."
                                        value={currentPartner.name || ""}
                                        onChange={(e) => setCurrentPartner(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-5 py-3 bg-slate-50/50 border-slate-100 focus:border-green-500 focus:bg-white border-2 rounded-2xl outline-none transition-all text-slate-900 font-bold placeholder:text-slate-300 text-sm"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Website (Optional)</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                            <Globe size={16} />
                                        </div>
                                        <input
                                            type="url"
                                            placeholder="https://example.com"
                                            value={currentPartner.url || ""}
                                            onChange={(e) => setCurrentPartner(prev => ({ ...prev, url: e.target.value }))}
                                            className="w-full pl-12 pr-5 py-3 bg-slate-50/50 border-slate-100 focus:border-green-500 focus:bg-white border-2 rounded-2xl outline-none transition-all text-slate-900 font-bold placeholder:text-slate-300 text-sm"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-green-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-200 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            <span>{currentPartner.id ? "Update Partnership" : "Save Partnership"}</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                loading={deleting}
                title="Remove this partner?"
                description="This will remove the organization's logo and link from the main website. You can re-add them at any time."
            />
        </div>
    );
}
