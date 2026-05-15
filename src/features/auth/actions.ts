"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Sign in with email and password via Supabase Auth.
 */
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Log failed attempt
    try {
      await supabase.from("login_attempts").insert({
        username_entered: email,
        attempt_status: "FAILED",
        failure_reason: error.message,
      });
    } catch {
      // Don't block login flow for audit failure
    }
    return { error: "Invalid email or password" };
  }

  // Log successful attempt
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: appUser } = await supabase
        .from("users")
        .select("user_id")
        .eq("auth_user_id", user.id)
        .single();

      await supabase.from("login_attempts").insert({
        user_id: appUser?.user_id,
        username_entered: email,
        attempt_status: "SUCCESS",
      });
    }
  } catch {
    // Don't block login flow for audit failure
  }

  redirect("/dashboard");
}

/**
 * Sign out the current user.
 */
export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
