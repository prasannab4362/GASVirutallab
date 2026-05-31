"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Briefcase, 
  FileCheck, 
  Calendar, 
  CheckSquare, 
  Award, 
  Users, 
  Settings, 
  LogOut, 
  ShieldAlert,
  Activity,
  FileSpreadsheet,
  Layers
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth-actions";

interface SidebarProps {
  role: "STUDENT" | "MENTOR" | "ADMIN";
  userName: string;
}

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Define navigation lists based on role
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
          { name: "Students", href: "/mentor/students", icon: Users },
          { name: "Reviews", href: "/mentor/reviews", icon: CheckSquare },
          { name: "Meetings", href: "/mentor/meetings", icon: Calendar },
        ];
      case "ADMIN":
        return [
          { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
          { name: "Students", href: "/admin/students", icon: Users },
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
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-zinc-200/80 shadow-sm z-20">
      {/* Header / Brand */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-200/80 bg-zinc-50/50">
        <Link href="/" className="flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="Green Automation Solution Logo" 
            className="w-8 h-8 object-contain filter drop-shadow-sm"
          />
          <div>
            <span className="font-semibold text-zinc-950 font-sans tracking-tight block leading-none">GAS Virtual Lab</span>
            <span className="text-[10px] text-zinc-500 font-medium block mt-0.5 tracking-wider uppercase">{role} PORTAL</span>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? "bg-blue-50 text-blue-600 shadow-sm" 
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-zinc-400 group-hover:text-zinc-600"}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-zinc-200/80 bg-zinc-50/30">
        <div className="flex items-center justify-between gap-3 px-2 mb-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <span className="font-medium text-sm text-zinc-900 block truncate leading-tight">{userName}</span>
              <span className="text-xs text-zinc-500 block truncate lowercase">{role}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50/80 transition-all border border-transparent hover:border-red-100"
        >
          <LogOut className="w-5 h-5 text-red-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
