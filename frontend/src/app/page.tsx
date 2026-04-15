import Footer from "@/components/Footer";
import MarketingHeader from "@/components/MarketingHeader";
import {
    ArrowRight,
    Calendar,
    CheckCircle2,
    Clock3,
    Globe2,
    ShieldCheck,
    Sparkles,
    Users,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Calendar,
    title: "Easy event scheduling",
    description:
      "Create event types in minutes and share one link so invitees can book instantly.",
  },
  {
    icon: Globe2,
    title: "Timezone-aware booking",
    description:
      "Show each invitee times in their own timezone automatically to avoid confusion.",
  },
  {
    icon: ShieldCheck,
    title: "No double-booking",
    description:
      "Connected calendar checks keep your availability accurate and your schedule protected.",
  },
  {
    icon: Clock3,
    title: "Buffers and limits",
    description:
      "Control prep time and meeting load with per-event buffers and booking rules.",
  },
  {
    icon: Users,
    title: "Built for teams",
    description:
      "Manage member schedules and share consistent booking experiences across your workspace.",
  },
  {
    icon: Sparkles,
    title: "Professional experience",
    description:
      "Deliver a polished booking flow from first click to confirmation and calendar invite.",
  },
];

const eventPreview = [
  { title: "15 Minute Meeting", duration: "15 min", color: "#006bff" },
  { title: "30 Minute Consultation", duration: "30 min", color: "#26a0f5" },
  { title: "Discovery Call", duration: "60 min", color: "#0b3558" },
];

const howItWorks = [
  {
    step: "1",
    title: "Create your events",
    description: "Set up event types with your preferred duration, buffers, and availability windows.",
  },
  {
    step: "2",
    title: "Share your link",
    description: "Send your unique Calendly link via email, embed it on your site, or add it to your socials.",
  },
  {
    step: "3",
    title: "Get booked",
    description: "Invitees pick a time that works. You get calendar invites and meeting details automatically.",
  },
];

const trustLogos = ["Zoom", "HubSpot", "Salesforce", "Stripe", "Intercom", "Slack", "Notion", "Linear"];

export default function Home() {
  return (
    <main className="cal-shell">
      {/* ─── Header ─── */}
      <MarketingHeader />

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: "linear-gradient(135deg, #f0f6ff 0%, #e6f0ff 40%, #dce9ff 70%, #f8f9fb 100%)",
          }}
        />
        <div
          className="absolute right-0 top-0 -z-10 h-[600px] w-[600px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #006bff 0%, transparent 70%)" }}
        />

        <div className="mx-auto w-full max-w-[1240px] px-6 pb-16 pt-16 lg:pb-24 lg:pt-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="animate-fade-in-up flex flex-col items-center text-center lg:items-start lg:text-left">
              <p
                className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide"
                style={{ backgroundColor: "#e6f0ff", color: "#004eba" }}
              >
                <Sparkles size={13} />
                New: Scheduling automation for teams
              </p>
              <h1
                className="mb-5 max-w-[640px] text-[2.6rem] font-bold leading-[1.08] tracking-tight lg:text-[3.75rem]"
                style={{ color: "var(--color-text)" }}
              >
                Easy scheduling ahead
              </h1>
              <p className="mb-8 max-w-[560px] text-lg leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                Calendly is your scheduling automation platform for eliminating back-and-forth emails,
                so your team can focus on higher impact work.
              </p>
              <div className="flex w-full max-w-[520px] flex-nowrap items-center gap-2 sm:gap-3">
                <Link href="/signup" className="cal-btn-primary h-[56px] sm:h-[60px] min-w-0 flex-1 justify-center px-3 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base">
                  Start for free <ArrowRight size={17} />
                </Link>
                <Link href="/dashboard" className="cal-btn-secondary h-[56px] sm:h-[60px] min-w-0 flex-1 justify-center px-3 py-2.5 sm:px-6 sm:py-3">
                  <span className="flex flex-col items-center leading-tight">
                    <span className="text-sm sm:text-base">Open dashboard</span>
                    <span
                      className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: "#1d63d1" }}
                    >
                      No log in required
                    </span>
                  </span>
                </Link>
              </div>
            </div>

            <div className="animate-fade-in-up animate-delay-200">
              <div className="cal-card overflow-hidden">
                <div className="border-b p-5" style={{ borderColor: "var(--color-border)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                    Your event types
                  </p>
                  <h3 className="mt-1 text-lg font-semibold" style={{ color: "var(--color-text)" }}>
                    Your Name
                  </h3>
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    calendly.com/your-name
                  </p>
                </div>
                <div className="space-y-3 p-5">
                  {eventPreview.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center gap-3 rounded-lg border px-3 py-3 transition-all duration-200 hover:bg-[#f8fbff] hover:shadow-sm"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <span className="h-10 w-1 rounded-full" style={{ backgroundColor: item.color }} />
                      <div className="flex-1">
                        <p className="text-[15px] font-semibold" style={{ color: "var(--color-text)" }}>
                          {item.title}
                        </p>
                        <p className="flex items-center gap-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                          <Clock3 size={13} /> {item.duration}
                        </p>
                      </div>
                      <ArrowRight size={16} style={{ color: "var(--color-text-muted)" }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust logos ─── */}
      <section className="border-y bg-white" style={{ borderColor: "var(--color-border)" }}>
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center justify-between gap-4 px-6 py-8">
          <span className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
            Trusted by modern teams
          </span>
          <div className="flex flex-wrap items-center gap-8">
            {trustLogos.map((logo) => (
              <span
                key={logo}
                className="text-[13px] font-bold uppercase tracking-wider"
                style={{ color: "#9cb0c6" }}
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="mx-auto w-full max-w-[1240px] px-6 py-16 lg:py-20">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-brand)" }}>
            How it works
          </p>
          <h2 className="cal-heading-lg mb-3 text-3xl lg:text-4xl">Start scheduling in 3 easy steps</h2>
          <p className="mx-auto max-w-[620px] text-base" style={{ color: "var(--color-text-muted)" }}>
            Set up once and let Calendly handle the rest — from booking to calendar sync.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {howItWorks.map((item, index) => (
            <div key={item.step} className="animate-fade-in-up text-center" style={{ animationDelay: `${index * 0.15}s` }}>
              <div
                className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold"
                style={{ backgroundColor: "#e6f0ff", color: "#006bff" }}
              >
                {item.step}
              </div>
              <h3 className="mb-2 text-lg font-bold" style={{ color: "var(--color-text)" }}>
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section
        className="border-y"
        style={{ borderColor: "var(--color-border)", backgroundColor: "#fbfcff" }}
      >
        <div className="mx-auto w-full max-w-[1240px] px-6 py-16 lg:py-20">
          <div className="mb-10">
            <h2 className="cal-heading-lg mb-3 text-3xl lg:text-4xl">Everything you need to schedule at scale</h2>
            <p className="max-w-[720px] text-base" style={{ color: "var(--color-text-muted)" }}>
              Powerful scheduling controls, invitee-friendly booking pages, and reliable calendar sync in one clean workflow.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="cal-card-hover p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: "#e6f0ff", color: "#006bff" }}>
                  <feature.icon size={20} />
                </div>
                <h3 className="mb-2 text-[1.06rem] font-bold" style={{ color: "var(--color-text)" }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="mx-auto w-full max-w-[1240px] px-6 py-16 lg:py-20">
        <div
          className="relative overflow-hidden rounded-2xl p-8 text-center lg:p-14"
          style={{
            background: "linear-gradient(135deg, #001d3d 0%, #003566 40%, #004eba 100%)",
          }}
        >
          {/* Decorative orbs */}
          <div
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-15 blur-3xl"
            style={{ background: "#006bff" }}
          />
          <div
            className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full opacity-10 blur-3xl"
            style={{ background: "#0099ff" }}
          />

          <div className="relative z-10">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <CheckCircle2 size={26} className="text-white" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-white lg:text-4xl">
              Book more meetings with less effort
            </h2>
            <p className="mx-auto mb-8 max-w-[580px] text-base text-white/70">
              Build your profile, set availability, and share your link in minutes. No more scheduling ping-pong.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold transition-all hover:shadow-lg"
                style={{ color: "#006bff" }}
              >
                Sign up free <ArrowRight size={17} />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white/10"
              >
                Go to dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <Footer />
    </main>
  );
}
