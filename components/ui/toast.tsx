"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle2 className="text-emerald-500" size={20} />,
        error: <AlertCircle className="text-rose-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />,
    };

    const styles = {
        success: "bg-emerald-50 border-emerald-100 shadow-emerald-200/20",
        error: "bg-rose-50 border-rose-100 shadow-rose-200/20",
        info: "bg-blue-50 border-blue-100 shadow-blue-200/20",
    };

    return (
        <div
            className={cn(
                "pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl border bg-white shadow-2xl min-w-[320px] max-w-md animate-in slide-in-from-right-10 fade-in duration-300",
                styles[toast.type]
            )}
        >
            <div className="flex-shrink-0">{icons[toast.type]}</div>
            <p className="flex-grow text-sm font-bold text-slate-800 leading-tight">
                {toast.message}
            </p>
            <button
                onClick={onClose}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
                <X size={16} />
            </button>
        </div>
    );
}
