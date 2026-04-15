import Footer from "@/components/Footer";
import MarketingHeader from "@/components/MarketingHeader";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  HeadphonesIcon,
  Megaphone,
  Target,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

const solutions = [
  {
    id: "sales",
    icon: TrendingUp,
    title: "Sales",
    tagline: "Accelerate your pipeline",
    description: "Reduce friction in the sales cycle by letting prospects book demos and discovery calls instantly. Integrate with your CRM and automate follow-ups.",
    highlights: ["Instant lead routing", "CRM auto-sync", "Pipeline acceleration", "Branded booking pages"],
    color: "#006bff",
    bg: "#e6f0ff",
  },
  {
    id: "marketing",
    icon: Megaphone,
    title: "Marketing",
    tagline: "Convert more leads",
    description: "Embed scheduling on landing pages and campaigns. Eliminate form-to-meeting friction and capture high-intent leads while they're engaged.",
    highlights: ["Landing page embeds", "UTM tracking", "Conversion analytics", "Automated nurture"],
    color: "#7048e8",
    bg: "#ede8ff",
  },
  {
    id: "customer-success",
    icon: HeadphonesIcon,
    title: "Customer Success",
    tagline: "Delight your customers",
    description: "Make it effortless for customers to schedule onboarding sessions, check-ins, and support calls. Reduce churn with proactive engagement.",
    highlights: ["Onboarding flows", "Renewal scheduling", "QBR automation", "CSAT integration"],
    color: "#2f9e44",
    bg: "#e8f5ec",
  },
  {
    id: "recruiting",
    icon: UserCheck,
    title: "Recruiting",
    tagline: "Hire faster",
    description: "Simplify interview scheduling across panels and timezones. Candidates self-schedule, interviewers stay focused, and hiring moves faster.",
    highlights: ["Panel scheduling", "Candidate self-serve", "ATS integration", "Time zone support"],
    color: "#f08c00",
    bg: "#fff4e0",
  },
  {
    id: "it",
    icon: Briefcase,
    title: "Information Technology",
    tagline: "Secure and scalable",
    description: "Enterprise-grade security, SSO integration, and centralized admin controls. Deploy Calendly across your organization with confidence.",
    highlights: ["SSO / SAML", "Admin console", "Audit logs", "Data governance"],
    color: "#0b3558",
    bg: "#e7edf6",
  },
];

export default function SolutionsPage() {
  return (
    <main className="cal-shell">
      <MarketingHeader />

      {/* Hero */}
      <section className="cal-hero-gradient-light">
        <div className="mx-auto w-full max-w-[1240px] px-6 py-20 text-center lg:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide" style={{ backgroundColor: "#e6f0ff", color: "#004eba" }}>
            <Target size={13} />
            Solutions
          </p>
          <h1 className="mx-auto mb-5 max-w-[780px] text-4xl font-bold leading-tight tracking-tight lg:text-[3.5rem]" style={{ color: "var(--color-text)" }}>
            Solutions for every team
          </h1>
          <p className="mx-auto mb-8 max-w-[620px] text-lg" style={{ color: "var(--color-text-muted)" }}>
            Whether you&apos;re in sales, marketing, support, or recruiting — Calendly adapts to how your team works and helps you schedule smarter.
          </p>
          <Link href="/signup" className="cal-btn-primary px-6 py-3 text-base">
            Get started free <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Solution Cards */}
      <section className="mx-auto w-full max-w-[1240px] px-6 py-16 lg:py-20">
        <div className="space-y-8">
          {solutions.map((sol, index) => (
            <article
              key={sol.id}
              id={sol.id}
              className="cal-card overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="grid md:grid-cols-[1fr_1.2fr]">
                {/* Left: content */}
                <div className="p-6 lg:p-8">
                  <div
                    className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: sol.bg, color: sol.color }}
                  >
                    <sol.icon size={24} />
                  </div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: sol.color }}>
                    {sol.tagline}
                  </p>
                  <h2 className="mb-3 text-2xl font-bold" style={{ color: "var(--color-text)" }}>
                    {sol.title}
                  </h2>
                  <p className="mb-5 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    {sol.description}
                  </p>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1 text-sm font-semibold transition-colors hover:underline"
                    style={{ color: sol.color }}
                  >
                    Learn more <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Right: highlights */}
                <div
                  className="flex items-center border-t p-6 md:border-l md:border-t-0 lg:p-8"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "#fbfcff" }}
                >
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {sol.highlights.map((h) => (
                      <div key={h} className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: sol.color }} />
                        <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-[1240px] px-6 pb-16">
        <div
          className="relative overflow-hidden rounded-2xl p-8 text-center lg:p-14"
          style={{ background: "linear-gradient(135deg, #001d3d 0%, #003566 40%, #004eba 100%)" }}
        >
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-15 blur-3xl" style={{ background: "#006bff" }} />
          <div className="relative z-10">
            <h2 className="mb-3 text-3xl font-bold text-white lg:text-4xl">
              Find the right solution for your team
            </h2>
            <p className="mx-auto mb-8 max-w-[580px] text-base text-white/70">
              See how Calendly can transform the way your team schedules meetings.
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
                href="/enterprise"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white/10"
              >
                Enterprise plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
