import { test, expect } from "@playwright/test";
import { Dashboard } from "../pages/dashboard";

/* Dashboard e2e tests */

test.use({ storageState: "tests-e2e/config/storageState.json" });

test.describe("Dashboard", () => {

    test("should load with correct title", async ({ page }) => {
        const dashboard = new Dashboard(page);
        await dashboard.goto();
        await expect(page).toHaveTitle("Dashboard | Earnings Dashboard");
    });

    test("should show settings link", async ({ page }) => {
        const dashboard = new Dashboard(page);
        await dashboard.goto();
        await expect(dashboard.settingsLink).toBeVisible();
    });

    test("should show sign out link", async ({ page }) => {
        const dashboard = new Dashboard(page);
        await dashboard.goto();
        await expect(dashboard.signOutLink).toBeVisible();
    });

    test("should show current earnings heading", async ({ page }) => {
        const dashboard = new Dashboard(page);
        await dashboard.goto();
        await expect(dashboard.currentEarningsHeading).toBeVisible();
    });

    test("should show maximum earnings heading", async ({ page }) => {
        const dashboard = new Dashboard(page);
        await dashboard.goto();
        await expect(dashboard.maximumEarningsHeading).toBeVisible();
    });

    test("should redirect to home when clicking sign out link", async ({ page }) => {
        const dashboard = new Dashboard(page);
        await dashboard.goto();
        await dashboard.signOutLink.click();
        await expect(page).toHaveURL("/");
    });

});