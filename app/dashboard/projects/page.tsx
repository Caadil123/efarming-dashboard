"use client";

import React from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Calendar, MapPin, Tag, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useToast } from "@/components/ui/toast";

export default function ProjectsPage() {
    const { showToast } = useToast();
    const [projects, setProjects] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState("");

    // Deletion Modal State
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [projectToDelete, setProjectToDelete] = React.useState<string | null>(null);
    const [deleting, setDeleting] = React.useState(false);

    React.useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/projects");
            const data = await res.json();
            setProjects(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setProjectToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!projectToDelete) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/projects/${projectToDelete}`, { method: "DELETE" });
            if (res.ok) {
                fetchProjects();
                setDeleteModalOpen(false);
                showToast("Project deleted successfully");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
            setProjectToDelete(null);
        }
    };

    const filteredProjects = projects.filter(project =>
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.category?.toLowerCase().includes(search.toLowerCase()) ||
        project.location?.toLowerCase().includes(search.toLowerCase())
    );

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Agricultural Projects</h1>
                    <p className="text-gray-500 mt-1 max-w-2xl">
                        Monitor and manage your nationwide farming initiatives, infrastructure projects, and sustainability programs.
                    </p>
                </div>
                <Link
                    href="/dashboard/projects/new"
                    className="group bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center transition-all shadow-lg shadow-green-100 active:scale-95"
                >
                    <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    New Project
                </Link>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by title, category, or location..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:border-green-500 focus:bg-white border rounded-xl outline-none transition-all text-gray-900 placeholder:text-gray-400 font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    {projects.length} Total Projects
                </div>
            </div>

            {/* Premium Table Card */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-max min-w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/30">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] min-w-[300px]">Project Details</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Category</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Focus Areas</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Location</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Start Date</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">End Date</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap uppercase">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                                                    <div className="h-3 bg-gray-50 rounded w-full" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6"><div className="h-8 bg-gray-50 rounded-lg w-24" /></td>
                                        <td className="px-6 py-6"><div className="h-8 bg-gray-50 rounded-lg w-48" /></td>
                                        <td className="px-6 py-6"><div className="h-8 bg-gray-50 rounded-lg w-32" /></td>
                                        <td className="px-6 py-6"><div className="h-6 bg-gray-50 rounded-lg w-20" /></td>
                                        <td className="px-6 py-6"><div className="h-6 bg-gray-50 rounded-lg w-20" /></td>
                                        <td className="px-6 py-6"><div className="h-8 bg-gray-100 rounded-full w-20" /></td>
                                        <td className="px-8 py-6 text-right"><div className="h-10 bg-gray-50 rounded-lg w-20 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredProjects.length > 0 ? (
                                filteredProjects.map((project) => (
                                    <tr key={project.id} className="hover:bg-gray-50/80 transition-all group duration-300">
                                        {/* Project Column - Allows Wrap */}
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-12 w-12 min-w-[48px] rounded-xl overflow-hidden border border-gray-100 shadow-sm transition-transform duration-500 group-hover:scale-110">
                                                    {project.coverImageUrl ? (
                                                        <img
                                                            src={project.coverImageUrl}
                                                            alt={project.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full bg-green-50 flex items-center justify-center text-green-600">
                                                            <Tag size={18} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition-colors leading-tight">
                                                        {project.title}
                                                    </h3>
                                                    {project.summary && (
                                                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                                                            {project.summary}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category Column - No Wrap */}
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 shadow-sm">
                                                <Tag size={12} strokeWidth={2.5} />
                                                <span className="text-[10px] font-black uppercase tracking-wider">
                                                    {project.category || 'Agri-Tech'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Focus Areas Column - Flexible No Wrap */}
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <div className="flex gap-2 items-center">
                                                {project.focusAreas && project.focusAreas.length > 0 ? (
                                                    project.focusAreas.map((area: string, idx: number) => (
                                                        <span key={idx} className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold border border-gray-200">
                                                            {area}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] text-gray-400 italic">No focus areas</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Location Column - No Wrap */}
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-gray-700 font-bold text-xs bg-gray-50/50 px-3 py-1.5 rounded-lg border border-gray-100 italic">
                                                <MapPin size={14} className="text-orange-500" strokeWidth={2.5} />
                                                {project.location || 'Somalia'}
                                            </div>
                                        </td>

                                        {/* Start Date Column - Full Date No Wrap */}
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-gray-900 font-bold text-xs bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm shadow-gray-200/20">
                                                <Calendar size={12} className="text-blue-500" />
                                                {formatDate(project.startDate)}
                                            </div>
                                        </td>

                                        {/* End Date Column - Full Date No Wrap */}
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-gray-900 font-bold text-xs bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm shadow-gray-200/20">
                                                <Calendar size={12} className="text-purple-500" />
                                                {project.endDate ? formatDate(project.endDate) : "In Progress"}
                                            </div>
                                        </td>

                                        {/* Status Column - No Wrap */}
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <span className={cn(
                                                "inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
                                                project.status === "PUBLISHED"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100"
                                                    : "bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-100"
                                            )}>
                                                <span className={cn(
                                                    "w-1.5 h-1.5 rounded-full mr-2",
                                                    project.status === "PUBLISHED" ? "bg-emerald-500" : "bg-amber-500"
                                                )} />
                                                {project.status}
                                            </span>
                                        </td>

                                        {/* Actions Column - Sticky Right effect if needed, but here simple */}
                                        <td className="px-8 py-6 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-gray-50/0 transition-colors">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                                <Link
                                                    href={`/dashboard/projects/${project.id}`}
                                                    className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm border border-indigo-100 active:scale-90"
                                                >
                                                    <Edit2 size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteClick(project.id)}
                                                    className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm border border-rose-100 active:scale-90"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="w-2" />
                                                <ExternalLink size={14} className="text-gray-300" />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-6">
                                                <Search size={32} />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">No results found</h3>
                                            <p className="text-gray-500 text-sm mb-6">We couldn't find any projects matching your criteria.</p>
                                            <button
                                                onClick={() => setSearch("")}
                                                className="text-green-600 text-sm font-bold hover:underline"
                                            >
                                                View all projects
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold uppercase tracking-widest text-gray-400 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm ">
                <div>
                    Total Records: <span className="text-gray-900 ml-1">{filteredProjects.length}</span>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 cursor-not-allowed">Previous</button>
                    <button className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 cursor-not-allowed">Next</button>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>

            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                loading={deleting}
                title="Delete this project?"
                description="This project will be archived and hidden from the dashboard. This action is recorded and can only be reversed by a system administrator."
            />
        </div>
    );
}
