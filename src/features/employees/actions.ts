"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit/log";
import { employeeSchema, employeeRateSchema } from "./schemas";

export async function getEmployees() {
  const user = await requirePermission("EMPLOYEES_VIEW");
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("employees")
    .select(`*, departments(department_name), job_positions(position_title), employment_statuses(status_code, status_name)`)
    .eq("company_id", user.company_id)
    .order("employee_no");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getEmployee(employeeId: string) {
  const user = await requirePermission("EMPLOYEES_VIEW");
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("employees")
    .select(`*, departments(department_name), job_positions(position_title), employment_statuses(status_code, status_name)`)
    .eq("employee_id", employeeId)
    .eq("company_id", user.company_id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createEmployee(formData: FormData) {
  const user = await requirePermission("EMPLOYEES_CREATE");
  const supabase = await createServerSupabaseClient();

  const rawData = {
    employee_no: formData.get("employee_no") as string,
    first_name: formData.get("first_name") as string,
    middle_name: (formData.get("middle_name") as string) || null,
    last_name: formData.get("last_name") as string,
    suffix: (formData.get("suffix") as string) || null,
    birth_date: (formData.get("birth_date") as string) || null,
    sex: (formData.get("sex") as string) || null,
    civil_status: (formData.get("civil_status") as string) || null,
    contact_number: (formData.get("contact_number") as string) || null,
    email: (formData.get("email") as string) || null,
    address_line: (formData.get("address_line") as string) || null,
    department_id: (formData.get("department_id") as string) || null,
    position_id: (formData.get("position_id") as string) || null,
    employment_status_id: formData.get("employment_status_id") as string,
    hire_date: formData.get("hire_date") as string,
  };

  const parsed = employeeSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const employeeData = {
    ...parsed.data,
    company_id: user.company_id,
    created_by_user_id: user.user_id,
  };

  const { data, error } = await supabase
    .from("employees")
    .insert(employeeData)
    .select()
    .single();
  if (error) return { error: error.message };

  await writeAuditLog({
    companyId: user.company_id,
    userId: user.user_id,
    actionCode: "EMPLOYEE_CREATED",
    entityType: "employees",
    entityId: data.employee_id,
    newValues: employeeData as unknown as Record<string, unknown>,
  });

  return { data };
}

export async function updateEmployee(employeeId: string, formData: FormData) {
  const user = await requirePermission("EMPLOYEES_UPDATE");
  const supabase = await createServerSupabaseClient();

  const rawData = {
    employee_no: "IGNORED_ON_UPDATE", // Required by schema but we don't update it
    first_name: formData.get("first_name") as string,
    middle_name: (formData.get("middle_name") as string) || null,
    last_name: formData.get("last_name") as string,
    suffix: (formData.get("suffix") as string) || null,
    birth_date: (formData.get("birth_date") as string) || null,
    sex: (formData.get("sex") as string) || null,
    civil_status: (formData.get("civil_status") as string) || null,
    contact_number: (formData.get("contact_number") as string) || null,
    email: (formData.get("email") as string) || null,
    address_line: (formData.get("address_line") as string) || null,
    department_id: (formData.get("department_id") as string) || null,
    position_id: (formData.get("position_id") as string) || null,
    employment_status_id: formData.get("employment_status_id") as string,
    hire_date: "2000-01-01", // Required by schema but we don't update it
  };

  const parsed = employeeSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { employee_no, hire_date, ...updates } = parsed.data;

  const { error } = await supabase
    .from("employees")
    .update(updates)
    .eq("employee_id", employeeId)
    .eq("company_id", user.company_id);
  if (error) return { error: error.message };

  await writeAuditLog({
    companyId: user.company_id,
    userId: user.user_id,
    actionCode: "EMPLOYEE_UPDATED",
    entityType: "employees",
    entityId: employeeId,
    newValues: updates as unknown as Record<string, unknown>,
  });

  return { success: true };
}

export async function getDepartments() {
  const user = await requirePermission("EMPLOYEES_VIEW");
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("departments")
    .select("*")
    .eq("company_id", user.company_id)
    .eq("is_active", true)
    .order("department_name");
  return data ?? [];
}

export async function getPositions() {
  const user = await requirePermission("EMPLOYEES_VIEW");
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("job_positions")
    .select("*")
    .eq("company_id", user.company_id)
    .eq("is_active", true)
    .order("position_title");
  return data ?? [];
}

export async function getEmploymentStatuses() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("employment_statuses")
    .select("*")
    .order("status_name");
  return data ?? [];
}

export async function getEmployeeRates(employeeId: string) {
  await requirePermission("EMPLOYEES_MANAGE_RATES");
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("employee_rate_history")
    .select("*")
    .eq("employee_id", employeeId)
    .order("effective_from", { ascending: false });
  return data ?? [];
}

export async function addEmployeeRate(formData: FormData) {
  const user = await requirePermission("EMPLOYEES_MANAGE_RATES");
  const supabase = await createServerSupabaseClient();
  const rawData = {
    employee_id: formData.get("employee_id") as string,
    pay_basis: formData.get("pay_basis") as string,
    rate_amount: formData.get("rate_amount") as string,
    effective_from: formData.get("effective_from") as string,
    change_reason: (formData.get("change_reason") as string) || null,
  };

  const parsed = employeeRateSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { employee_id, ...rateInput } = parsed.data;

  // Close previous active rate
  await supabase
    .from("employee_rate_history")
    .update({ effective_to: rateInput.effective_from })
    .eq("employee_id", employee_id)
    .is("effective_to", null);

  const rateData = {
    ...parsed.data,
    created_by_user_id: user.user_id,
  };

  const { error } = await supabase.from("employee_rate_history").insert(rateData);
  if (error) return { error: error.message };

  await writeAuditLog({
    companyId: user.company_id,
    userId: user.user_id,
    actionCode: "EMPLOYEE_RATE_ADDED",
    entityType: "employee_rate_history",
    entityId: employee_id,
    newValues: rateData as unknown as Record<string, unknown>,
  });

  return { success: true };
}

export async function getEmployeeGovIds(employeeId: string) {
  await requirePermission("EMPLOYEES_MANAGE_GOVIDS");
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("employee_government_ids")
    .select("*, government_id_types(type_code, type_name)")
    .eq("employee_id", employeeId);
  return data ?? [];
}

export async function upsertGovId(formData: FormData) {
  const user = await requirePermission("EMPLOYEES_MANAGE_GOVIDS");
  const supabase = await createServerSupabaseClient();

  const employeeId = formData.get("employee_id") as string;
  const govIdTypeId = formData.get("government_id_type_id") as string;
  const idNumber = formData.get("id_number") as string;

  const { data: existing } = await supabase
    .from("employee_government_ids")
    .select("employee_government_id, id_number")
    .eq("employee_id", employeeId)
    .eq("government_id_type_id", govIdTypeId)
    .single();

  if (existing) {
    const oldValue = existing.id_number;
    const { error } = await supabase
      .from("employee_government_ids")
      .update({ id_number: idNumber, updated_at: new Date().toISOString(), updated_by_user_id: user.user_id })
      .eq("employee_government_id", existing.employee_government_id);
    if (error) return { error: error.message };

    await writeAuditLog({
      companyId: user.company_id,
      userId: user.user_id,
      actionCode: "GOVERNMENT_ID_UPDATED",
      entityType: "employee_government_ids",
      entityId: existing.employee_government_id,
      oldValues: { id_number: oldValue },
      newValues: { id_number: idNumber },
    });
  } else {
    const { error } = await supabase
      .from("employee_government_ids")
      .insert({ employee_id: employeeId, government_id_type_id: govIdTypeId, id_number: idNumber });
    if (error) return { error: error.message };

    await writeAuditLog({
      companyId: user.company_id,
      userId: user.user_id,
      actionCode: "GOVERNMENT_ID_ADDED",
      entityType: "employee_government_ids",
      entityId: employeeId,
      newValues: { government_id_type_id: govIdTypeId, id_number: idNumber },
    });
  }

  return { success: true };
}
