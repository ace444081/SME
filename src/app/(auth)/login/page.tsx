"use client";

import { loginAction } from "@/features/auth/actions";
import { useActionState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return await loginAction(formData);
    },
    null
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, var(--color-neutral-50) 0%, var(--color-primary-50) 100%)",
      }}
    >
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4"
              style={{
                background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
              </svg>
            </div>
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-neutral-900)" }}>
            Sign in to SME-Pay
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--color-neutral-500)" }}>
            Enter your credentials to access the payroll system
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "var(--color-surface)",
            boxShadow: "var(--shadow-xl)",
            border: "1px solid var(--color-neutral-200)",
          }}
        >
          {state?.error && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
              style={{
                background: "var(--color-danger-50)",
                color: "var(--color-danger-700)",
                border: "1px solid var(--color-danger-500)",
              }}
            >
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-neutral-700)" }}>
                Email
              </label>
              <input
                id="login-email" name="email" type="email" autoComplete="email" required
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:ring-2"
                style={{ border: "1px solid var(--color-neutral-300)", background: "var(--color-neutral-50)", color: "var(--color-neutral-900)" }}
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-neutral-700)" }}>
                Password
              </label>
              <input
                id="login-password" name="password" type="password" autoComplete="current-password" required
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:ring-2"
                style={{ border: "1px solid var(--color-neutral-300)", background: "var(--color-neutral-50)", color: "var(--color-neutral-900)" }}
              />
            </div>

            <button
              type="submit" id="login-submit" disabled={isPending}
              className="w-full py-2.5 rounded-lg font-semibold text-white text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
              }}
            >
              {isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-5 text-center text-xs" style={{ borderTop: "1px solid var(--color-neutral-100)", color: "var(--color-neutral-400)" }}>
            <p className="font-medium mb-1" style={{ color: "var(--color-neutral-500)" }}>Demo Accounts</p>
            <p>payroll@visualoptions.ph · owner@visualoptions.ph · admin@visualoptions.ph</p>
          </div>
        </div>
      </div>
    </div>
  );
}
