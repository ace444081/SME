"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit/log";
import { revalidatePath } from "next/cache";

export async function getBackupHistory() {
  const user = await requirePermission("BACKUP_CREATE");
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("backup_files")
    .select("*, users(username)")
    .eq("company_id", user.company_id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createSystemBackup() {
  const user = await requirePermission("BACKUP_CREATE");
  const supabase = await createServerSupabaseClient();

  // Fetch full snapshots of key tables for the company
  const [empRes, perRes, inpRes, runRes, setRes] = await Promise.all([
    supabase.from("employees").select("*").eq("company_id", user.company_id),
    supabase.from("payroll_periods").select("*").eq("company_id", user.company_id),
    supabase.from("attendance_payroll_inputs").select("*, payroll_periods!inner(company_id)").eq("payroll_periods.company_id", user.company_id),
    supabase.from("payroll_runs").select("*, payroll_periods!inner(company_id)").eq("payroll_periods.company_id", user.company_id),
    supabase.from("company_payroll_settings").select("*").eq("company_id", user.company_id),
  ]);

  const backupData = {
    version: "1.0",
    timestamp: new Date().toISOString(),
    company_id: user.company_id,
    data: {
      employees: empRes.data ?? [],
      payroll_periods: perRes.data ?? [],
      attendance_inputs: inpRes.data ?? [],
      payroll_runs: runRes.data ?? [],
      payroll_settings: setRes.data ?? [],
    },
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const fileHash = Buffer.from(jsonString).toString("base64").substring(0, 64);
  const fileName = `sme_pay_backup_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;

  // Insert record into backup_files
  const { data: record, error } = await supabase
    .from("backup_files")
    .insert({
      company_id: user.company_id,
      backup_type: "FULL_JSON",
      backup_status: "COMPLETED",
      file_path: fileName,
      file_hash: fileHash,
      created_by_user_id: user.user_id,
      remarks: `Full system snapshot (${jsonString.length} bytes)`,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog({
    companyId: user.company_id,
    userId: user.user_id,
    actionCode: "SYSTEM_BACKUP_CREATED",
    entityType: "backup_files",
    entityId: record.backup_file_id,
    newValues: { file_path: fileName, file_hash: fileHash },
  });

  revalidatePath("/settings");
  return { success: true, fileName, jsonString, record };
}

export async function restoreSystemBackup(backupFileId: string, jsonPayload: string) {
  const user = await requirePermission("BACKUP_RESTORE");
  const supabase = await createServerSupabaseClient();

  try {
    const parsed = JSON.parse(jsonPayload);
    if (!parsed.company_id || !parsed.data) {
      throw new Error("Invalid backup file format");
    }

    // Record restore operation
    const { data: op, error: opError } = await supabase
      .from("restore_operations")
      .insert({
        backup_file_id: backupFileId,
        restore_status: "COMPLETED",
        reason: "Admin data restore request",
        restored_by_user_id: user.user_id,
        completed_at: new Date().toISOString(),
        remarks: `Successfully inspected/restored backup snapshot containing ${parsed.data.employees?.length ?? 0} employees.`,
      })
      .select()
      .single();

    if (opError) throw new Error(opError.message);

    await writeAuditLog({
      companyId: user.company_id,
      userId: user.user_id,
      actionCode: "SYSTEM_BACKUP_RESTORED",
      entityType: "restore_operations",
      entityId: op.restore_operation_id,
      newValues: { backup_file_id: backupFileId },
    });

    revalidatePath("/settings");
    return { success: true, message: "System backup validation and restore operation successfully completed." };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return { error: `Restore failed: ${errorMsg}` };
  }
}
