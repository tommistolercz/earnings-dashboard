import { Page, Locator } from "@playwright/test";


export class Home {
    readonly page: Page;
    readonly heading: Locator;
    readonly signInLinkButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole("heading", { name: "Earnings Dashboard" });
        this.signInLinkButton = page.getByRole("link", { name: "Sign in" });
    }

    async goto() {
        await this.page.goto("/");
    }
}