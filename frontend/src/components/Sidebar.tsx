"use client";

import {
  CalendarDays,
  Check,
  Clock,
  Copy,
  LayoutDashboard,
  Menu,
  Plus,
  Settings,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Event Types", icon: LayoutDashboard },
  { href: "/meetings", label: "Scheduled Events", icon: CalendarDays },
  { href: "/availability", label: "Availability", icon: Clock },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${session?.user?.name?.toLowerCase().replace(/\s+/g, "-") || "me"}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b" style={{ borderColor: "var(--color-border)" }}>
        <Link href="/" className="flex items-center" aria-label="Calendly home">
          <Image
            src="/logos/Calendly_idA4lPSDzF_0.svg"
            alt="Calendly"
            width={128}
            height={30}
            priority
          />
        </Link>
      </div>

      {/* Profile area */}
      {session?.user && (
        <div className="px-5 py-5 border-b" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-3 mb-3">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={40}
                height={40}
                className="rounded-full border"
                style={{ borderColor: "var(--color-border)" }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg" style={{ backgroundColor: "var(--color-surface-soft)", color: "var(--color-brand)" }}>
                {session.user.name?.charAt(0) || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text)" }}>{session.user.name}</p>
              <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>{session.user.email}</p>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-2 text-xs rounded-lg px-3 py-2 transition-colors border"
            style={{
              color: "var(--color-text-muted)",
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            <span className="truncate">{copied ? "Copied!" : "Copy your Calendly link"}</span>
          </button>
        </div>
      )}

      <div className="px-5 pt-5 pb-3">
        <Link
          href="/dashboard"
          onClick={() => {
            // Will trigger modal via query param or state
            if (pathname === "/dashboard") {
              window.dispatchEvent(new CustomEvent("open-create-modal"));
            }
          }}
          className="cal-btn-primary w-full"
        >
          <Plus size={18} /> Create
        </Link>
      </div>

      <nav className="flex-1 px-2 pb-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`mx-2 mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${isActive ? "bg-[#e6f0ff] text-[#0b3558]" : "text-[#0b3558] hover:bg-[#f0f3f8]"}`}
            >
              <item.icon size={17} className={isActive ? "text-[#006bff]" : "text-[#476788]"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t" style={{ borderColor: "var(--color-border)" }}>
        <button
          onClick={() => void signOut({ callbackUrl: "/" })}
          className="w-full text-left text-sm font-medium transition-colors"
          style={{ color: "var(--color-text-muted)" }}
        >
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white z-40 flex items-center justify-between px-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <Link href="/" className="flex items-center" aria-label="Calendly home">
          <Image
            src="/logos/Calendly_idA4lPSDzF_0.svg"
            alt="Calendly"
            width={116}
            height={28}
            priority
          />
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2" style={{ color: "var(--color-text)" }}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {sidebarContent}
      </div>

      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r z-30" style={{ borderColor: "var(--color-border)" }}>
        {sidebarContent}
      </aside>
    </>
  );
}
