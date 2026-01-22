"use client";

import React from "react";
import { Plus, UserPlus, Shield, Mail, Calendar, Check, MoreVertical, Edit, Trash2, AlertTriangle, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";

export default function UsersPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [users, setUsers] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [showModal, setShowModal] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: "",
        email: "",
        password: "",
        role: "EDITOR",
        image: "",
        status: "ACTIVE",
    });
    const [successMessage, setSuccessMessage] = React.useState("");
    const [error, setError] = React.useState("");

    // New state for Edit/Delete
    const [editingUser, setEditingUser] = React.useState<any>(null);
    const [deletingUser, setDeletingUser] = React.useState<any>(null);
    const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (session?.user?.role !== "ADMIN") {
            router.push("/dashboard");
            return;
        }
        fetchUsers();
    }, [session]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdownId && !(event.target as Element).closest('.user-dropdown-trigger')) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [openDropdownId]);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user: any) => {
        setEditingUser(user);
        setFormData({
            name: user.name || "",
            email: user.email || "",
            password: "", // Password blank on edit means "don't change"
            role: user.role,
            image: user.image || "",
            status: user.status,
        });
        setOpenDropdownId(null);
        setError("");
        setShowModal(true);
    };

    const handleDeleteClick = (user: any) => {
        setDeletingUser(user);
        setOpenDropdownId(null);
    };

    const confirmDelete = async () => {
        if (!deletingUser) return;
        try {
            const res = await fetch(`/api/users/${deletingUser.id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setSuccessMessage("User deleted successfully");
                setTimeout(() => setSuccessMessage(""), 5000);
                fetchUsers();
                setDeletingUser(null);
            } else {
                console.error("Failed to delete user");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
            const method = editingUser ? "PUT" : "POST";

            // If editing and password is empty, remove it from payload so it doesn't get hashed as empty string
            const payload: any = { ...formData };
            if (editingUser && !payload.password) {
                delete payload.password;
            }

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setShowModal(false);
                setFormData({ name: "", email: "", password: "", role: "EDITOR", image: "", status: "ACTIVE" });
                setEditingUser(null);
                setSuccessMessage(editingUser ? "User updated successfully!" : "User created successfully!");
                setTimeout(() => setSuccessMessage(""), 5000);
                fetchUsers();
            } else {
                const data = await res.json();
                console.error("Error saving user:", data.error);
                try {
                    const parsedError = JSON.parse(data.error);
                    if (Array.isArray(parsedError)) {
                        setError(parsedError[0].message);
                    } else {
                        setError(data.error);
                    }
                } catch {
                    setError(data.error || "Failed to save user");
                }
            }
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred");
        }
    };

    const openModal = () => {
        setEditingUser(null);
        setFormData({ name: "", email: "", password: "", role: "EDITOR", image: "", status: "ACTIVE" });
        setError("");
        setShowModal(true);
    };

    if (session?.user?.role !== "ADMIN") return null;

    return (
        <div className="space-y-6 relative">
            {/* Success Toast */}
            {successMessage && (
                <div className="fixed bottom-8 right-8 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center animate-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-white/20 rounded-full p-1 mr-3">
                        <Check size={16} className="text-white" />
                    </div>
                    <span className="font-medium">{successMessage}</span>
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <p className="text-gray-500">Manage team members and their access levels</p>
                </div>
                <button
                    onClick={openModal}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors shadow-lg shadow-green-100"
                >
                    <UserPlus size={20} className="mr-2" />
                    Add User
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse h-48"></div>
                    ))
                ) : users.map((user) => (
                    <div key={user.id} className="relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                        {/* Dropdown Menu */}
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDropdownId(openDropdownId === user.id ? null : user.id);
                                }}
                                className="user-dropdown-trigger p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                            >
                                <MoreVertical size={18} />
                            </button>

                            {openDropdownId === user.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-10 animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={() => handleEditClick(user)}
                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                                    >
                                        <Edit size={16} className="mr-2 text-gray-400" />
                                        Edit Details
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(user)}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                    >
                                        <Trash2 size={16} className="mr-2" />
                                        Delete User
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                {user.image ? (
                                    <img src={user.image} alt={user.name} className="h-12 w-12 rounded-full object-cover border border-gray-100" />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                                        {user.name?.[0]?.toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${user.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                        }`}>
                                        {user.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                    }`}>
                                    {user.role}
                                </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 pt-2 border-t border-gray-50 mt-2">
                                <Mail size={14} className="mr-2" />
                                <span className="truncate max-w-[200px]">{user.email}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <Calendar size={14} className="mr-2" />
                                Joined {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 font-display">
                                {editingUser ? "Edit Team Member" : "Add New Team Member"}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none text-gray-900 font-medium placeholder:text-gray-400 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none text-gray-900 font-medium placeholder:text-gray-400 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password {editingUser && <span className="text-gray-400 font-normal">(Leave blank to keep current)</span>}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser} // Only required when creating new user
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none text-gray-900 font-medium placeholder:text-gray-400 transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none text-gray-900 font-medium transition-all"
                                    >
                                        <option value="EDITOR">Editor</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none text-gray-900 font-medium transition-all"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                                <div className="flex items-center space-x-4">
                                    {(formData.image) && (
                                        <img src={formData.image} alt="Preview" className="h-12 w-12 rounded-full object-cover border border-gray-200" />
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
                                                    setFormData({ ...formData, image: data.url });
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
                                    {editingUser ? "Save Changes" : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
                            <AlertTriangle size={24} className="text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete User?</h3>
                        <p className="text-center text-gray-500 mb-8">
                            Are you sure you want to delete <span className="font-bold text-gray-900">{deletingUser.name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setDeletingUser(null)}
                                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
