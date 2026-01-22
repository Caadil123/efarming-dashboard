import React from "react";
import { prisma } from "@/lib/prisma";
import {
    FileText,
    Briefcase,
    Users,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";

async function getStats() {
    const [postCount, projectCount, userCount] = await Promise.all([
        prisma.post.count(),
        prisma.project.count(),
        prisma.user.count(),
    ]);

    return {
        postCount,
        projectCount,
        userCount,
    };
}

export default async function DashboardPage() {
    const stats = await getStats();

    const cards = [
        {
            name: "News Articles",
            value: stats.postCount,
            icon: FileText,
            color: "bg-blue-500",
            href: "/dashboard/posts",
        },
        {
            name: "Total Projects",
            value: stats.projectCount,
            icon: Briefcase,
            color: "bg-green-500",
            href: "/dashboard/projects",
        },
        {
            name: "Active Users",
            value: stats.userCount,
            icon: Users,
            color: "bg-purple-500",
            href: "/dashboard/users",
        },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card) => (
                    <div
                        key={card.name}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${card.color} text-white`}>
                                <card.icon size={24} />
                            </div>
                            <Link
                                href={card.href}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <ArrowUpRight size={20} />
                            </Link>
                        </div>
                        <p className="text-sm font-medium text-gray-500">{card.name}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Welcome back!</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Welcome to your eFarming Admin Dashboard. From here, you can manage
                        your news articles, project updates, and team collaboration settings.
                        Use the sidebar to navigate to different sections.
                    </p>
                    <div className="mt-6 flex space-x-4">
                        <Link
                            href="/dashboard/posts"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                            Create New Post
                        </Link>
                        <Link
                            href="/dashboard/projects"
                            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            View Projects
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
                    <ul className="space-y-4">
                        <li className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
                            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mr-3">
                                <FileText size={18} />
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Publish a new insight</span>
                        </li>
                        <li className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
                            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-3">
                                <Briefcase size={18} />
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Update project progress</span>
                        </li>
                        <li className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
                            <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mr-3">
                                <Users size={18} />
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Review team access</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
