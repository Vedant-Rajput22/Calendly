"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Product", href: "/product" },
  { label: "Solutions", href: "/solutions" },
  { label: "Enterprise", href: "/enterprise" },
  { label: "Resources", href: "/resources" },
  { label: "Pricing", href: "/pricing" },
];

export default function MarketingHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="cal-marketing-header">
        <div className="mx-auto flex h-[72px] w-full max-w-[1240px] items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/" aria-label="Calendly home">
              <Image
                src="/logos/Calendly_idA4lPSDzF_0.svg"
                alt="Calendly"
                width={128}
                height={30}
                style={{ height: "auto" }}
                priority
              />
            </Link>
            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-[#f0f3f8] ${isActive ? "bg-[#e6f0ff]" : ""}`}
                    style={{ color: isActive ? "#006bff" : "var(--color-text)" }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="cal-btn-secondary hidden sm:inline-flex">
              Log in
            </Link>
            <Link href="/signup" className="cal-btn-primary">
              Get started
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 lg:hidden"
              style={{ color: "var(--color-text)" }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed left-0 right-0 top-[72px] z-50 border-b bg-white p-4 shadow-lg lg:hidden" style={{ borderColor: "var(--color-border)" }}>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${isActive ? "bg-[#e6f0ff] text-[#006bff]" : "hover:bg-[#f0f3f8]"}`}
                    style={{ color: isActive ? "#006bff" : "var(--color-text)" }}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-2 border-t pt-3" style={{ borderColor: "var(--color-border)" }}>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-4 py-3 text-sm font-semibold transition-colors hover:bg-[#f0f3f8]"
                  style={{ color: "var(--color-text)" }}
                >
                  Log in
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
