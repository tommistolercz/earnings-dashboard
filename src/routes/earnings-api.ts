import { Router } from "express";
import { TZDate } from "@date-fns/tz";
import Holidays from "date-holidays";

const router = Router();

// personal settings
export const MANDAY_RATE = 7600;
export const CURRENCY = "CZK";
export const VAT_RATE = 0.21; // 21% VAT
export const COUNTRY = "CZ"; // user's country (for holidays)
export const TIME_ZONE = "Europe/Prague"; // user's time zone
export const WORK_HOURS_START = 9;
export const WORK_HOURS_END = 17;

// returns true if the date is a weekend
export function getIsWeekend(now: Date): boolean {
    return now.getDay() === 0 || now.getDay() === 6;
}

// returns true if the date is a public holiday
export function getIsHoliday(now: Date): boolean {
    const holidays = new Holidays(COUNTRY);
    const todayHolidays = holidays.isHoliday(now);
    return todayHolidays ? todayHolidays.some(holiday => holiday.type === "public") : false;
}

// returns true if the current time is within earning hours
export function getIsEarningTime(now: Date): boolean {
    const hour = now.getHours();
    const isWorkHour = hour >= WORK_HOURS_START && hour < WORK_HOURS_END;
    const isWeekend = getIsWeekend(now);
    const isHoliday = getIsHoliday(now);
    return isWorkHour && !isWeekend && !isHoliday;
}

// returns the number of working days in a month
export function getWorkingDaysInMonth(now: Date): number {
    let count = 0;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(now.getFullYear(), now.getMonth(), day);
        const isWeekend = getIsWeekend(date);
        const isHoliday = getIsHoliday(date);
        if (!isWeekend && !isHoliday) count++;
    }
    return count;
}

// calculates current earnings from the start of the month until now
export function getCurrentEarnings(now: Date): number {
    let earnings = 0;
    const msPerHour = 1000 * 60 * 60;
    const year = now.getFullYear();
    const month = now.getMonth();
    const startOfMonth = new Date(year, month, 1, WORK_HOURS_START, 0, 0, 0);
    const today = new Date(year, month, now.getDate());
    let day = new Date(startOfMonth);

    while (day < today) {
        const isWeekend = getIsWeekend(day);
        const isHoliday = getIsHoliday(day);
        if (!isWeekend && !isHoliday) {
            earnings += MANDAY_RATE;
        }
        day.setDate(day.getDate() + 1);
    }
    // for today - only if it is a working day and within working hours
    const isWeekend = getIsWeekend(today);
    const isHoliday = getIsHoliday(today);
    if (!isWeekend && !isHoliday) {
        const workStart = new Date(year, month, now.getDate(), WORK_HOURS_START, 0, 0, 0);
        const workEnd = new Date(year, month, now.getDate(), WORK_HOURS_END, 0, 0, 0);
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
export function getEarningsWithVAT(earnings: number): number {
    return Math.floor(earnings * (1 + VAT_RATE));
}

// route for earnings API endpoint
router.get("/api/earnings", (req, res) => {
    const now = new TZDate(new Date(), TIME_ZONE);
    const isWeekend = getIsWeekend(now);
    const isHoliday = getIsHoliday(now);
    const isEarningTime = getIsEarningTime(now);
    const workingDaysInMonth = getWorkingDaysInMonth(now);
    const currentEarnings = getCurrentEarnings(now);
    const currentEarningsWithVAT = getEarningsWithVAT(currentEarnings);
    const maximumEarnings = workingDaysInMonth * MANDAY_RATE;
    const maximumEarningsWithVAT = getEarningsWithVAT(maximumEarnings);

    res.json({
        personalSettings: {
            mandayRate: MANDAY_RATE,
            currency: CURRENCY,
            vatRate: VAT_RATE,
            country: COUNTRY,
            timeZone: TIME_ZONE,
            workHoursStart: WORK_HOURS_START,
            workHoursEnd: WORK_HOURS_END,
        },
        calendar: {
            now: now,
            isWeekend: isWeekend,
            isHoliday: isHoliday,
            isEarningTime: isEarningTime,
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