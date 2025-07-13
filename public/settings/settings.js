document.addEventListener("DOMContentLoaded", async () => {

    const form = document.getElementById("settings-form");
    const messageBox = document.getElementById("message");

    // Load existing settings
    try {
        const res = await fetch("/api/settings");
        if (res.ok) {
            const data = await res.json();
            for (const [key, value] of Object.entries(data)) {
                const input = form.elements.namedItem(key);
                if (input) input.value = value;
            }
        } else if (res.status !== 404) {
            messageBox.textContent = "Error loading settings.";
        }
    } catch (err) {
        messageBox.textContent = "Failed to load settings.";
    }

    // Handle form submit
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        messageBox.textContent = "";

        const formData = new FormData(form);
        const payload = {};

        for (const [key, value] of formData.entries()) {
            if (["mandayRate", "vatRate", "workHoursStart", "workHoursEnd"].includes(key)) {
                payload[key] = parseFloat(value);
            } else {
                payload[key] = value.trim();
            }
        }

        if (payload.workHoursStart > payload.workHoursEnd) {
            messageBox.textContent = "Work hours start must be before end.";
            return;
        }

        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                window.location.href = "/dashboard";
            } else {
                const err = await res.json();
                messageBox.style.color = "red";
                messageBox.textContent = "Save failed: " + (err.details?.[0]?.message || err.error);
            }
        } catch (err) {
            messageBox.textContent = "Error saving settings.";
        }
    });
});