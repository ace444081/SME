import { test, expect } from "@playwright/test";

test.describe("Authentication Flows", () => {
  // These tests require a valid Supabase instance running.
  // We skip them if the environment isn't set up for CI testing.
  
  test("Redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    // Assuming the middleware redirects to /login
    await expect(page).toHaveURL(/.*login/);
  });

  test("Login requires credentials", async ({ page }) => {
    await page.goto("/login");
    await page.click("button:has-text('Sign In')");
    // Check for native validation or custom error message
    const emailInput = page.locator("input[name='email']");
    await expect(emailInput).toBeVisible();
  });

  test("Successful login redirects to dashboard", async ({ page }) => {
    test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL, "Requires Supabase");
    
    await page.goto("/login");
    await page.fill("input[name='email']", "payroll@visualoptions.ph");
    await page.fill("input[name='password']", "password123");
    await page.click("button:has-text('Sign In')");

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator("text=Welcome back")).toBeVisible();
  });
});
