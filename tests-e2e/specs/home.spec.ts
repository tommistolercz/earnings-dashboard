import { test, expect } from "@playwright/test";
import { Home } from "../pages/home";

/* Home tests */

test.describe("Home", () => {

    test("should load with correct title", async ({ page }) => {
        const home = new Home(page);
        await home.goto();
        await expect(home.page).toHaveTitle("Home | Earnings Dashboard");
    });

    test("should show heading", async ({ page }) => {
        const home = new Home(page);
        await home.goto();
        await expect(home.heading).toBeVisible();
    });

    test("should show sign in link button", async ({ page }) => {
        const home = new Home(page);
        await home.goto();
        await expect(home.signInLinkButton).toBeVisible();
    });

});