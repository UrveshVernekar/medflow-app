// components/sidebar.tsx
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
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Menu,
  LogOut,
  Building2,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

type Props = {
  role: "admin" | "doctor" | "patient";
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

export function AppSidebar({ role }: Props) {
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

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <aside
      className={`hidden md:flex h-screen border-r bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl flex-col transition-all duration-300 shadow-2xl shrink-0 z-40 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-6 py-7 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center shadow-lg">
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
      <nav className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        <div className="space-y-1.5">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  group flex items-center gap-4 rounded-2xl px-5 py-4 text-[15px] font-medium transition-all duration-200
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
        </div>
      </nav>

      {/* Footer Section */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 mt-auto">
        {/* Theme Toggle */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
        </div>

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-3.5 rounded-2xl px-5 py-4 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 transition-all active:scale-[0.985]"
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {!collapsed && (
          <div className="px-6 pb-6 text-center">
            <p className="text-[10px] text-zinc-400 dark:text-zinc-600 tracking-widest">
              © {new Date().getFullYear()} MedFlow • Healthcare Platform
            </p>
          </div>
        )}
      </div>
    </aside>
  );

  // Mobile Drawer
  const MobileDrawer = () => (
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
        className="w-72 p-0 border-r bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl"
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
        <nav className="flex-1 overflow-y-auto p-5">
          <div className="space-y-1.5">
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
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 mt-auto">
          <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-center">
            <ThemeToggle />
          </div>

          <div className="p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-3.5 rounded-2xl px-5 py-4 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 transition-all"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>

          <div className="px-6 pb-6 text-center">
            <p className="text-[10px] text-zinc-400 dark:text-zinc-600 tracking-widest">
              © {new Date().getFullYear()} MedFlow
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <MobileDrawer />
      <DesktopSidebar />
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
        // { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      ];
    case "doctor":
      return [
        { label: "Dashboard", href: "/doctor", icon: LayoutDashboard },
        { label: "Appointments", href: "/doctor/appointments", icon: Calendar },
        { label: "Availability", href: "/doctor/availability", icon: Clock },
        { label: "My Patients", href: "/doctor/patients", icon: Users },
      ];
    case "patient":
      return [
        { label: "Dashboard", href: "/patient", icon: LayoutDashboard },
        {
          label: "Appointments",
          href: "/patient/appointments",
          icon: Calendar,
        },
        // { label: "Medical Records", href: "/patient/records", icon: FileText },
      ];
  }
}
