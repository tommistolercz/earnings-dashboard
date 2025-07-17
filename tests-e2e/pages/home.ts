import { Page, Locator } from "@playwright/test";


export class Home {
    readonly page: Page;
    readonly heading: Locator;
    readonly signInLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole("heading", { name: "Earnings Dashboard" });
        this.signInLink = page.getByRole("link", { name: "Sign in" });
    }

    async goto() {
        await this.page.goto("/");
    }
}