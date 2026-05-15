import type { RoleCode } from "@/types";
import type { SessionUser } from "./permissions";

/**
 * Check if user has a specific role (non-throwing, synchronous).
 */
export function hasRole(user: SessionUser, ...roles: RoleCode[]): boolean {
  return user.roles.some((r) => roles.includes(r));
}

/**
 * Check if user has a specific permission (non-throwing, synchronous).
 */
export function hasPermission(user: SessionUser, ...perms: string[]): boolean {
  return perms.every((p) => user.permissions.includes(p));
}
