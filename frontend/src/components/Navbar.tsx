"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const links = [
    { href: "/dashboard", label: "Event Types" },
    { href: "/meetings", label: "Scheduled Events" },
    { href: "/availability", label: "Availability" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: "var(--color-border)", boxShadow: "var(--shadow-header)" }}>
      <div className="max-w-[1240px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center" aria-label="Calendly home">
            <Image
              src="/logos/Calendly_idA4lPSDzF_0.svg"
              alt="Calendly"
              width={128}
              height={30}
              priority
            />
          </Link>
          {session && (
            <nav className="hidden md:flex items-center gap-2">
              {links.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive ? "bg-[#e6f0ff] text-[#0b3558]" : "text-[#0b3558] hover:bg-[#f0f3f8]"}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full animate-pulse" style={{ backgroundColor: "#e7edf6" }} />
          ) : session?.user ? (
            <div
              onClick={() => void signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg transition-colors"
              style={{ color: "var(--color-text)" }}
              title="Click to Sign out"
            >
              {session.user.image ? (
                <Image src={session.user.image} alt={session.user.name || "User"} width={32} height={32} className="rounded-full border" style={{ borderColor: "var(--color-border)" }} />
              ) : (
                <div className="w-8 h-8 flex items-center justify-center font-semibold rounded-full text-sm" style={{ backgroundColor: "var(--color-surface-soft)", color: "var(--color-brand)" }}>
                  {session.user.name?.charAt(0) || "U"}
                </div>
              )}
              <span className="text-sm font-semibold hidden sm:block truncate max-w-[120px]" style={{ color: "var(--color-text)" }}>
                {session.user.name}
              </span>
            </div>
          ) : (
            <Link
              href="/login"
              className="cal-btn-primary"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
