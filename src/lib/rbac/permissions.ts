// RBAC Permission Helpers
// Note: No "use server" directive — this module contains both async and sync utilities

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { RoleCode } from "@/types";

export interface SessionUser {
  user_id: string;
  company_id: string;
  username: string;
  email: string | null;
  account_status: string;
  roles: RoleCode[];
  permissions: string[];
}

/**
 * Get the current authenticated user with roles and permissions.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return null;

    // Get app user by auth_user_id
    const { data: appUser } = await supabase
      .from("users")
      .select("user_id, company_id, username, email, account_status")
      .eq("auth_user_id", authUser.id)
      .single();

    if (!appUser || appUser.account_status !== "ACTIVE") return null;

    // Get roles
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("roles(role_code)")
      .eq("user_id", appUser.user_id);

    const roles: RoleCode[] = (userRoles ?? [])
      .map((ur: Record<string, unknown>) => {
        const role = ur.roles as { role_code: string } | null;
        return role?.role_code as RoleCode;
      })
      .filter(Boolean);

    // Get permissions through role_permissions
    const { data: rolePerms } = await supabase
      .from("role_permissions")
      .select("permissions(permission_code), role_id")
      .in(
        "role_id",
        (userRoles ?? []).map((ur: Record<string, unknown>) => {
          const role = ur.roles as { role_id: string } | null;
          return role?.role_id;
        }).filter(Boolean)
      );

    const permissions: string[] = [...new Set(
      (rolePerms ?? [])
        .map((rp: Record<string, unknown>) => {
          const perm = rp.permissions as { permission_code: string } | null;
          return perm?.permission_code;
        })
        .filter(Boolean) as string[]
    )];

    return {
      user_id: appUser.user_id,
      company_id: appUser.company_id,
      username: appUser.username,
      email: appUser.email,
      account_status: appUser.account_status,
      roles,
      permissions,
    };
  } catch {
    return null;
  }
}

/**
 * Require a specific role. Throws if the user doesn't have it.
 */
export async function requireRole(...allowedRoles: RoleCode[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  if (!user.roles.some((r) => allowedRoles.includes(r))) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

/**
 * Require a specific permission. Throws if the user doesn't have it.
 */
export async function requirePermission(...requiredPermissions: string[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  const hasAll = requiredPermissions.every((p) => user.permissions.includes(p));
  if (!hasAll) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

