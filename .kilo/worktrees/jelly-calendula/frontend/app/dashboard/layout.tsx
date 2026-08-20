import React from "react";
import TopBar from "@/components/dashboard/TopBar";
import Sidebar from "@/components/dashboard/Sidebar";
import TabBar from "@/components/dashboard/TabBar";
import AuthGuard from "@/components/dashboard/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      {/* Fixed viewport height prevents full-page scrolling */}
      <div className="h-screen w-screen overflow-hidden  flex flex-col text-zinc-900 dark:text-zinc-100 transition-colors">
        {/* 1. Top Bar stays fixed at the top */}
        <TopBar />

        <div className="flex flex-1 h-[calc(100vh-4rem)] relative overflow-hidden">
          {/* 2. Desktop Sidebar stays fixed on the left */}
          <Sidebar />

          {/* 3. Main Workspace area scrolls independently */}
          <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>

        {/* 4. Mobile Bottom Tab Bar stays fixed at the bottom */}
        <TabBar />
      </div>
    </AuthGuard>
  );
}