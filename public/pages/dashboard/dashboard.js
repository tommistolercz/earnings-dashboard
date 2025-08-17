document.addEventListener("DOMContentLoaded", async () => {

    // format amounts
    function formatAmount(amount, currency) {
        amountFormatted = new Intl.NumberFormat("cs-CZ", {
            style: "decimal",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);

        const [whole, fraction] = amountFormatted.split(",");
        return `<span class="whole">${whole},</span><span class="fraction">${fraction}</span> <span class="currency">${currency}</span>`;
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
            this.contentElement = document.getElementById("loading-content");
        }
        show() {
            this.contentElement.style.display = "none";
            this.spinnerElement.style.display = "flex";
        }
        hide() {
            this.spinnerElement.style.display = "none";
            this.contentElement.style.display = "flex";

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
        const maximumEarningsElement = document.getElementById("maximum-earnings");
        const maximumEarningsVATInfoElement = document.getElementById("maximum-earnings-vat-info");
        const perDayElement = document.getElementById("per-day");
        const perHourElement = document.getElementById("per-hour");
        const perMinuteElement = document.getElementById("per-minute");
        const perSecondElement = document.getElementById("per-second");
        const growthRateVATInfoElement = document.getElementById("growth-rate-vat-info");
        const earningsStatusElement = document.getElementById("earnings-status");

        // show current/maximum earnings
        currentEarningsElement.innerHTML = formatAmount(data.earnings.currentEarnings, data.earnings.currency);
        maximumEarningsElement.innerHTML = formatAmount(data.earnings.maximumEarnings, data.earnings.currency);

        // show growth rate
        perDayElement.innerHTML = formatAmount(data.earnings.earningsGrowthRate.perDay, data.earnings.currency) + ` <span class="per">/day</span>`;
        perHourElement.innerHTML = formatAmount(data.earnings.earningsGrowthRate.perHour, data.earnings.currency) + ` <span class="per">/hour</span>`;
        perMinuteElement.innerHTML = formatAmount(data.earnings.earningsGrowthRate.perMinute, data.earnings.currency) + ` <span class="per">/min</span>`;
        perSecondElement.innerHTML = formatAmount(data.earnings.earningsGrowthRate.perSecond, data.earnings.currency) + ` <span class="per">/sec</span>`;

        // show VAT info?
        const useVAT = data.earnings.useVAT;
        if (useVAT) {
            currentEarningsVATInfoElement.style.display = "block";
            maximumEarningsVATInfoElement.style.display = "block";
            growthRateVATInfoElement.style.display = "block";
        } else {
            currentEarningsVATInfoElement.style.display = "none";
            maximumEarningsVATInfoElement.style.display = "none";
            growthRateVATInfoElement.style.display = "none";
        }

        // earnings status
        const isEarningTime = data.calendar.isEarningTime;
        earningsStatusElement.textContent = isEarningTime ? "It's earning time!" : getNotEarningTimeReason(data);
        earningsStatusElement.className = "status " + (isEarningTime ? "earning" : "not-earning");
    }

    // show dashboard and update every second
    const spinner = new LoadingSpinner();
    spinner.show();
    await updateDashboard();
    spinner.hide();

    let interval;
    interval = setInterval(updateDashboard, 1000);
});