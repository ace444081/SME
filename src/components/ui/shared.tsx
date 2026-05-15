interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-neutral-900)" }}>{title}</h1>
        {description && <p className="mt-1 text-sm" style={{ color: "var(--color-neutral-500)" }}>{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variantStyles: Record<string, { bg: string; color: string }> = {
  default: { bg: "var(--color-neutral-100)", color: "var(--color-neutral-700)" },
  success: { bg: "var(--color-success-50)", color: "var(--color-success-700)" },
  warning: { bg: "var(--color-warning-50)", color: "var(--color-warning-700)" },
  danger: { bg: "var(--color-danger-50)", color: "var(--color-danger-700)" },
  info: { bg: "var(--color-primary-50)", color: "var(--color-primary-700)" },
};

export function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  const style = variantStyles[variant] || variantStyles.default;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: style.bg, color: style.color }}
    >
      {status}
    </span>
  );
}

export function getStatusVariant(status: string): StatusBadgeProps["variant"] {
  switch (status) {
    case "ACTIVE": case "FINALIZED": case "OK": case "GENERATED": case "SUCCESS": case "COMPLETED":
      return "success";
    case "OPEN": case "DRAFT": case "PENDING":
      return "info";
    case "COMPUTED": case "SUBMITTED": case "VALIDATED": case "RELEASED": case "REVIEWING":
      return "warning";
    case "RETURNED": case "WARNING": case "LOCKED": case "ON_LEAVE":
      return "warning";
    case "ERROR": case "VOIDED": case "DISABLED": case "FAILED": case "TERMINATED": case "REJECTED":
      return "danger";
    default:
      return "default";
  }
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = "", padding = true }: CardProps) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        background: "var(--color-surface)",
        boxShadow: "var(--shadow-sm)",
        border: "1px solid var(--color-neutral-200)",
        padding: padding ? "1.5rem" : undefined,
      }}
    >
      {children}
    </div>
  );
}

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--color-neutral-900)" }}>{title}</h3>
      <p className="text-sm mb-4" style={{ color: "var(--color-neutral-500)" }}>{description}</p>
      {action}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
}

export function Button({ children, variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizeStyles = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm";

  const variantMap: Record<string, React.CSSProperties> = {
    primary: { background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))", color: "white" },
    secondary: { background: "var(--color-neutral-100)", color: "var(--color-neutral-700)", border: "1px solid var(--color-neutral-300)" },
    danger: { background: "var(--color-danger-500)", color: "white" },
    ghost: { background: "transparent", color: "var(--color-neutral-600)" },
  };

  return (
    <button className={`${baseStyles} ${sizeStyles} ${className}`} style={variantMap[variant]} {...props}>
      {children}
    </button>
  );
}
