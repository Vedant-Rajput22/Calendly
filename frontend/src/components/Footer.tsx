import Image from "next/image";
import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Overview", href: "/product" },
    { label: "Solutions", href: "/solutions" },
    { label: "Enterprise", href: "/enterprise" },
    { label: "Pricing", href: "/pricing" },
  ],
  Solutions: [
    { label: "Sales", href: "/solutions#sales" },
    { label: "Marketing", href: "/solutions#marketing" },
    { label: "Customer Success", href: "/solutions#customer-success" },
    { label: "Recruiting", href: "/solutions#recruiting" },
  ],
  Resources: [
    { label: "Blog", href: "/resources#blog" },
    { label: "Guides", href: "/resources#guides" },
    { label: "Customer Stories", href: "/resources#stories" },
    { label: "Webinars", href: "/resources#webinars" },
  ],
  Company: [
    { label: "About", href: "/resources#about" },
    { label: "Careers", href: "/resources#careers" },
    { label: "Security", href: "/enterprise#security" },
    { label: "Privacy", href: "/resources#privacy" },
  ],
};

export default function Footer() {
  return (
    <footer className="cal-footer">
      <div className="mx-auto w-full max-w-[1240px] px-6 py-14 lg:py-16">
        {/* Top section: logo + link columns */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" aria-label="Calendly home" className="inline-block mb-4">
              <Image
                src="/logos/Calendly_idA4lPSDzF_0.svg"
                alt="Calendly"
                width={120}
                height={28}
              />
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Easy scheduling ahead. Eliminate the back-and-forth and focus on what matters.
            </p>

            {/* Social links */}
            <div className="mt-5 flex items-center gap-3">
              {[
                { label: "Twitter", path: "M22.46 6c-.77.35-1.6.58-2.46.69a4.31 4.31 0 0 0 1.88-2.38 8.59 8.59 0 0 1-2.72 1.04 4.28 4.28 0 0 0-7.3 3.9A12.14 12.14 0 0 1 3.05 4.86a4.28 4.28 0 0 0 1.32 5.72 4.24 4.24 0 0 1-1.94-.54v.05a4.28 4.28 0 0 0 3.43 4.2 4.27 4.27 0 0 1-1.93.07 4.29 4.29 0 0 0 4 2.97A8.59 8.59 0 0 1 2 19.54a12.13 12.13 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2l-.01-.56A8.72 8.72 0 0 0 23 6.81z" },
                { label: "LinkedIn", path: "M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" },
                { label: "Facebook", path: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99C18.34 21.12 22 16.99 22 12z" },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-[#e6f0ff]"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-bold" style={{ color: "var(--color-text)" }}>
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-[#006bff]"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            © {new Date().getFullYear()} Calendly. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/resources#privacy" className="text-xs transition-colors hover:text-[#006bff]" style={{ color: "var(--color-text-muted)" }}>
              Privacy Policy
            </Link>
            <Link href="/resources#terms" className="text-xs transition-colors hover:text-[#006bff]" style={{ color: "var(--color-text-muted)" }}>
              Terms of Service
            </Link>
            <Link href="/enterprise#security" className="text-xs transition-colors hover:text-[#006bff]" style={{ color: "var(--color-text-muted)" }}>
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
