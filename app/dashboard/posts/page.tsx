"use client";

import React from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Calendar, FileText, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useToast } from "@/components/ui/toast";

const POSTS_PER_PAGE = 10;

export default function PostsPage() {
    const { showToast } = useToast();
    const [posts, setPosts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState("");
    const [currentPage, setCurrentPage] = React.useState(1);

    // Deletion Modal State
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [postToDelete, setPostToDelete] = React.useState<string | null>(null);
    const [deleting, setDeleting] = React.useState(false);

    React.useEffect(() => {
        fetchPosts();
    }, []);

    // Reset to first page when searching
    React.useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/posts");
            if (!res.ok) {
                const errorData = await res.text();
                console.error("Fetch failed:", errorData);
                return;
            }
            const data = await res.json();
            setPosts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setPostToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!postToDelete) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/posts/${postToDelete}`, { method: "DELETE" });
            if (res.ok) {
                fetchPosts();
                setDeleteModalOpen(false);
                showToast("Article deleted successfully");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
            setPostToDelete(null);
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

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
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">News & Insights</h1>
                    <p className="text-gray-500 mt-1 max-w-2xl">
                        Create and manage deep-dive articles, market updates, and agricultural success stories.
                    </p>
                </div>
                <Link
                    href="/dashboard/posts/new"
                    className="group bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center transition-all shadow-lg shadow-green-100 active:scale-95"
                >
                    <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    New Article
                </Link>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search articles by title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:border-green-500 focus:bg-white border rounded-xl outline-none transition-all text-gray-900 placeholder:text-gray-400 font-medium"
                    />
                </div>
            </div>

            {/* Premium Table Card */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/30">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] w-[45%]">Article Details</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Published Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-xl" />
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-5 bg-gray-100 rounded w-2/3" />
                                                    <div className="h-3 bg-gray-50 rounded w-full" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6"><div className="h-8 bg-gray-100 rounded-full w-24 mx-auto" /></td>
                                        <td className="px-6 py-6"><div className="h-6 bg-gray-50 rounded-lg w-2/3 mx-auto" /></td>
                                        <td className="px-8 py-6 text-right"><div className="h-10 bg-gray-50 rounded-lg w-24 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : paginatedPosts.length > 0 ? (
                                paginatedPosts.map((post) => (
                                    <tr key={post.id} className="hover:bg-gray-50/80 transition-all group duration-300">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="relative h-16 w-16 min-w-[64px] rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-transform duration-500 group-hover:scale-105">
                                                    {post.featuredImage ? (
                                                        <img
                                                            src={post.featuredImage}
                                                            alt={post.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full bg-green-50 flex items-center justify-center text-green-600">
                                                            <ImageIcon size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <h3 className="text-base font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-1">
                                                        {post.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                                                        {post.excerpt || "No description provided."}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={cn(
                                                "inline-flex items-center justify-center min-w-[100px] px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all duration-300",
                                                post.status === "PUBLISHED"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100 group-hover:bg-emerald-100"
                                                    : "bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-100 group-hover:bg-amber-100"
                                            )}>
                                                <span className={cn(
                                                    "w-1.5 h-1.5 rounded-full mr-2",
                                                    post.status === "PUBLISHED" ? "bg-emerald-500" : "bg-amber-500"
                                                )} />
                                                {post.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center text-gray-900 font-bold text-sm">
                                                    <Calendar size={14} className="mr-2 text-gray-400" />
                                                    {formatDate(post.publishedAt || post.createdAt)}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                                                    {post.publishedAt ? "Live on Site" : "Created Date"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                                <Link
                                                    href={`/dashboard/posts/${post.id}`}
                                                    className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm border border-indigo-100"
                                                    title="Edit Article"
                                                >
                                                    <Edit2 size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteClick(post.id)}
                                                    className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm border border-rose-100"
                                                    title="Delete Article"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mb-6">
                                                <FileText size={40} />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
                                            <p className="text-gray-500 mb-6">Start by creating your first insight or agricultural news update.</p>
                                            <Link
                                                href="/dashboard/posts/new"
                                                className="text-green-600 font-bold hover:underline"
                                            >
                                                Create your first article
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="px-10 py-6 mt-6 bg-white border border-gray-100 shadow-xl shadow-gray-200/30 rounded-[2rem] flex items-center justify-between">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Total Records: <span className="text-slate-900 ml-1">{filteredPosts.length}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-6 py-2.5 rounded-xl bg-gray-50/50 border border-gray-100 text-[11px] font-black text-slate-500 uppercase tracking-widest hover:bg-white hover:border-green-200 hover:text-green-600 transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 shadow-sm"
                        >
                            Previous
                        </button>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-6 py-2.5 rounded-xl bg-gray-50/50 border border-gray-100 text-[11px] font-black text-slate-500 uppercase tracking-widest hover:bg-white hover:border-green-200 hover:text-green-600 transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                loading={deleting}
                title="Delete this article?"
                description="This action cannot be undone. This post will be permanently removed from the website and dashboard."
            />
        </div>
    );
}
