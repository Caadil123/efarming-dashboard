"use client";

import React from "react";
import { Plus, Users, Shield, Check, MoreVertical, Edit, Trash2, AlertTriangle, X, Briefcase } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function TeamPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [members, setMembers] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [showModal, setShowModal] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: "",
        title: "",
        description: "",
        imageUrl: "",
        type: "TEAM",
        isActive: true,
    });
    const [successMessage, setSuccessMessage] = React.useState("");
    const [error, setError] = React.useState("");

    const [editingMember, setEditingMember] = React.useState<any>(null);
    const [deletingMember, setDeletingMember] = React.useState<any>(null);
    const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null);

    const [searchQuery, setSearchQuery] = React.useState("");

    React.useEffect(() => {
        if (!session) {
            router.push("/login");
            return;
        }
        fetchMembers();
    }, [session]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdownId && !(event.target as Element).closest('.member-dropdown-trigger')) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [openDropdownId]);

    const fetchMembers = async () => {
        try {
            const res = await fetch("/api/team-members");
            const data = await res.json();
            setMembers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (member: any) => {
        setEditingMember(member);
        setFormData({
            name: member.name || "",
            title: member.title || "",
            description: member.description || "",
            imageUrl: member.imageUrl || "",
            type: member.type || "TEAM",
            isActive: member.isActive,
        });
        setOpenDropdownId(null);
        setError("");
        setShowModal(true);
    };

    const handleDeleteClick = (member: any) => {
        setDeletingMember(member);
        setOpenDropdownId(null);
    };

    const confirmDelete = async () => {
        if (!deletingMember) return;
        try {
            const res = await fetch(`/api/team-members/${deletingMember.id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setSuccessMessage("Member removed successfully");
                setTimeout(() => setSuccessMessage(""), 5000);
                fetchMembers();
                setDeletingMember(null);
            } else {
                console.error("Failed to delete member");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const url = editingMember ? `/api/team-members/${editingMember.id}` : "/api/team-members";
            const method = editingMember ? "PATCH" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setShowModal(false);
                setFormData({ name: "", title: "", description: "", imageUrl: "", type: "TEAM", isActive: true });
                setEditingMember(null);
                setSuccessMessage(editingMember ? "Member updated successfully!" : "Member added successfully!");
                setTimeout(() => setSuccessMessage(""), 5000);
                fetchMembers();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to save team member");
            }
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred");
        }
    };

    const openModal = () => {
        setEditingMember(null);
        setFormData({ name: "", title: "", description: "", imageUrl: "", type: "TEAM", isActive: true });
        setError("");
        setShowModal(true);
    };

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const teamMembers = filteredMembers.filter(m => m.type === "TEAM" || !m.type);
    const advisors = filteredMembers.filter(m => m.type === "ADVISOR");

    const renderMemberCard = (member: any) => (
        <div key={member.id} className="relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full overflow-hidden">
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === member.id ? null : member.id);
                    }}
                    className="member-dropdown-trigger p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                >
                    <MoreVertical size={18} />
                </button>

                {openDropdownId === member.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-10 animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => handleEditClick(member)}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                        >
                            <Edit size={16} className="mr-2 text-gray-400" />
                            Edit Member
                        </button>
                        <button
                            onClick={() => handleDeleteClick(member)}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                        >
                            <Trash2 size={16} className="mr-2" />
                            Delete Member
                        </button>
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center text-center flex-1">
                {member.imageUrl ? (
                    <img src={member.imageUrl} alt={member.name} className="h-24 w-24 rounded-full object-cover border-4 border-gray-50 mb-4 shrink-0" />
                ) : (
                    <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl mb-4 border-4 border-gray-50 shrink-0">
                        {member.name?.[0]?.toUpperCase()}
                    </div>
                )}
                <h3 className="font-bold text-gray-900 text-lg break-words w-full">{member.name}</h3>
                <div className="flex items-center text-green-600 font-medium text-sm mb-3">
                    <Briefcase size={14} className="mr-1.5 shrink-0" />
                    <span className="break-words">{member.title}</span>
                </div>
                <p className="text-gray-500 text-sm line-clamp-3 mb-4 italic break-words w-full">
                    "{member.description}"
                </p>
            </div>
            <div className="w-full pt-4 border-t border-gray-50 flex justify-center mt-auto">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${member.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}>
                    {member.isActive ? "Active" : "Inactive"}
                </span>
            </div>
        </div>
    );

    if (!session) return null;

    return (
        <div className="space-y-8 relative">
            {/* Success Toast */}
            {successMessage && (
                <div className="fixed bottom-8 right-8 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center animate-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-white/20 rounded-full p-1 mr-3">
                        <Check size={16} className="text-white" />
                    </div>
                    <span className="font-medium">{successMessage}</span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 font-display">Team Management</h2>
                    <p className="text-gray-500">Manage your organizational team members and advisors</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all"
                        />
                    </div>
                    <button
                        onClick={openModal}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors shadow-lg shadow-green-100 whitespace-nowrap"
                    >
                        <Plus size={20} className="mr-2" />
                        Add Member
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                {/* Team Members Section */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-1 bg-green-500 rounded-full"></div>
                        <h3 className="text-lg font-bold text-gray-900">Our Team</h3>
                        <span className="text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{teamMembers.length}</span>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array(3).fill(0).map((_, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse h-64"></div>
                            ))}
                        </div>
                    ) : teamMembers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teamMembers.map(renderMemberCard)}
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-500 text-sm">
                            No team members found. Click "Add Member" to create one.
                        </div>
                    )}
                </div>

                {/* Advisors Section */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                        <h3 className="text-lg font-bold text-gray-900">Our Advisors</h3>
                        <span className="text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{advisors.length}</span>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array(3).fill(0).map((_, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse h-64"></div>
                            ))}
                        </div>
                    ) : advisors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {advisors.map(renderMemberCard)}
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-500 text-sm">
                            No advisors found. Click "Add Member" to add an advisor.
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 font-display">
                                {editingMember ? "Edit Team Member" : "Add Team Member"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                                <Shield size={16} className="mr-2" />
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: "TEAM" })}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${formData.type === "TEAM"
                                            ? "bg-green-50 border-green-200 text-green-700 ring-1 ring-green-500"
                                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        Team Member
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: "ADVISOR" })}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${formData.type === "ADVISOR"
                                            ? "bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-500"
                                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        Advisor
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none text-gray-900 font-medium placeholder:text-gray-400 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Chief Executive Officer"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none text-gray-900 font-medium placeholder:text-gray-400 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title Description / Bio</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Brief description about the member's role or bio..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none text-gray-900 font-medium placeholder:text-gray-400 transition-all resize-none"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Set as Active</label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                                <div className="flex items-center space-x-4">
                                    {(formData.imageUrl) && (
                                        <img src={formData.imageUrl} alt="Preview" className="h-12 w-12 rounded-full object-cover border border-gray-200" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
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
                                                    setFormData({ ...formData, imageUrl: data.url });
                                                } else {
                                                    setError("Failed to upload image");
                                                }
                                            } catch (err) {
                                                setError("Error uploading image");
                                            }
                                        }}
                                        className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-green-50 file:text-green-700
                                            hover:file:bg-green-100
                                        "
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-100"
                                >
                                    {editingMember ? "Save Changes" : "Add Member"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingMember && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
                            <AlertTriangle size={24} className="text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Remove Member?</h3>
                        <p className="text-center text-gray-500 mb-8">
                            Are you sure you want to remove <span className="font-bold text-gray-900">{deletingMember.name}</span> from the team?
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setDeletingMember(null)}
                                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
