import express from "express";
import { isAuthenticatedApi } from "../../middleware/authenticated";
import { prisma } from "../../db/db";
import { UserSettings } from "./api-settings";
import { DateTime } from "luxon";
import Holidays from "date-holidays";

const router = express.Router();

// rounds amount to two decimal places
export function roundAmount(amount: number): number {
    return parseFloat(amount.toFixed(2));
}

// returns true if the date is a weekend
export function getIsWeekend(now: DateTime): boolean {
    const weekday = now.weekday;
    return weekday === 6 || weekday === 7; // saturday or sunday
}

// returns true if the date is a public holiday
export function getIsHoliday(now: DateTime, settings: UserSettings): boolean {
    const holidays = new Holidays(settings.country);
    const todayHolidays = holidays.isHoliday(now.toJSDate());
    return todayHolidays ? todayHolidays.some(holiday => holiday.type === "public") : false;
}

// returns true if the current time is within earning hours
export function getIsEarningTime(now: DateTime, settings: UserSettings): boolean {
    const hour = now.hour;
    const isWorkHour = hour >= settings.workHoursStart && hour < settings.workHoursEnd;
    const isWeekend = getIsWeekend(now);
    const isHoliday = getIsHoliday(now, settings);
    return isWorkHour && !isWeekend && !isHoliday;
}

// returns the number of working days in a month
export function getWorkingDaysInMonth(now: DateTime, settings: UserSettings): number {
    let count = 0;
    const daysInMonth = now.endOf("month").day;
    for (let day = 1; day <= daysInMonth; day++) {
        const date = DateTime.fromObject({
            year: now.year,
            month: now.month,
            day: day
        }, { zone: settings.timeZone });
        const isWeekend = getIsWeekend(date);
        const isHoliday = getIsHoliday(date, settings);
        if (!isWeekend && !isHoliday) count++;
    }
    return count;
}

// calculates current earnings from the start of the month until now
export function getCurrentEarnings(now: DateTime, settings: UserSettings): number {
    let earnings = 0;
    const msPerHour = 1000 * 60 * 60;
    const year = now.year;
    const month = now.month;
    const startOfMonth = DateTime.fromObject({
        year: year,
        month: month,
        day: 1,
        hour: settings.workHoursStart,
        minute: 0,
        second: 0
    }, { zone: settings.timeZone });
    const today = DateTime.fromObject({
        year: year,
        month: month,
        day: now.day
    }, { zone: settings.timeZone });

    // calculate earnings for each day of the month until today
    let day = startOfMonth;
    while (day < today) {
        const isWeekend = getIsWeekend(day);
        const isHoliday = getIsHoliday(day, settings);
        if (!isWeekend && !isHoliday) {
            earnings += settings.mandayRate;
        }
        day = day.plus({ days: 1 });
    }
    // for today
    const isWeekend = getIsWeekend(today);
    const isHoliday = getIsHoliday(today, settings);
    if (!isWeekend && !isHoliday) {
        const workStart = DateTime.fromObject({
            year: year,
            month: month,
            day: now.day,
            hour: settings.workHoursStart,
            minute: 0,
            second: 0
        }, { zone: settings.timeZone });
        const workEnd = DateTime.fromObject({
            year: year,
            month: month,
            day: now.day,
            hour: settings.workHoursEnd,
            minute: 0,
            second: 0
        }, { zone: settings.timeZone });
        if (now > workStart) {
            const end = now < workEnd ? now : workEnd;
            const workedMs = end.toMillis() - workStart.toMillis();
            const workedHours = workedMs / msPerHour;
            earnings += (settings.mandayRate / 8) * workedHours;
        }
    }
    return roundAmount(earnings);
}

// calculates maximum earnings in a month
export function getMaximumEarnings(now: DateTime, settings: UserSettings): number {
    const workingDays = getWorkingDaysInMonth(now, settings);
    const maximumEarnings = workingDays * settings.mandayRate;
    return roundAmount(maximumEarnings);
}

export type EarningsGrowthRate = {
    perDay: number;
    perHour: number;
    perMinute: number;
    perSecond: number;
};

// calculates earnings growth rate
export function getEarningsGrowthRate(settings: UserSettings): EarningsGrowthRate {
    const earningsGrowthRate: EarningsGrowthRate = {
        perDay: roundAmount(settings.mandayRate),
        perHour: roundAmount(settings.mandayRate / 8),
        perMinute: roundAmount(settings.mandayRate / 8 / 60),
        perSecond: roundAmount(settings.mandayRate / 8 / 60 / 60)
    };
    return earningsGrowthRate;
}

// calculates earnings with VAT
export function getEarningsWithVAT(earnings: number, settings: UserSettings): number {
    return roundAmount(earnings * (1 + settings.vatRate));
}


// route for api endpoint
router.get("/api/dashboard", isAuthenticatedApi, async (req, res) => {

    // get user settings from db
    const settings = await prisma.userSetting.findUnique({
        where: { userId: req.user!.id }
    });
    if (!settings) {
        res.status(404).json({ error: "User settings not found" });
        return;
    }

    const now = DateTime.now().setZone(settings.timeZone);
    const isWeekend = getIsWeekend(now);
    const isHoliday = getIsHoliday(now, settings);
    const isEarningTime = getIsEarningTime(now, settings);
    const workingDaysInMonth = getWorkingDaysInMonth(now, settings);
    let currentEarnings = getCurrentEarnings(now, settings);
    let maximumEarnings = getMaximumEarnings(now, settings);
    let earningsGrowthRate = getEarningsGrowthRate(settings);
    const useVAT = settings.vatRate > 0;
    if (useVAT) {
        currentEarnings = getEarningsWithVAT(currentEarnings, settings);
        maximumEarnings = getEarningsWithVAT(maximumEarnings, settings);
        earningsGrowthRate = Object.fromEntries(
            Object.entries(earningsGrowthRate).map(([k, v]) => [k, getEarningsWithVAT(v, settings)])
        ) as EarningsGrowthRate;
    }

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
            maximumEarnings: maximumEarnings,
            earningsGrowthRate: earningsGrowthRate,
            useVAT: useVAT,
            currency: settings.currency,
        }
    });
});

export default router;