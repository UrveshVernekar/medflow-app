// app/(dashboard)/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/sidebar"; // Make sure path is correct

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role as "admin" | "doctor" | "patient";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Fixed height, no scrolling of entire sidebar */}
      <AppSidebar role={role} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Optional Top Header Bar */}
        {/* You can add notifications, user profile, theme toggle (if you want to move it here), etc. later */}
        {/* <header className="h-25 border-b bg-card/80 backdrop-blur-sm flex items-center px-6 shrink-0">
          <div className="flex-1" /> */}
        {/* Example: You can put global header items here */}
        {/* </header> */}

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
