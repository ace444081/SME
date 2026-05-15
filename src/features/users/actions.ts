"use server";

import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit/log";
import { userCreateSchema } from "./schemas";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  const user = await requirePermission("USERS_VIEW");
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("users")
    .select(`
      *,
      user_roles(
        roles(role_id, role_code, role_name)
      )
    `)
    .eq("company_id", user.company_id)
    .order("username");

  if (error) throw new Error(error.message);

  return (data ?? []).map((u) => {
    const roleObj = u.user_roles?.[0]?.roles;
    return {
      ...u,
      role: roleObj || { role_id: "", role_code: "UNKNOWN", role_name: "No Role" },
    };
  });
}

export async function getRoles() {
  await requirePermission("USERS_VIEW");
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("role_name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createUser(formData: FormData) {
  const user = await requirePermission("USERS_CREATE");
  const supabaseAdmin = await createServiceRoleClient();
  const supabaseClient = await createServerSupabaseClient();

  const rawData = {
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    role_id: formData.get("role_id") as string,
    password: formData.get("password") as string,
  };

  const parsed = userCreateSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { username, email, role_id, password } = parsed.data;

  // 1. Create user in Supabase Auth
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) return { error: `Auth Error: ${authError.message}` };
  if (!authUser.user) return { error: "Failed to create user in Auth engine" };

  // 2. Create user profile in public.users
  const appUserData = {
    company_id: user.company_id,
    auth_user_id: authUser.user.id,
    username,
    email,
    account_status: "ACTIVE",
    created_by_user_id: user.user_id,
  };

  const { data: newUser, error: dbError } = await supabaseClient
    .from("users")
    .insert(appUserData)
    .select()
    .single();

  if (dbError) {
    // Attempt cleanup if public profile fails
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
    return { error: `Database Error: ${dbError.message}` };
  }

  // 3. Assign role in user_roles
  const { error: roleError } = await supabaseClient
    .from("user_roles")
    .insert({
      user_id: newUser.user_id,
      role_id,
      assigned_by_user_id: user.user_id,
    });

  if (roleError) return { error: `Role Assignment Error: ${roleError.message}` };

  await writeAuditLog({
    companyId: user.company_id,
    userId: user.user_id,
    actionCode: "USER_CREATED",
    entityType: "users",
    entityId: newUser.user_id,
    newValues: { username, email, role_id } as unknown as Record<string, unknown>,
  });

  revalidatePath("/settings");
  return { success: true, user: newUser };
}

export async function updateUserStatus(targetUserId: string, newStatus: string) {
  const user = await requirePermission("USERS_DISABLE");
  const supabase = await createServerSupabaseClient();

  // Cannot disable oneself
  if (targetUserId === user.user_id) {
    return { error: "You cannot disable your own active account" };
  }

  const { data: oldUser } = await supabase
    .from("users")
    .select("account_status")
    .eq("user_id", targetUserId)
    .single();

  const { error } = await supabase
    .from("users")
    .update({ account_status: newStatus })
    .eq("user_id", targetUserId);

  if (error) return { error: error.message };

  await writeAuditLog({
    companyId: user.company_id,
    userId: user.user_id,
    actionCode: "USER_STATUS_CHANGED",
    entityType: "users",
    entityId: targetUserId,
    oldValues: { account_status: oldUser?.account_status },
    newValues: { account_status: newStatus },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function updateUserRole(targetUserId: string, newRoleId: string) {
  const user = await requirePermission("USERS_MANAGE_ROLES");
  const supabase = await createServerSupabaseClient();

  // Delete old role assignment
  await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", targetUserId);

  // Insert new role assignment
  const { error } = await supabase
    .from("user_roles")
    .insert({
      user_id: targetUserId,
      role_id: newRoleId,
      assigned_by_user_id: user.user_id,
    });

  if (error) return { error: error.message };

  await writeAuditLog({
    companyId: user.company_id,
    userId: user.user_id,
    actionCode: "USER_ROLE_CHANGED",
    entityType: "user_roles",
    entityId: targetUserId,
    newValues: { role_id: newRoleId },
  });

  revalidatePath("/settings");
  return { success: true };
}
