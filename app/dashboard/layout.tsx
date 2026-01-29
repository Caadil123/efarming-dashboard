"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
    LayoutDashboard,
    FileText,
    Briefcase,
    Users,
    Shield,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "News & Insights", href: "/dashboard/posts", icon: FileText },
    { name: "Projects", href: "/dashboard/projects", icon: Briefcase },
    { name: "Team Members", href: "/dashboard/team", icon: Users },
];

const adminItems = [
    { name: "User Management", href: "/dashboard/users", icon: Shield },
];


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    const isAdmin = session?.user?.role === "ADMIN";

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
                    isSidebarOpen ? "w-64" : "w-20"
                )}
            >
                {/* Logo Section - Larger */}
                <div className={cn(
                    "flex items-center justify-between border-b border-gray-100",
                    isSidebarOpen ? "p-6 h-28" : "p-4 h-16"
                )}>
                    {isSidebarOpen && (
                        <div className="relative h-45 w-full -ml-3">
                            <Image
                                src="/logo.png"
                                alt="eFarming Admin"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </div>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 pt-4">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center p-3 rounded-lg transition-colors",
                                pathname === item.href
                                    ? "bg-green-50 text-green-700"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            <item.icon size={20} className="shrink-0" />
                            {isSidebarOpen && <span className="ml-3 font-medium">{item.name}</span>}
                        </Link>
                    ))}

                    {isAdmin && (
                        <>
                            <div className={cn("pt-4 pb-2", !isSidebarOpen && "hidden")}>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
                                    Admin Tools
                                </p>
                            </div>
                            {adminItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center p-3 rounded-lg transition-colors",
                                        pathname === item.href
                                            ? "bg-green-50 text-green-700"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon size={20} className="shrink-0" />
                                    {isSidebarOpen && <span className="ml-3 font-medium">{item.name}</span>}
                                </Link>
                            ))}
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={20} className="shrink-0" />
                        {isSidebarOpen && <span className="ml-3 font-medium">Log out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
                    <h1 className="text-lg font-semibold text-gray-800">
                        {pathname === "/dashboard" ? "Overview" :
                            pathname.includes("/posts") ? "News & Insights" :
                                pathname.includes("/projects") ? "Projects" :
                                    pathname.includes("/team") ? "Team Members" :
                                        pathname.includes("/users") ? "User Management" : "Dashboard"}
                    </h1>

                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900 leading-tight">
                                {session?.user?.name?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{session?.user?.role || "ADMIN"}</p>
                        </div>
                        <div className="h-10 w-10 min-w-[40px] rounded-full overflow-hidden border-2 border-green-50 shadow-sm flex items-center justify-center bg-green-100 ring-2 ring-white">
                            {session?.user?.image ? (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || "User"}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-green-700 font-black text-sm">
                                    {(session?.user?.name?.[0] || session?.user?.email?.[0] || 'U').toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                </header>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}