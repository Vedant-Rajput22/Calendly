import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="cal-shell flex min-h-screen items-center justify-center p-6">
      <div className="cal-card w-full max-w-md p-10 text-center">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: "#e6f0ff", color: "#006bff" }}
        >
          <Calendar size={30} />
        </div>

        <p className="mb-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
          Error 404
        </p>
        <h1 className="mb-2 text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          Page not found
        </h1>
        <p className="mb-7 text-sm" style={{ color: "var(--color-text-muted)" }}>
          The page you are looking for does not exist or is no longer available.
        </p>

        <Link href="/" className="cal-btn-primary">
          <ArrowLeft size={16} />
          Back to home
        </Link>
      </div>
    </main>
  );
}
