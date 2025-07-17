import { Page, Locator } from "@playwright/test";


export class Dashboard {
    readonly page: Page;
    readonly settingsLink: Locator;
    readonly signOutLink: Locator;
    readonly currentEarningsHeading: Locator;
    readonly maximumEarningsHeading: Locator;

    constructor(page: Page) {
        this.page = page;
        this.settingsLink = page.getByRole("link", { name: "Settings" });
        this.signOutLink = page.getByRole("link", { name: "Sign out" });
        this.currentEarningsHeading = page.getByRole("heading", { name: "Current Earnings" });
        this.maximumEarningsHeading = page.getByRole("heading", { name: "Maximum Earnings" });
    }

    async goto() {
        await this.page.goto("/dashboard");
    }
}