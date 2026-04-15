"use client";

import Footer from "@/components/Footer";
import MarketingHeader from "@/components/MarketingHeader";
import {
  ArrowRight,
  Check,
  CreditCard,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    description: "For individuals just getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: "Sign up free",
    ctaStyle: "secondary" as const,
    features: [
      "1 event type",
      "Calendly-branded booking page",
      "Google Calendar sync",
      "Automatic timezone detection",
      "Email notifications",
    ],
  },
  {
    name: "Standard",
    description: "For individuals with more scheduling needs",
    monthlyPrice: 12,
    yearlyPrice: 10,
    cta: "Get started",
    ctaStyle: "primary" as const,
    featured: true,
    features: [
      "Unlimited event types",
      "Remove Calendly branding",
      "Custom booking links",
      "Buffer times & daily limits",
      "Group events",
      "Email reminders & follow-ups",
      "Calendar sync (Google, Outlook)",
      "Priority email support",
    ],
  },
  {
    name: "Teams",
    description: "For teams managing complex scheduling",
    monthlyPrice: 20,
    yearlyPrice: 16,
    cta: "Get started",
    ctaStyle: "primary" as const,
    features: [
      "Everything in Standard",
      "Round-robin scheduling",
      "Team availability pages",
      "Salesforce integration",
      "HubSpot integration",
      "Admin management console",
      "Team analytics & reporting",
      "Live chat support",
    ],
  },
  {
    name: "Enterprise",
    description: "For large organizations with advanced needs",
    monthlyPrice: null,
    yearlyPrice: null,
    cta: "Contact Sales",
    ctaStyle: "secondary" as const,
    features: [
      "Everything in Teams",
      "SSO / SAML authentication",
      "Advanced security & compliance",
      "Dedicated CSM",
      "Custom onboarding",
      "SLA guarantee",
      "Audit logs & governance",
      "Phone & priority support",
    ],
  },
];

const faqs = [
  {
    q: "Can I try Calendly before committing?",
    a: "Absolutely. Our Free plan has no time limit, and you can upgrade to Standard or Teams with a 14-day free trial.",
  },
  {
    q: "How does billing work?",
    a: "We offer both monthly and annual billing. Annual plans save you up to 20%. You can switch plans at any time.",
  },
  {
    q: "Can I cancel at any time?",
    a: "Yes. You can downgrade or cancel your subscription at any time — no questions asked, no hidden fees.",
  },
  {
    q: "What integrations are included?",
    a: "All plans include Google Calendar sync. Standard and above add Outlook, and Teams plan includes Salesforce, HubSpot, and more.",
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <main className="cal-shell">
      <MarketingHeader />

      {/* Hero */}
      <section className="cal-hero-gradient-light">
        <div className="mx-auto w-full max-w-[1240px] px-6 py-20 text-center lg:py-24">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide" style={{ backgroundColor: "#e6f0ff", color: "#004eba" }}>
            <CreditCard size={13} />
            Pricing
          </p>
          <h1 className="mx-auto mb-5 max-w-[780px] text-4xl font-bold leading-tight tracking-tight lg:text-[3.5rem]" style={{ color: "var(--color-text)" }}>
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mb-8 max-w-[620px] text-lg" style={{ color: "var(--color-text-muted)" }}>
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-semibold transition-colors ${!annual ? "text-[#006bff]" : ""}`} style={{ color: annual ? "var(--color-text-muted)" : undefined }}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative h-7 w-12 rounded-full transition-colors"
              style={{ backgroundColor: annual ? "#006bff" : "#d2dce8" }}
            >
              <span
                className="absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white transition-transform shadow-sm"
                style={{ left: annual ? "calc(100% - 25px)" : "3px" }}
              />
            </button>
            <span className={`text-sm font-semibold transition-colors ${annual ? "text-[#006bff]" : ""}`} style={{ color: !annual ? "var(--color-text-muted)" : undefined }}>
              Annual
            </span>
            {annual && (
              <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ backgroundColor: "#e6f0ff", color: "#006bff" }}>
                Save 20%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto w-full max-w-[1280px] px-4 pb-16 -mt-4 sm:px-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`animate-fade-in-up ${plan.featured ? "cal-pricing-card-featured" : "cal-pricing-card"}`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: "#006bff" }}>
                    <Sparkles size={11} /> Most popular
                  </span>
                </div>
              )}

              <h3 className="mb-1 text-lg font-bold" style={{ color: "var(--color-text)" }}>{plan.name}</h3>
              <p className="mb-4 text-sm" style={{ color: "var(--color-text-muted)" }}>{plan.description}</p>

              <div className="mb-5">
                {plan.monthlyPrice !== null ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold" style={{ color: "var(--color-text)" }}>
                      ${annual ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                      /seat/mo
                    </span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>Custom</p>
                )}
                {plan.monthlyPrice !== null && annual && plan.monthlyPrice !== plan.yearlyPrice && (
                  <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                    billed annually (${plan.yearlyPrice! * 12}/yr)
                  </p>
                )}
              </div>

              <Link
                href="/signup"
                className={plan.ctaStyle === "primary" ? "cal-btn-primary w-full mb-6" : "cal-btn-secondary w-full mb-6"}
              >
                {plan.cta} {plan.ctaStyle === "primary" && <ArrowRight size={15} />}
              </Link>

              <ul className="space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check size={15} className="mt-0.5 shrink-0" style={{ color: "#2f9e44" }} />
                    <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y" style={{ borderColor: "var(--color-border)", backgroundColor: "#fbfcff" }}>
        <div className="mx-auto w-full max-w-[820px] px-6 py-16">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: "#e6f0ff", color: "#006bff" }}>
              <HelpCircle size={20} />
            </div>
            <h2 className="cal-heading-lg text-3xl">Frequently asked questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="cal-card p-5">
                <h3 className="mb-2 text-[15px] font-bold" style={{ color: "var(--color-text)" }}>
                  {faq.q}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-[1240px] px-6 py-16">
        <div className="cal-card p-8 text-center lg:p-12">
          <h2 className="cal-heading-lg mb-3 text-3xl">Start scheduling smarter today</h2>
          <p className="mx-auto mb-7 max-w-[580px] text-base" style={{ color: "var(--color-text-muted)" }}>
            Join millions of professionals using Calendly to save time and book more meetings.
          </p>
          <Link href="/signup" className="cal-btn-primary px-6 py-3 text-base">
            Get started free <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
