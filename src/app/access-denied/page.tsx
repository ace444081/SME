import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-neutral-50)" }}>
      <div className="text-center animate-fade-in">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-neutral-900)" }}>
          Access Denied
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-neutral-500)" }}>
          You don&apos;t have permission to access this page.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex px-6 py-2.5 rounded-lg font-medium text-white text-sm"
          style={{ background: "var(--color-primary-600)" }}
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
