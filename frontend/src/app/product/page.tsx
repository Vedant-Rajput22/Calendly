import Footer from "@/components/Footer";
import MarketingHeader from "@/components/MarketingHeader";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  Clock3,
  Globe2,
  Link2,
  Palette,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

const capabilities = [
  {
    icon: Calendar,
    title: "Flexible Event Types",
    description: "One-on-one, group, round-robin, and collective meetings. Handle any scheduling scenario with ease.",
  },
  {
    icon: Clock3,
    title: "Smart Availability",
    description: "Set working hours, add buffers, enforce daily limits, and define date-specific overrides.",
  },
  {
    icon: Globe2,
    title: "Timezone Intelligence",
    description: "Automatically detect and display times in each invitee's local timezone for seamless global scheduling.",
  },
  {
    icon: Link2,
    title: "Booking Links",
    description: "Share a single link or embed your scheduling page directly on your website.",
  },
  {
    icon: Bell,
    title: "Automated Notifications",
    description: "Confirmation emails, reminders, and follow-ups sent automatically — no manual effort required.",
  },
  {
    icon: ShieldCheck,
    title: "Calendar Sync",
    description: "Connect Google Calendar, Outlook, or iCloud to prevent double-bookings in real time.",
  },
  {
    icon: BarChart3,
    title: "Scheduling Analytics",
    description: "Track booked meetings, popular time slots, and conversion rates with built-in dashboards.",
  },
  {
    icon: Palette,
    title: "Brand Customization",
    description: "Customize colors, logos, and booking page layouts to match your professional brand.",
  },
  {
    icon: Zap,
    title: "Workflow Automations",
    description: "Trigger actions before and after events — send forms, SMS reminders, or CRM updates automatically.",
  },
  {
    icon: Users,
    title: "Team Scheduling",
    description: "Route meetings across team members, balance loads, and manage availability at the team level.",
  },
];

export default function ProductPage() {
  return (
    <main className="cal-shell">
      <MarketingHeader />

      {/* Hero */}
      <section className="cal-hero-gradient">
        <div className="mx-auto w-full max-w-[1240px] px-6 py-20 text-center lg:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/80">
            <Calendar size={13} />
            Product Overview
          </p>
          <h1 className="mx-auto mb-5 max-w-[780px] text-4xl font-bold leading-tight tracking-tight text-white lg:text-[3.5rem]">
            The scheduling platform that works for you
          </h1>
          <p className="mx-auto mb-8 max-w-[620px] text-lg text-white/70">
            From simple one-on-one bookings to complex team scheduling workflows, Calendly handles it all so you can focus on what matters.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold transition-all hover:shadow-lg"
              style={{ color: "#006bff" }}
            >
              Start for free <ArrowRight size={17} />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="mx-auto w-full max-w-[1240px] px-6 py-16 lg:py-20">
        <div className="mb-10 text-center">
          <h2 className="cal-heading-lg mb-3 text-3xl lg:text-4xl">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="mx-auto max-w-[680px] text-base" style={{ color: "var(--color-text-muted)" }}>
            A comprehensive scheduling toolkit — powerful enough for enterprise teams, simple enough for individuals.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2">
          {capabilities.map((cap, index) => (
            <article
              key={cap.title}
              className="cal-card-hover flex gap-4 p-5 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#e6f0ff", color: "#006bff" }}
              >
                <cap.icon size={20} />
              </div>
              <div>
                <h3 className="mb-1 text-[15px] font-bold" style={{ color: "var(--color-text)" }}>
                  {cap.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {cap.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y" style={{ borderColor: "var(--color-border)", backgroundColor: "#fbfcff" }}>
        <div className="mx-auto w-full max-w-[1240px] px-6 py-14">
          <div className="grid gap-8 text-center sm:grid-cols-3">
            {[
              { value: "10M+", label: "meetings booked monthly" },
              { value: "100K+", label: "companies worldwide" },
              { value: "99.9%", label: "uptime guarantee" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="mb-1 text-4xl font-bold" style={{ color: "var(--color-brand)" }}>{stat.value}</p>
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-[1240px] px-6 py-16">
        <div className="cal-card p-8 text-center lg:p-12">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: "#e6f0ff", color: "#006bff" }}>
            <CheckCircle2 size={24} />
          </div>
          <h2 className="cal-heading-lg mb-3 text-3xl">Ready to simplify scheduling?</h2>
          <p className="mx-auto mb-7 max-w-[580px] text-base" style={{ color: "var(--color-text-muted)" }}>
            Join millions of professionals who save hours every week with Calendly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className="cal-btn-primary px-6 py-3 text-base">
              Sign up free <ArrowRight size={17} />
            </Link>
            <Link href="/dashboard" className="cal-btn-secondary px-6 py-3 text-base">
              Go to dashboard
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
