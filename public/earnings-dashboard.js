// HTML element references
const currentEarningsElement = document.getElementById("current-earnings");
const maximumEarningsElement = document.getElementById("maximum-earnings");
const statusElement = document.getElementById("status");

// formatting amounts
function formatAmount(amount, currency) {
    amountFormatted = new Intl.NumberFormat("cs-CZ", {
        style: "decimal",
        maximumFractionDigits: 0
    }).format(amount);
    return `${amountFormatted} ${currency}`;
}

// not-earning time reason
function getNotEarningTimeReason(data) {
    if (data.calendar.isWeekend) {
        return "Weekend!";
    } else if (data.calendar.isHoliday) {
        return "Holiday!";
    } else {
        return "Outside working hours!";
    }
}

// get earnings data from API and show them in HTML
async function getEarnings() {

    // call API
    const res = await fetch("/api/earnings");
    const data = await res.json();

    // current/maximum earnings
    currentEarningsElement.textContent = formatAmount(data.earnings.currentEarningsWithVAT, data.earnings.currency);
    maximumEarningsElement.textContent = formatAmount(data.earnings.maximumEarningsWithVAT, data.earnings.currency);

    // status
    const isEarningTime = data.calendar.isEarningTime;

    statusElement.textContent = isEarningTime ? "It's earning time!" : getNotEarningTimeReason(data);
    statusElement.className = "status " + (isEarningTime ? "earning" : "not-earning");
}

// get earnings and update every second
getEarnings();
setInterval(getEarnings, 1000);
