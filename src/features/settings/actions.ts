"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit/log";
import { companySchema, payrollConfigSchema } from "./schemas";
import { revalidatePath } from "next/cache";

export async function getCompanyProfile() {
  const user = await requirePermission("COMPANY_VIEW");
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("company_id", user.company_id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateCompanyProfile(formData: FormData) {
  const user = await requirePermission("COMPANY_UPDATE");
  const supabase = await createServerSupabaseClient();

  const rawData = {
    company_name: formData.get("company_name") as string,
    business_name: (formData.get("business_name") as string) || null,
    tin: (formData.get("tin") as string) || null,
    address_line: (formData.get("address_line") as string) || null,
    contact_number: (formData.get("contact_number") as string) || null,
    email: (formData.get("email") as string) || null,
  };

  const parsed = companySchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Get old values for audit
  const { data: oldData } = await supabase
    .from("companies")
    .select("*")
    .eq("company_id", user.company_id)
    .single();

  const { data, error } = await supabase
    .from("companies")
    .update(parsed.data)
    .eq("company_id", user.company_id)
    .select()
    .single();

  if (error) return { error: error.message };

  await writeAuditLog({
    companyId: user.company_id,
    userId: user.user_id,
    actionCode: "COMPANY_PROFILE_UPDATED",
    entityType: "companies",
    entityId: user.company_id,
    oldValues: oldData as Record<string, unknown>,
    newValues: parsed.data as unknown as Record<string, unknown>,
  });

  revalidatePath("/settings");
  return { data };
}

export async function getPayrollConfig() {
  const user = await requirePermission("SETTINGS_VIEW");
  const supabase = await createServerSupabaseClient();

  // Get active config
  const { data, error } = await supabase
    .from("company_payroll_settings")
    .select("*, payroll_frequencies(frequency_name)")
    .eq("company_id", user.company_id)
    .is("effective_to", null)
    .order("effective_from", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }

  return data;
}

export async function updatePayrollConfig(formData: FormData) {
  const user = await requirePermission("SETTINGS_UPDATE");
  const supabase = await createServerSupabaseClient();

  const rawData = {
    default_frequency_id: formData.get("default_frequency_id") as string,
    default_working_days_per_month: parseFloat(formData.get("default_working_days_per_month") as string),
    default_working_hours_per_day: parseFloat(formData.get("default_working_hours_per_day") as string),
    default_overtime_multiplier: parseFloat(formData.get("default_overtime_multiplier") as string),
    allow_manual_adjustments: formData.get("allow_manual_adjustments") === "true",
    require_manager_approval: formData.get("require_manager_approval") === "true",
  };

  const parsed = payrollConfigSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Find current active config
  const { data: currentActive } = await supabase
    .from("company_payroll_settings")
    .select("payroll_setting_id")
    .eq("company_id", user.company_id)
    .is("effective_to", null)
    .single();

  // Close current active config by setting effective_to = TODAY
  const today = new Date().toISOString().split("T")[0];
  if (currentActive) {
    await supabase
      .from("company_payroll_settings")
      .update({ effective_to: today })
      .eq("payroll_setting_id", currentActive.payroll_setting_id);
  }

  // Insert new active config starting tomorrow or today
  const newConfigData = {
    ...parsed.data,
    company_id: user.company_id,
    effective_from: today,
    created_by_user_id: user.user_id,
  };

  const { data, error } = await supabase
    .from("company_payroll_settings")
    .insert(newConfigData)
    .select()
    .single();

  if (error) return { error: error.message };

  await writeAuditLog({
    companyId: user.company_id,
    userId: user.user_id,
    actionCode: "PAYROLL_SETTINGS_UPDATED",
    entityType: "company_payroll_settings",
    entityId: data.payroll_setting_id,
    newValues: newConfigData as unknown as Record<string, unknown>,
  });

  revalidatePath("/settings");
  return { data };
}
