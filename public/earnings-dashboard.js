// HTML element references
const currentEarningsElement = document.getElementById("current-earnings");
const maximumEarningsElement = document.getElementById("maximum-earnings");

// formatting amounts
function formatAmount(amount, currency) {
    amountFormatted = new Intl.NumberFormat("cs-CZ", {
        style: "decimal",
        maximumFractionDigits: 0
    }).format(amount);
    return `${amountFormatted} ${currency}`;
}

// get earnings data from API and show them in HTML
async function getEarnings() {

    // call API
    const res = await fetch("/api/earnings");
    const data = await res.json();

    // update HTML elements
    currentEarningsElement.textContent = formatAmount(data.earnings.currentEarningsWithVAT, data.earnings.currency);
    maximumEarningsElement.textContent = formatAmount(data.earnings.maximumEarningsWithVAT, data.earnings.currency);
}

// get earnings and update every second
getEarnings();
setInterval(getEarnings, 1000);
