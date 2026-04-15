import Footer from "@/components/Footer";
import MarketingHeader from "@/components/MarketingHeader";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  FileText,
  Globe2,
  Lock,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: ShieldCheck,
    title: "Enterprise-grade Security",
    description: "SOC 2 Type II certified, GDPR compliant, and data encrypted at rest and in transit.",
  },
  {
    icon: Lock,
    title: "SSO / SAML Integration",
    description: "Single sign-on with Okta, Azure AD, OneLogin, and other identity providers.",
  },
  {
    icon: Settings2,
    title: "Admin Console",
    description: "Centralized control over user provisioning, permissions, and organization-wide settings.",
  },
  {
    icon: FileText,
    title: "Audit Logs",
    description: "Complete visibility into user actions and scheduling changes for compliance reporting.",
  },
  {
    icon: Users,
    title: "Advanced Team Features",
    description: "Round-robin routing, managed events, and team-level analytics across your entire organization.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    description: "Custom dashboards and exportable reports to measure scheduling impact across teams.",
  },
  {
    icon: Globe2,
    title: "Global Deployment",
    description: "Multi-region availability with 99.99% uptime SLA and dedicated infrastructure options.",
  },
  {
    icon: Building2,
    title: "Dedicated Support",
    description: "Priority support with a dedicated customer success manager and onboarding assistance.",
  },
];

const logos = ["Fortune 500", "Tech Giants", "Global Banks", "Healthcare Systems", "Government Agencies"];

export default function EnterprisePage() {
  return (
    <main className="cal-shell">
      <MarketingHeader />

      {/* Hero */}
      <section className="cal-hero-gradient">
        <div className="mx-auto w-full max-w-[1240px] px-6 py-20 text-center lg:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/80">
            <Building2 size={13} />
            Enterprise
          </p>
          <h1 className="mx-auto mb-5 max-w-[780px] text-4xl font-bold leading-tight tracking-tight text-white lg:text-[3.5rem]">
            Scheduling for the enterprise
          </h1>
          <p className="mx-auto mb-8 max-w-[620px] text-lg text-white/70">
            Secure, scalable, and compliant. Deploy Calendly to thousands of employees with enterprise-grade controls and dedicated support.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold transition-all hover:shadow-lg"
              style={{ color: "#006bff" }}
            >
              Contact Sales <ArrowRight size={17} />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              View plans
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="border-b bg-white" style={{ borderColor: "var(--color-border)" }}>
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center justify-center gap-8 px-6 py-10">
          {logos.map((logo) => (
            <span key={logo} className="text-sm font-bold uppercase tracking-wider" style={{ color: "#9cb0c6" }}>
              {logo}
            </span>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="security" className="mx-auto w-full max-w-[1240px] px-6 py-16 lg:py-20">
        <div className="mb-10 text-center">
          <h2 className="cal-heading-lg mb-3 text-3xl lg:text-4xl">
            Built for scale, designed for security
          </h2>
          <p className="mx-auto max-w-[680px] text-base" style={{ color: "var(--color-text-muted)" }}>
            Enterprise features that IT teams trust and employees love.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="cal-card-hover p-5 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <div
                className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#e6f0ff", color: "#006bff" }}
              >
                <feature.icon size={20} />
              </div>
              <h3 className="mb-1.5 text-[15px] font-bold" style={{ color: "var(--color-text)" }}>
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Security Highlights */}
      <section className="border-y" style={{ borderColor: "var(--color-border)", backgroundColor: "#fbfcff" }}>
        <div className="mx-auto w-full max-w-[1240px] px-6 py-16">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-brand)" }}>
                Security & Compliance
              </p>
              <h2 className="mb-4 text-3xl font-bold" style={{ color: "var(--color-text)" }}>
                Your data, protected at every layer
              </h2>
              <p className="mb-6 text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                We take security seriously. From end-to-end encryption to regular penetration testing, every layer of our platform is designed to keep your data safe.
              </p>
              <Link href="/signup" className="cal-btn-primary">
                Request a demo <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "SOC 2 Type II", desc: "Certified compliant" },
                { label: "GDPR", desc: "EU data protection" },
                { label: "CCPA", desc: "California privacy" },
                { label: "ISO 27001", desc: "Information security" },
              ].map((cert) => (
                <div key={cert.label} className="cal-card p-4 text-center">
                  <CheckCircle2 size={20} className="mx-auto mb-2" style={{ color: "#2f9e44" }} />
                  <p className="text-sm font-bold" style={{ color: "var(--color-text)" }}>{cert.label}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{cert.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-[1240px] px-6 py-16">
        <div className="cal-card p-8 text-center lg:p-12">
          <h2 className="cal-heading-lg mb-3 text-3xl">Ready for enterprise scheduling?</h2>
          <p className="mx-auto mb-7 max-w-[580px] text-base" style={{ color: "var(--color-text-muted)" }}>
            Let us show you how Calendly can transform scheduling across your organization.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className="cal-btn-primary px-6 py-3 text-base">
              Contact Sales <ArrowRight size={17} />
            </Link>
            <Link href="/pricing" className="cal-btn-secondary px-6 py-3 text-base">
              View pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
