document.addEventListener("DOMContentLoaded", async () => {

    // populate data for dropdowns
    const [tzRes, countryRes] = await Promise.all([
        fetch("/public/data/timezones.json"),
        fetch("/public/data/countries.json")
    ]);
    const timezones = await tzRes.json();
    const countries = await countryRes.json();

    fillDropdown("timeZone", timezones);
    fillDropdown("country", countries);

    function fillDropdown(selectId, options) {
        const select = document.getElementById(selectId);
        options.forEach(o => {
            const option = document.createElement("option");
            option.value = o.value;
            option.textContent = o.label;
            select.appendChild(option);
        });
    }

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

        if (payload.workHoursEnd - payload.workHoursStart != 8) {
            messageElement.textContent = "Work hours must be 8 hours.";
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