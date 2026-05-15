"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Write an audit log entry. Called from server actions.
 */
export async function writeAuditLog(params: {
  companyId: string;
  userId: string | null;
  actionCode: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.from("audit_logs").insert({
      company_id: params.companyId,
      user_id: params.userId,
      action_code: params.actionCode,
      entity_type: params.entityType,
      entity_id: params.entityId,
      old_values: params.oldValues,
      new_values: params.newValues,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
