document.addEventListener("DOMContentLoaded", async () => {

    // format amounts
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

    // loading spinner
    class LoadingSpinner {
        constructor() {
            this.spinnerElement = document.getElementById("loading-spinner");
            this.containerElement = document.getElementById("container");
        }
        show() {
            this.containerElement.style.display = "none";
            this.spinnerElement.style.display = "block";
        }
        hide() {
            this.spinnerElement.style.display = "none";
            this.containerElement.style.display = "block";
        }
    }

    // update dashboard 
    async function updateDashboard() {

        let data;
        try {
            const res = await fetch("/api/dashboard");
            if (!res.ok) {
                throw new Error("Failed to fetch dashboard data");
            }
            data = await res.json();
        } catch (err) {
            console.error("Error: Failed to fetch dashboard data", err);
            clearInterval(interval);
            return;
        }

        const currentEarningsElement = document.getElementById("current-earnings");
        const currentEarningsVATInfoElement = document.getElementById("current-earnings-vat-info");
        const currentEarningsStatusElement = document.getElementById("current-earnings-status");
        const maximumEarningsElement = document.getElementById("maximum-earnings");
        const maximumEarningsVATInfoElement = document.getElementById("maximum-earnings-vat-info");

        // show current/maximum earnings
        currentEarningsElement.textContent = formatAmount(data.earnings.currentEarnings, data.earnings.currency);
        maximumEarningsElement.textContent = formatAmount(data.earnings.maximumEarnings, data.earnings.currency);

        // show VAT info?
        const useVAT = data.earnings.useVAT;
        if (useVAT) {
            currentEarningsVATInfoElement.style.display = "block";
            maximumEarningsVATInfoElement.style.display = "block";
        } else {
            currentEarningsVATInfoElement.style.display = "none";
            maximumEarningsVATInfoElement.style.display = "none";
        }

        // is earning time?
        const isEarningTime = data.calendar.isEarningTime;
        currentEarningsStatusElement.textContent = isEarningTime ? "It's earning time!" : getNotEarningTimeReason(data);
        currentEarningsStatusElement.className = "status " + (isEarningTime ? "earning" : "not-earning");
    }

    // show dashboard and update every second
    const spinner = new LoadingSpinner();
    spinner.show();
    await updateDashboard();
    spinner.hide();

    let interval;
    interval = setInterval(updateDashboard, 1000);
});