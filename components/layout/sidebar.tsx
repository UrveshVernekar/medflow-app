"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/features/auth/auth.actions";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Menu,
  LogOut,
  Building2,
  Stethoscope,
  User,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

type Props = {
  role: "admin" | "doctor" | "patient";
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
};

type NavLink = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const roleConfig = {
  admin: { title: "Admin Portal", icon: LayoutDashboard },
  doctor: { title: "Doctor Portal", icon: UserCheck },
  patient: { title: "Patient Portal", icon: Users },
};

export function AppSidebar({ role, user }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const config = roleConfig[role];
  const links = getLinks(role);

  const isActive = (href: string) => {
    if (href === `/${role}`) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const displayName = user?.name || (role === "doctor" ? "Dr. User" : role === "admin" ? "Administrator" : "Patient");
  const displayEmail = user?.email || "user@medflow.com";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Mobile Drawer */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-72 p-0 border-r bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl flex flex-col h-full"
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">Main navigation</SheetDescription>

          {/* Header */}
          <div className="flex items-center gap-3.5 border-b border-zinc-100 dark:border-zinc-800 px-6 py-7">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center shadow-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-2xl tracking-tighter text-zinc-900 dark:text-white">
                MedFlow
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium -mt-0.5">
                {config.title}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-5 space-y-1.5">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center gap-4 rounded-2xl px-5 py-4 text-[15px] font-medium transition-all
                    ${
                      active
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
                    }
                  `}
                >
                  <link.icon
                    className={`h-5 w-5 flex-shrink-0 ${active ? "text-blue-600 dark:text-blue-400" : ""}`}
                  />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Identity Card & Footer */}
          <div className="border-t border-zinc-100 dark:border-zinc-800 p-4 space-y-3 mt-auto">
            <Link
              href="/profile"
              className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-3 hover:border-blue-300 dark:hover:border-blue-900 transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{displayName}</p>
                <p className="text-xs text-zinc-500 truncate">{displayEmail}</p>
              </div>
              <Badge className="capitalize text-[10px] px-2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-none shrink-0">
                {role}
              </Badge>
            </Link>

            <div className="flex items-center justify-between px-2">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700 transition-all p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/50"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex h-screen border-r bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl flex-col transition-all duration-300 shadow-2xl shrink-0 z-40 ${
          collapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-6 py-7 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center shadow-lg shrink-0">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-semibold text-xl tracking-tighter text-zinc-900 dark:text-white">
                  MedFlow EMR
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium -mt-0.5">
                  {config.title}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2.5 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 space-y-1.5">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  group flex items-center gap-4 rounded-2xl px-5 py-3.5 text-[15px] font-medium transition-all duration-200
                  hover:bg-zinc-100 dark:hover:bg-zinc-900
                  ${
                    active
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 shadow-sm ring-1 ring-blue-200 dark:ring-blue-900"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }
                `}
                title={collapsed ? link.label : undefined}
              >
                <link.icon
                  className={`h-5 w-5 flex-shrink-0 transition-colors ${
                    active
                      ? "text-blue-600 dark:text-blue-400"
                      : "group-hover:text-zinc-900 dark:group-hover:text-white"
                  }`}
                />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Identity Footer Section */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 p-3 mt-auto space-y-2">
          {/* User Profile Card */}
          <Link
            href="/profile"
            className={`flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-blue-300 dark:hover:border-blue-900 transition-all ${
              collapsed ? "justify-center p-2" : ""
            }`}
            title={collapsed ? `${displayName} (${role})` : undefined}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md">
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{displayName}</p>
                  <Badge className="capitalize text-[9px] px-1.5 py-0 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-none shrink-0 font-bold">
                    {role}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500 truncate mt-0.5">{displayEmail}</p>
              </div>
            )}
          </Link>

          {/* Theme & Logout */}
          <div className={`flex items-center justify-between px-2 pt-1 ${collapsed ? "flex-col gap-2" : ""}`}>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-xl p-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all"
              title={collapsed ? "Logout" : undefined}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// Nav Links Configuration
function getLinks(role: Props["role"]): NavLink[] {
  switch (role) {
    case "admin":
      return [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Doctors", href: "/admin/doctors", icon: Users },
        { label: "Departments", href: "/admin/departments", icon: Building2 },
        { label: "Patients", href: "/admin/patients", icon: UserCheck },
        { label: "My Profile", href: "/profile", icon: User },
      ];
    case "doctor":
      return [
        { label: "Dashboard", href: "/doctor", icon: LayoutDashboard },
        { label: "Appointments", href: "/doctor/appointments", icon: Calendar },
        { label: "Availability", href: "/doctor/availability", icon: Clock },
        { label: "My Patients", href: "/doctor/patients", icon: Users },
        { label: "My Profile", href: "/profile", icon: User },
      ];
    case "patient":
      return [
        { label: "Dashboard", href: "/patient", icon: LayoutDashboard },
        { label: "Appointments", href: "/patient/appointments", icon: Calendar },
        { label: "Medical Records", href: "/patient/medical-records", icon: HeartPulse },
        { label: "My Profile", href: "/profile", icon: User },
      ];
  }
}
