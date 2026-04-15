"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (status === "authenticated") {
    redirect("/dashboard");
  }

  if (status === "loading") {
    return (
      <div className="cal-shell flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-[#d4e7ff] border-t-[#006bff] animate-spin" />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="cal-shell flex min-h-screen flex-col">
      <header className="flex h-20 items-center justify-center border-b bg-white" style={{ borderColor: "var(--color-border)" }}>
        <Link href="/" aria-label="Calendly home">
          <Image src="/logos/Calendly_idA4lPSDzF_0.svg" alt="Calendly" width={136} height={32} priority />
        </Link>
      </header>

      <section className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[432px]">
          <div className="cal-card p-8 sm:p-10">
            <h1 className="mb-2 text-center text-[2.05rem] font-bold leading-tight tracking-tight" style={{ color: "var(--color-text)" }}>
              Welcome back
            </h1>
            <p className="mb-7 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
              Log in to your Calendly account.
            </p>

            {error && (
              <div className="mb-5 rounded-lg border px-3 py-2 text-sm font-semibold" style={{ borderColor: "#f2b9b9", backgroundColor: "#fff4f4", color: "#af2a2a" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="cal-label">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="cal-input"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="cal-label">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="cal-input pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-text-muted)" }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="cal-btn-primary w-full py-3">
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Log in"
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <span className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                or
              </span>
              <span className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
            </div>

            <button
              onClick={() => void signIn("google", { callbackUrl: "/dashboard" })}
              className="cal-btn-secondary w-full py-3"
            >
              <FcGoogle className="h-5 w-5" />
              Continue with Google
            </button>

            <p className="mt-6 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
              No account yet?{" "}
              <Link href="/signup" className="cal-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
