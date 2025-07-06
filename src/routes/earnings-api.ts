import { Router } from "express";

const router = Router();

// personal settings
const MANDAY_RATE = 7600;
const CURRENCY = "CZK";
const VAT_RATE = 0.21; // 21% VAT in CZ
const WORK_HOURS_START = 9;
const WORK_HOURS_END = 17;

// simple list of Czech public holidays (YYYY-MM-DD)
function getCzechHolidays(year: number): string[] {
    return [
        `${year}-01-01`, // Nový rok
        `${year}-05-01`, // Svátek práce
        `${year}-05-08`, // Den vítězství
        `${year}-07-05`, // Cyril a Metoděj
        `${year}-07-06`, // Jan Hus
        `${year}-09-28`, // Svatý Václav
        `${year}-10-28`, // Den vzniku ČSR
        `${year}-11-17`, // Den boje za svobodu
        `${year}-12-24`, // Štědrý den
        `${year}-12-25`, // 1. svátek vánoční
        `${year}-12-26`, // 2. svátek vánoční
    ];
}

// returns the number of working days in a month
function getWorkingDaysInMonth(year: number, month: number, holidays: string[]): number {
    let count = 0;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const iso = date.toISOString().slice(0, 10);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isHoliday = holidays.includes(iso);
        if (!isWeekend && !isHoliday) count++;
    }
    return count;
}

// returns true if the current time is within earning hours
function isEarningTime(now: Date, holidays: string[]): boolean {
    const hour = now.getHours();
    const isWorkHour = hour >= WORK_HOURS_START && hour < WORK_HOURS_END;
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    const iso = now.toISOString().slice(0, 10);
    const isHoliday = holidays.includes(iso);
    return isWorkHour && !isWeekend && !isHoliday;
}

// calculates current earnings from the start of the month until now
function getCurrentEarnings(now: Date, workingDays: number, holidays: string[]): number {
    let earnings = 0;
    const msPerHour = 1000 * 60 * 60; // milliseconds in an hour
    const msPerDay = msPerHour * 8;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, WORK_HOURS_START, 0, 0, 0);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let day = new Date(startOfMonth);

    while (day < today) {
        const iso = day.toISOString().slice(0, 10);
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        const isHoliday = holidays.includes(iso);
        if (!isWeekend && !isHoliday) {
            earnings += MANDAY_RATE;
        }
        day.setDate(day.getDate() + 1);
    }

    // For today - only if it is a working day and within working hours
    const isoToday = today.toISOString().slice(0, 10);
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;
    const isHoliday = holidays.includes(isoToday);
    if (!isWeekend && !isHoliday) {
        const workStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), WORK_HOURS_START, 0, 0, 0);
        const workEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), WORK_HOURS_END, 0, 0, 0);
        if (now > workStart) {
            const end = now < workEnd ? now : workEnd;
            const workedMs = end.getTime() - workStart.getTime();
            const workedHours = workedMs / msPerHour;
            earnings += (MANDAY_RATE / 8) * workedHours;
        }
    }

    return Math.floor(earnings);
}

// calculates earnings with VAT
function getEarningsWithVAT(earnings: number): number {
    return Math.floor(earnings * (1 + VAT_RATE));
}

// route for earnings API endpoint
router.get("/api/earnings", (req, res) => {
    const now = new Date();
    //const now = new Date("2025-07-01T15:01:00.000Z"); // temporary set fake datetime for testing
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based
    const yearMonthStr = `${year}-${String(month + 1).padStart(2, "0")}`;  // e.g. "2025-06"
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    const holidays = getCzechHolidays(year);
    const isHoliday = holidays.includes(now.toISOString().slice(0, 10));
    const earningTime = isEarningTime(now, holidays);
    const workingDaysInMonth = getWorkingDaysInMonth(year, month, holidays);
    const currentEarnings = getCurrentEarnings(now, workingDaysInMonth, holidays);
    const currentEarningsWithVAT = getEarningsWithVAT(currentEarnings);
    const maximumEarnings = workingDaysInMonth * MANDAY_RATE;
    const maximumEarningsWithVAT = getEarningsWithVAT(maximumEarnings);

    res.json({
        personalSettings: {
            mandayRate: MANDAY_RATE,
            currency: CURRENCY,
            vatRate: VAT_RATE,
            workHoursStart: WORK_HOURS_START,
            workHoursEnd: WORK_HOURS_END,
        },
        calendar: {
            now: now.toLocaleString("cs-CZ"),
            yearMonthStr: yearMonthStr,
            isWeekend: isWeekend,
            isHoliday: isHoliday,
            isEarningTime: earningTime,
            workingDaysInMonth: workingDaysInMonth,
        },
        earnings: {
            currentEarnings: currentEarnings,
            maximumEarnings: maximumEarnings,
            currentEarningsWithVAT: currentEarningsWithVAT,
            maximumEarningsWithVAT: maximumEarningsWithVAT,
            currency: CURRENCY,
        },
    });
});

export default router;