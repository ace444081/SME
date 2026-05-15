import { test, expect } from "@playwright/test";

test.describe("Main Payroll Flow", () => {
  // Test relies on Supabase Auth and seed data existing
  test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL, "Requires Supabase");

  test.beforeEach(async ({ page }) => {
    // Login as Payroll Admin
    await page.goto("/login");
    await page.fill("input[name='email']", "payroll@visualoptions.ph");
    await page.fill("input[name='password']", "password123");
    await page.click("button:has-text('Sign In')");
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("View Payroll Periods and Computations", async ({ page }) => {
    // Navigate to Periods
    await page.click("text=Payroll Periods");
    await expect(page).toHaveURL(/.*payroll-periods/);
    
    // Check if the demo periods load
    await expect(page.locator("text=May 1st Cut-off 2026")).toBeVisible();

    // Navigate to Payroll Runs / Computations
    await page.click("text=Run Payroll");
    await expect(page).toHaveURL(/.*payroll-runs/);

    // Verify Compute button is present
    await expect(page.locator("button:has-text('Compute Payroll')")).toBeVisible();
  });

  test("Review and Finalize Workflow navigation", async ({ page }) => {
    await page.click("text=Review & Finalize");
    await expect(page).toHaveURL(/.*payroll-review/);

    // Should show table of runs
    await expect(page.locator("text=Review").first()).toBeVisible();
  });
});
