"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    loading?: boolean;
}

export function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    loading = false,
}: DeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl shadow-rose-200/20 border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
                <div className="p-8">
                    {/* Header: Icon & Close */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shadow-sm border border-rose-100/50">
                            <AlertTriangle size={28} />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body: Title & Text */}
                    <div className="space-y-3">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">
                            {title}
                        </h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            {description}
                        </p>
                    </div>

                    {/* Footer: Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 mt-10">
                        <button
                            onClick={onClose}
                            className="px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="px-6 py-3.5 rounded-2xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-200 disabled:opacity-50 flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Processing...</span>
                                </div>
                            ) : "Delete Record"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
