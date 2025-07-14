document.addEventListener("DOMContentLoaded", async () => {

    // formatting amounts
    function formatAmount(amount, currency) {
        amountFormatted = new Intl.NumberFormat("cs-CZ", {
            style: "decimal",
            maximumFractionDigits: 0
        }).format(amount);
        return `${amountFormatted} ${currency}`;
    }

    // get not-earning time reason
    function getNotEarningTimeReason(data) {
        if (data.calendar.isWeekend) {
            return "Weekend!";
        } else if (data.calendar.isHoliday) {
            return "Holiday!";
        } else {
            return "Outside working hours!";
        }
    }

    // html elements
    const currentEarningsElement = document.getElementById("current-earnings");
    const currentEarningsStatusElement = document.getElementById("current-earnings-status");
    const maximumEarningsElement = document.getElementById("maximum-earnings");

    let interval;
    async function updateDashboard() {

        // get dashboard data from api
        let data;
        try {
            const res = await fetch("/api/dashboard");
            if (!res.ok) {
                throw new Error("Failed to fetch dashboard data");
            }
            data = await res.json();
        } catch (err) {
            console.error("Error: Failed to fetch dashboard data", err);
            clearInterval(interval); // stop the interval on error
            return;
        }

        // show current earnings
        currentEarningsElement.textContent = formatAmount(data.earnings.currentEarningsWithVAT, data.earnings.currency);
        const isEarningTime = data.calendar.isEarningTime;
        currentEarningsStatusElement.textContent = isEarningTime ? "It's earning time!" : getNotEarningTimeReason(data);
        currentEarningsStatusElement.className = "status " + (isEarningTime ? "earning" : "not-earning");

        // show maximum earnings
        maximumEarningsElement.textContent = formatAmount(data.earnings.maximumEarningsWithVAT, data.earnings.currency);
    }

    // update dashboard data every second
    updateDashboard();
    interval = setInterval(updateDashboard, 1000);
});