document.addEventListener("DOMContentLoaded", async () => {

    // html elements
    const formElement = document.getElementById("settings-form");
    const messageElement = document.getElementById("message");

    // load settings
    let data;
    try {
        const res = await fetch("/api/settings");
        if (res.ok) {
            data = await res.json();
            for (const [key, value] of Object.entries(data)) {
                const input = formElement.elements.namedItem(key);
                if (input) input.value = value;
            }
        } else if (res.status === 404) {
            messageElement.style.color = "red";
            messageElement.textContent = "Please fill your settings.";
        } else {
            throw new Error("Failed to fetch settings");
        }
    } catch (err) {
        console.error("Error: Failed to fetch settings", err);
    }

    // form submit
    formElement.addEventListener("submit", async (e) => {
        e.preventDefault();
        messageElement.textContent = "";

        const formData = new FormData(formElement);
        const payload = {};

        for (const [key, value] of formData.entries()) {
            if (["mandayRate", "vatRate", "workHoursStart", "workHoursEnd"].includes(key)) {
                payload[key] = parseFloat(value);
            } else {
                payload[key] = value.trim();
            }
        }

        if (payload.workHoursStart > payload.workHoursEnd) {
            messageElement.textContent = "Work hours start must be before end.";
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
                messageElement.style.color = "red";
                messageElement.textContent = "Failed to save settings.";
                throw new Error("Failed to save settings");
            }
        } catch (err) {
            console.error("Error: Failed to save settings", err);
        }
    });
});