import Link from "next/link";

export default function HomePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, var(--color-primary-950) 0%, var(--color-primary-800) 50%, var(--color-primary-700) 100%)",
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10"
          style={{ background: "var(--color-accent-400)" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-10"
          style={{ background: "var(--color-primary-400)" }}
        />
      </div>

      <main className="relative z-10 text-center px-6 animate-fade-in">
        {/* Logo area */}
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8"
          style={{
            background:
              "linear-gradient(135deg, var(--color-accent-400), var(--color-primary-400))",
            boxShadow: "0 8px 32px rgba(99, 102, 241, 0.3)",
          }}
        >
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
            />
          </svg>
        </div>

        <h1
          className="text-5xl font-extrabold mb-4 tracking-tight"
          style={{ color: "var(--color-primary-50)" }}
        >
          SME-Pay
        </h1>

        <p
          className="text-lg max-w-lg mx-auto mb-3 font-medium"
          style={{ color: "var(--color-primary-200)" }}
        >
          Payroll Automation System
        </p>

        <p
          className="text-sm max-w-md mx-auto mb-10"
          style={{ color: "var(--color-primary-300)" }}
        >
          Visual Options Engineering and Fabrication Services
        </p>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white text-base transition-all duration-200 hover:scale-105 hover:shadow-2xl active:scale-95"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.4)",
          }}
          id="cta-login"
        >
          Sign In to Continue
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>

        {/* Version badge */}
        <p
          className="mt-12 text-xs font-mono"
          style={{ color: "var(--color-primary-400)" }}
        >
          v0.1.0 — Thesis Prototype
        </p>
      </main>
    </div>
  );
}
