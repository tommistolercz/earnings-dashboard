import { defineConfig } from "vitest/config";


export default defineConfig({
    test: {
        exclude: [
            "node_modules",
            "dist",
            ".git",
            "tests-e2e",
            "**/playwright/**",
        ]
    }
});
