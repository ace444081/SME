import Link from "next/link";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-neutral-50)]">
      <header className="bg-white border-b border-[var(--color-neutral-200)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/portal" className="text-xl font-bold text-[var(--color-primary-600)]">
            SME-Pay Portal
          </Link>
        </div>
        <div className="flex space-x-4">
          <Link href="/portal" className="text-sm font-medium hover:text-[var(--color-primary-600)]">Dashboard</Link>
          <Link href="/portal/requests" className="text-sm font-medium hover:text-[var(--color-primary-600)]">Requests</Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-sm font-medium text-red-600 hover:underline">Log Out</button>
          </form>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
