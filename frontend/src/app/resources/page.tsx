import Footer from "@/components/Footer";
import MarketingHeader from "@/components/MarketingHeader";
import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  FileText,
  GraduationCap,
  Headphones,
  MessageSquare,
  Newspaper,
  Play,
  Star,
  Video,
} from "lucide-react";
import Link from "next/link";

const resourceCategories = [
  {
    id: "blog",
    icon: Newspaper,
    title: "Blog",
    description: "Tips, trends, and best practices for modern scheduling and productivity.",
    articles: [
      { title: "10 Ways to Reduce No-Shows", tag: "Scheduling" },
      { title: "The Future of Async Work", tag: "Productivity" },
      { title: "How Top Sales Teams Use Calendly", tag: "Sales" },
    ],
    color: "#006bff",
    bg: "#e6f0ff",
  },
  {
    id: "guides",
    icon: BookOpen,
    title: "Guides & eBooks",
    description: "In-depth playbooks to get the most out of Calendly for your team.",
    articles: [
      { title: "Getting Started with Calendly", tag: "Setup" },
      { title: "Team Scheduling Playbook", tag: "Teams" },
      { title: "Enterprise Deployment Guide", tag: "Enterprise" },
    ],
    color: "#7048e8",
    bg: "#ede8ff",
  },
  {
    id: "webinars",
    icon: Video,
    title: "Webinars",
    description: "Live and on-demand sessions with scheduling experts and product walkthroughs.",
    articles: [
      { title: "Advanced Routing Workflows", tag: "Live" },
      { title: "Calendly for CS Teams", tag: "On-demand" },
      { title: "Scheduling Analytics Deep Dive", tag: "On-demand" },
    ],
    color: "#e64980",
    bg: "#fde8ef",
  },
  {
    id: "stories",
    icon: Star,
    title: "Customer Stories",
    description: "See how real companies transformed their scheduling workflows with Calendly.",
    articles: [
      { title: "How Acme Doubled Demo Bookings", tag: "Sales" },
      { title: "Recruiting 3x Faster at TechCorp", tag: "HR" },
      { title: "Support CSAT +20% at HelpDesk Co", tag: "CS" },
    ],
    color: "#f08c00",
    bg: "#fff4e0",
  },
];

const quickLinks = [
  { icon: GraduationCap, label: "Help Center", desc: "Search our docs" },
  { icon: Play, label: "Video Tutorials", desc: "Watch and learn" },
  { icon: MessageSquare, label: "Community", desc: "Join the conversation" },
  { icon: Headphones, label: "Contact Support", desc: "Get help now" },
];

export default function ResourcesPage() {
  return (
    <main className="cal-shell">
      <MarketingHeader />

      {/* Hero */}
      <section className="cal-hero-gradient-light">
        <div className="mx-auto w-full max-w-[1240px] px-6 py-20 text-center lg:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide" style={{ backgroundColor: "#e6f0ff", color: "#004eba" }}>
            <FileText size={13} />
            Resources
          </p>
          <h1 className="mx-auto mb-5 max-w-[780px] text-4xl font-bold leading-tight tracking-tight lg:text-[3.5rem]" style={{ color: "var(--color-text)" }}>
            Resources & learning
          </h1>
          <p className="mx-auto mb-8 max-w-[620px] text-lg" style={{ color: "var(--color-text-muted)" }}>
            Everything you need to master scheduling — from quick-start guides to deep-dive webinars and real customer stories.
          </p>
        </div>
      </section>

      {/* Quick Links Bar */}
      <section className="border-y bg-white" style={{ borderColor: "var(--color-border)" }}>
        <div className="mx-auto w-full max-w-[1240px] px-6 py-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {quickLinks.map((ql) => (
              <a
                key={ql.label}
                href="#"
                className="flex items-center gap-3 rounded-xl border p-4 transition-all duration-200 hover:border-[#9dc0ee] hover:bg-[#f8fbff]"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "#e6f0ff", color: "#006bff" }}>
                  <ql.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--color-text)" }}>{ql.label}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{ql.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="mx-auto w-full max-w-[1240px] px-6 py-16 lg:py-20">
        <div className="space-y-10">
          {resourceCategories.map((cat, catIndex) => (
            <div key={cat.id} id={cat.id} className="animate-fade-in-up" style={{ animationDelay: `${catIndex * 0.1}s` }}>
              <div className="mb-5 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: cat.bg, color: cat.color }}
                >
                  <cat.icon size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>{cat.title}</h2>
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{cat.description}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cat.articles.map((article) => (
                  <a
                    key={article.title}
                    href="#"
                    className="cal-card-hover group flex flex-col p-5"
                  >
                    <span
                      className="mb-3 inline-block self-start rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: cat.bg, color: cat.color }}
                    >
                      {article.tag}
                    </span>
                    <h3 className="mb-2 text-[15px] font-bold" style={{ color: "var(--color-text)" }}>
                      {article.title}
                    </h3>
                    <span className="mt-auto flex items-center gap-1 text-sm font-semibold transition-colors" style={{ color: cat.color }}>
                      Read more <ExternalLink size={13} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
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
              Start building better scheduling today
            </h2>
            <p className="mx-auto mb-8 max-w-[580px] text-base text-white/70">
              Create your free account and explore everything Calendly has to offer.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold transition-all hover:shadow-lg"
              style={{ color: "#006bff" }}
            >
              Get started free <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
