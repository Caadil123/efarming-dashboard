import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isUsersPage = req.nextUrl.pathname.startsWith("/dashboard/users");

        // Role protection for users management
        if (isUsersPage && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/((?!api|_next/static|_next/image|login|favicon.ico).*)",
    ],
};
