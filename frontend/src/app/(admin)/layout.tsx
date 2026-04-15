"use client";

import Sidebar from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ToastProvider>
      <div className="cal-shell">
        <Sidebar />
        {/* Main content area — offset for sidebar on desktop, offset for topbar on mobile */}
        <main className="lg:pl-64 pt-14 lg:pt-0 min-h-screen">
          <div className="max-w-[1040px] mx-auto p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
