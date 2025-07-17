import { test, expect } from "@playwright/test";
import { Home } from "../pages/home";

/* Home e2e tests */

test.describe("Home", () => {

    test("should load with correct title", async ({ page }) => {
        const home = new Home(page);
        await home.goto();
        await expect(page).toHaveTitle("Home | Earnings Dashboard");
    });

    test("should show heading", async ({ page }) => {
        const home = new Home(page);
        await home.goto();
        await expect(home.heading).toBeVisible();
    });

    test("should show sign in link", async ({ page }) => {
        const home = new Home(page);
        await home.goto();
        await expect(home.signInLink).toBeVisible();
    });

    test("should redirect to google oauth when clicking sign in link", async ({ page }) => {
        const home = new Home(page);
        await home.goto();
        await home.signInLink.click();
        await expect(page).toHaveURL(/accounts\.google\.com/);
    });

});