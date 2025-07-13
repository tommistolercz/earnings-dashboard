import express from "express";
import { isAuthenticatedApi } from "../../middleware/authenticated";
import axios from "axios";
import { UserSettings } from "./api-settings";
import { TZDate } from "@date-fns/tz";
import Holidays from "date-holidays";

const router = express.Router();

// returns true if the date is a weekend
export function getIsWeekend(now: Date): boolean {
    return now.getDay() === 0 || now.getDay() === 6;
}

// returns true if the date is a public holiday
export function getIsHoliday(now: Date, settings: UserSettings): boolean {
    const holidays = new Holidays(settings.country);
    const todayHolidays = holidays.isHoliday(now);
    return todayHolidays ? todayHolidays.some(holiday => holiday.type === "public") : false;
}

// returns true if the current time is within earning hours
export function getIsEarningTime(now: Date, settings: UserSettings): boolean {
    const hour = now.getHours();
    const isWorkHour = hour >= settings.workHoursStart && hour < settings.workHoursEnd;
    const isWeekend = getIsWeekend(now);
    const isHoliday = getIsHoliday(now, settings);
    return isWorkHour && !isWeekend && !isHoliday;
}

// returns the number of working days in a month
export function getWorkingDaysInMonth(now: Date, settings: UserSettings): number {
    let count = 0;
    const daysInMonth = new TZDate(new Date(now.getFullYear(), now.getMonth() + 1, 0), settings.timeZone).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new TZDate(new Date(now.getFullYear(), now.getMonth(), day), settings.timeZone);
        const isWeekend = getIsWeekend(date);
        const isHoliday = getIsHoliday(date, settings);
        if (!isWeekend && !isHoliday) count++;
    }
    return count;
}

// calculates current earnings from the start of the month until now
export function getCurrentEarnings(now: Date, settings: UserSettings): number {
    let earnings = 0;
    const msPerHour = 1000 * 60 * 60;
    const year = now.getFullYear();
    const month = now.getMonth();
    const startOfMonth = new TZDate(new Date(year, month, 1, settings.workHoursStart, 0, 0, 0), settings.timeZone);
    const today = new TZDate(new Date(year, month, now.getDate()), settings.timeZone);

    let day = new TZDate(new Date(startOfMonth), settings.timeZone);
    while (day < today) {
        const isWeekend = getIsWeekend(day);
        const isHoliday = getIsHoliday(day, settings);
        if (!isWeekend && !isHoliday) {
            earnings += settings.mandayRate; // full day earnings
        }
        day.setDate(day.getDate() + 1);
    }
    // for today - only if it is a working day and within working hours
    const isWeekend = getIsWeekend(today);
    const isHoliday = getIsHoliday(today, settings);
    if (!isWeekend && !isHoliday) {
        const workStart = new TZDate(new Date(year, month, now.getDate(), settings.workHoursStart, 0, 0, 0), settings.timeZone);
        const workEnd = new TZDate(new Date(year, month, now.getDate(), settings.workHoursEnd, 0, 0, 0), settings.timeZone);
        if (now > workStart) {
            const end = now < workEnd ? now : workEnd;
            const workedMs = end.getTime() - workStart.getTime();
            const workedHours = workedMs / msPerHour;
            earnings += (settings.mandayRate / 8) * workedHours;
        }
    }
    return Math.floor(earnings);
}

// calculates earnings with VAT
export function getEarningsWithVAT(earnings: number, settings: UserSettings): number {
    return Math.floor(earnings * (1 + settings.vatRate));
}

// route for api endpoint
router.get("/api/dashboard", isAuthenticatedApi, async (req, res) => {

    // get user settings from api
    let settings: UserSettings;
    try {
        const settingsRes = await axios.get(
            `${req.protocol}://${req.get("host")}/api/settings`, {
            headers: req.headers,
        });
        settings = settingsRes.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            console.error("Error: Failed to fetch settings", err.response?.status, err.response?.data);
        }
        return;
    }

    const now = new TZDate(new Date(), settings.timeZone);
    const isWeekend = getIsWeekend(now);
    const isHoliday = getIsHoliday(now, settings);
    const isEarningTime = getIsEarningTime(now, settings);
    const workingDaysInMonth = getWorkingDaysInMonth(now, settings);
    const currentEarnings = getCurrentEarnings(now, settings);
    const currentEarningsWithVAT = getEarningsWithVAT(currentEarnings, settings);
    const maximumEarnings = workingDaysInMonth * settings.mandayRate;
    const maximumEarningsWithVAT = getEarningsWithVAT(maximumEarnings, settings);

    res.json({
        settings: settings,
        calendar: {
            now: now,
            isWeekend: isWeekend,
            isHoliday: isHoliday,
            isEarningTime: isEarningTime,
            workingDaysInMonth: workingDaysInMonth,
        },
        earnings: {
            currentEarnings: currentEarnings,
            currentEarningsWithVAT: currentEarningsWithVAT,
            maximumEarnings: maximumEarnings,
            maximumEarningsWithVAT: maximumEarningsWithVAT,
            currency: settings.currency,
        },
    });
});

export default router;