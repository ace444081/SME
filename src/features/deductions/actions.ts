"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit/log";

export async function getDeductionTypes() {
  await requirePermission("DEDUCTIONS_VIEW");
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("deduction_types").select("*").order("deduction_code");
  return data ?? [];
}

export async function getReferenceSets(deductionTypeId?: string) {
  await requirePermission("DEDUCTIONS_VIEW");
  const supabase = await createServerSupabaseClient();
  let query = supabase.from("statutory_reference_sets").select("*, deduction_types(deduction_code, deduction_name)").order("effective_from", { ascending: false });
  if (deductionTypeId) query = query.eq("deduction_type_id", deductionTypeId);
  const { data } = await query;
  return data ?? [];
}

export async function createReferenceSet(formData: FormData) {
  const user = await requirePermission("DEDUCTIONS_MANAGE");
  const supabase = await createServerSupabaseClient();

  const setData = {
    deduction_type_id: formData.get("deduction_type_id") as string,
    reference_name: formData.get("reference_name") as string,
    version_label: formData.get("version_label") as string,
    effective_from: formData.get("effective_from") as string,
    effective_to: (formData.get("effective_to") as string) || null,
    source_note: (formData.get("source_note") as string) || null,
    is_active: true,
    created_by_user_id: user.user_id,
  };

  const { data, error } = await supabase.from("statutory_reference_sets").insert(setData).select().single();
  if (error) return { error: error.message };

  await writeAuditLog({
    companyId: user.company_id, userId: user.user_id,
    actionCode: "REFERENCE_SET_CREATED", entityType: "statutory_reference_sets",
    entityId: data.reference_set_id,
    newValues: setData as unknown as Record<string, unknown>,
  });

  return { data };
}

export async function getBrackets(referenceSetId: string) {
  await requirePermission("DEDUCTIONS_VIEW");
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("statutory_contribution_brackets")
    .select("*")
    .eq("reference_set_id", referenceSetId)
    .order("min_compensation");
  return data ?? [];
}

export async function saveBracket(formData: FormData) {
  const user = await requirePermission("DEDUCTIONS_MANAGE");
  const supabase = await createServerSupabaseClient();

  const bracketData = {
    reference_set_id: formData.get("reference_set_id") as string,
    min_compensation: parseFloat(formData.get("min_compensation") as string),
    max_compensation: formData.get("max_compensation") ? parseFloat(formData.get("max_compensation") as string) : null,
    salary_credit: formData.get("salary_credit") ? parseFloat(formData.get("salary_credit") as string) : null,
    employee_rate: formData.get("employee_rate") ? parseFloat(formData.get("employee_rate") as string) : null,
    employer_rate: formData.get("employer_rate") ? parseFloat(formData.get("employer_rate") as string) : null,
    employee_fixed_amount: formData.get("employee_fixed_amount") ? parseFloat(formData.get("employee_fixed_amount") as string) : null,
    employer_fixed_amount: formData.get("employer_fixed_amount") ? parseFloat(formData.get("employer_fixed_amount") as string) : null,
    formula_note: (formData.get("formula_note") as string) || null,
  };

  const { error } = await supabase.from("statutory_contribution_brackets").insert(bracketData);
  if (error) return { error: error.message };

  await writeAuditLog({
    companyId: user.company_id, userId: user.user_id,
    actionCode: "BRACKET_ADDED", entityType: "statutory_contribution_brackets",
    newValues: bracketData as unknown as Record<string, unknown>,
  });

  return { success: true };
}

export async function getTaxTables() {
  await requirePermission("DEDUCTIONS_VIEW");
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("withholding_tax_tables")
    .select("*, payroll_frequencies(frequency_name)")
    .order("effective_from", { ascending: false });
  return data ?? [];
}

export async function getTaxBrackets(taxTableId: string) {
  await requirePermission("DEDUCTIONS_VIEW");
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("withholding_tax_brackets")
    .select("*")
    .eq("tax_table_id", taxTableId)
    .order("bracket_no");
  return data ?? [];
}
