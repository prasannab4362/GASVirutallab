import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read the session cookie directly from the request to avoid Edge context issues with next/headers
  const sessionToken = request.cookies.get("session")?.value;
  const session = sessionToken ? await decrypt(sessionToken) : null;

  // Handle explicit session clearing (e.g., from layout.tsx when DB record is missing)
  if (request.nextUrl.searchParams.get("clear") === "1") {
    const loginUrl = new URL("/login", request.url);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });
    return res;
  }

  // Detect if the session is from an old database state (missing profile IDs)
  if (session) {
    const isCorrupt = 
      (session.role === "MENTOR" && !session.mentorId) || 
      (session.role === "STUDENT" && !session.studentId);
      
    if (isCorrupt) {
      const loginUrl = new URL("/login", request.url);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.set("session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(0),
        path: "/",
      });
      return res;
    }
  }

  // Define route protections
  const isStudentRoute = pathname.startsWith("/student");
  const isMentorRoute = pathname.startsWith("/mentor");
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/login";

  // 1. If trying to access protected routes without a session
  if ((isStudentRoute || isMentorRoute || isAdminRoute) && !session) {
    const loginUrl = new URL("/login", request.url);
    // Remember redirect url if helpful, or just redirect
    return NextResponse.redirect(loginUrl);
  }

  // 2. If logged in, prevent accessing login page
  if (isLoginRoute && session) {
    if (session.role === "STUDENT") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    } else if (session.role === "MENTOR") {
      return NextResponse.redirect(new URL("/mentor/dashboard", request.url));
    } else if (session.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // 3. Prevent role-based cross access
  if (session) {
    if (isStudentRoute && session.role !== "STUDENT") {
      return redirectByUserRole(session.role, request);
    }
    if (isMentorRoute && session.role !== "MENTOR") {
      return redirectByUserRole(session.role, request);
    }
    if (isAdminRoute && session.role !== "ADMIN") {
      return redirectByUserRole(session.role, request);
    }
  }

  return NextResponse.next();
}

function redirectByUserRole(role: string, request: NextRequest) {
  if (role === "STUDENT") {
    return NextResponse.redirect(new URL("/student/dashboard", request.url));
  } else if (role === "MENTOR") {
    return NextResponse.redirect(new URL("/mentor/dashboard", request.url));
  } else if (role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

// See Next.js middleware documentation to match all paths except static files, public API, next assets, favicon
export const config = {
  matcher: [
    "/student/:path*",
    "/mentor/:path*",
    "/admin/:path*",
    "/login",
  ],
};
