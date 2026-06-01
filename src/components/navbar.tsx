"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, LayoutDashboard, Briefcase, FileCheck, Calendar, Activity, Award, Users, ShieldAlert, Layers, FileSpreadsheet, Settings, CheckSquare } from "lucide-react";
import NotificationCenter from "./notification-center";
import { logoutAction } from "@/lib/actions/auth-actions";

interface NavbarProps {
  role: "STUDENT" | "MENTOR" | "ADMIN";
  userName: string;
  notifications: any[];
}

export default function Navbar({ role, userName, notifications }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Get current page header title
  const getPageTitle = () => {
    const segment = pathname.split("/").pop();
    if (!segment || segment === role.toLowerCase()) return "Dashboard";
    const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ");
    if (title.toLowerCase() === "students") return "Interns";
    return title;
  };

  // Define navigation lists based on role for mobile view
  const getNavLinks = () => {
    switch (role) {
      case "STUDENT":
        return [
          { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
          { name: "Projects", href: "/student/projects", icon: Briefcase },
          { name: "Assignments", href: "/student/assignments", icon: FileCheck },
          { name: "Meetings", href: "/student/meetings", icon: Calendar },
          { name: "Attendance", href: "/student/attendance", icon: Activity },
          { name: "Certificates", href: "/student/certificates", icon: Award },
        ];
      case "MENTOR":
        return [
          { name: "Dashboard", href: "/mentor/dashboard", icon: LayoutDashboard },
          { name: "Interns", href: "/mentor/students", icon: Users },
          { name: "Reviews", href: "/mentor/reviews", icon: CheckSquare },
          { name: "Meetings", href: "/mentor/meetings", icon: Calendar },
        ];
      case "ADMIN":
        return [
          { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
          { name: "Workspaces", href: "/admin/oversight", icon: Briefcase },
          { name: "Interns", href: "/admin/students", icon: Users },
          { name: "Mentors", href: "/admin/mentors", icon: ShieldAlert },
          { name: "Programs", href: "/admin/programs", icon: Layers },
          { name: "Attendance", href: "/admin/attendance", icon: Activity },
          { name: "Certificates", href: "/admin/certificates", icon: Award },
          { name: "Reports", href: "/admin/reports", icon: FileSpreadsheet },
          { name: "Settings", href: "/admin/settings", icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <header className="h-16 border-b border-zinc-200/80 bg-white sticky top-0 px-4 sm:px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl text-zinc-600 hover:bg-zinc-150 transition-colors border border-zinc-200/60"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <h2 className="text-zinc-900 font-semibold text-base sm:text-lg tracking-tight hidden sm:block">
            {getPageTitle()}
          </h2>
          <span className="sm:hidden font-semibold text-zinc-950 text-sm">GAS Lab</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification dropdown */}
          <NotificationCenter initialNotifications={notifications} />

          {/* Minimal profile badge */}
          <div className="flex items-center gap-2 border-l border-zinc-200/80 pl-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              {userName.substring(0, 1).toUpperCase()}
            </div>
            <span className="hidden lg:block text-xs font-medium text-zinc-700 max-w-[100px] truncate">
              {userName}
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 flex md:hidden">
          {/* Backing mask */}
          <div 
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Side Drawer menu */}
          <div className="relative flex flex-col w-72 max-w-xs h-full bg-white shadow-xl animate-slide-right py-4 z-40">
            <div className="flex items-center justify-between px-4 pb-4 border-b border-zinc-200/80">
              <div className="flex items-center gap-1.5">
                <img 
                  src="/logo.png" 
                  alt="Green Automation Solution Logo" 
                  className="w-6 h-6 object-contain filter drop-shadow-sm"
                />
                <span className="font-bold text-zinc-950 text-xs">GAS Virtual Lab</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-blue-50 text-blue-600" 
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-55"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-zinc-200/80">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
