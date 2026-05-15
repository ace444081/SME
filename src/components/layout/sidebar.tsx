"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/features/auth/actions";
import type { RoleCode } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: RoleCode[];
  permission?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Employees", href: "/employees", icon: "👥", permission: "EMPLOYEES_VIEW" },
  { label: "Payroll Periods", href: "/payroll-periods", icon: "📅", permission: "PERIODS_VIEW" },
  { label: "Attendance", href: "/attendance-inputs", icon: "📝", permission: "ATTENDANCE_VIEW" },
  { label: "Deductions", href: "/deduction-settings", icon: "💳", permission: "DEDUCTIONS_VIEW" },
  { label: "Payroll Runs", href: "/payroll-runs", icon: "⚙️", permission: "PAYROLL_COMPUTE" },
  { label: "Review", href: "/payroll-review", icon: "✅", permission: "PAYROLL_REVIEW" },
  { label: "Payslips", href: "/payslips", icon: "📄", permission: "PAYSLIPS_VIEW" },
  { label: "Reports", href: "/reports", icon: "📈", permission: "REPORTS_VIEW" },
  { label: "Audit Logs", href: "/audit-logs", icon: "🔍", roles: ["OWNER_MANAGER", "SYSTEM_ADMIN"] },
  { label: "Settings", href: "/settings", icon: "⚙️", roles: ["SYSTEM_ADMIN"] },
];

interface SidebarProps {
  username: string;
  roles: RoleCode[];
  permissions: string[];
}

export function Sidebar({ username, roles, permissions }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter((item) => {
    if (item.roles && !item.roles.some((r) => roles.includes(r))) return false;
    if (item.permission && !permissions.includes(item.permission)) return false;
    return true;
  });

  const roleBadge = roles.includes("PAYROLL_ADMIN")
    ? "Payroll Admin"
    : roles.includes("OWNER_MANAGER")
    ? "Owner/Manager"
    : roles.includes("SYSTEM_ADMIN")
    ? "System Admin"
    : "User";

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-30"
      style={{
        width: "var(--sidebar-width)",
        background: "var(--color-neutral-900)",
        borderRight: "1px solid var(--color-neutral-800)",
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: "1px solid var(--color-neutral-800)" }}>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold"
          style={{ background: "linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))" }}
        >
          SP
        </div>
        <div>
          <p className="text-sm font-bold text-white">SME-Pay</p>
          <p className="text-xs" style={{ color: "var(--color-neutral-400)" }}>Payroll System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    color: isActive ? "white" : "var(--color-neutral-400)",
                    background: isActive ? "var(--color-primary-600)" : "transparent",
                  }}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid var(--color-neutral-800)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "var(--color-primary-600)" }}
          >
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{username}</p>
            <p className="text-xs" style={{ color: "var(--color-neutral-500)" }}>{roleBadge}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
            style={{ color: "var(--color-neutral-400)", background: "var(--color-neutral-800)" }}
          >
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
