(async () => {
    try {
        const res = await fetch("/api/settings");
        if (res.status === 404) {
            window.location.href = "/settings";
        } else if (!res.ok) {
            throw new Error("Failed to check settings");
        }
    } catch (err) {
        console.error("Error: Failed to check settings", err);
    }
})();