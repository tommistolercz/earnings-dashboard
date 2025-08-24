import { UserSettings } from "../types/settings";
import { EarningsGrowthRate, DashboardData } from "../types/dashboard";
import { DateTime } from "luxon";
import Holidays from "date-holidays";


// helper: rounds an amount to two decimal places
export function roundAmount(amount: number): number {
    return parseFloat(amount.toFixed(2));
}

// helper: parses a time string in the format "hh:mm" and returns as a float number (e.g. "9:30" -> 9.5)
export function parseTimeStringToFloat(str: string): number {
    const [h, m = "0"] = str.split(":");
    return parseInt(h, 10) + parseInt(m, 10) / 60;
}

// helper: parses a time string in the format "hh:mm" and returns as an object
export function parseTimeStringToObject(str: string): { hour: number, minute: number } {
    const [h, m = "0"] = str.split(":");
    return {
        hour: parseInt(h, 10),
        minute: parseInt(m, 10)
    };
}

// dashboard service
export class Dashboard {
    constructor(private settings: UserSettings) { }

    // returns true if the date is a weekend
    getIsWeekend(dt: DateTime): boolean {
        const weekday = dt.weekday;
        return weekday === 6 || weekday === 7; // saturday or sunday
    }

    // returns true if the date is a public holiday
    getIsHoliday(dt: DateTime): boolean {
        const holidays = new Holidays(this.settings.country);
        const todayHolidays = holidays.isHoliday(dt.toJSDate());
        return todayHolidays ? todayHolidays.some(holiday => holiday.type === "public") : false;
    }

    // returns true if the current datetime is earning time
    getIsEarningTime(dt: DateTime): boolean {
        const current = dt.hour + dt.minute / 60;
        const workHourStart = parseTimeStringToFloat(this.settings.workHoursStart);
        const workHourEnd = parseTimeStringToFloat(this.settings.workHoursEnd);
        const isWorkHour = current >= workHourStart && current < workHourEnd;
        const isWeekend = this.getIsWeekend(dt);
        const isHoliday = this.getIsHoliday(dt);
        return isWorkHour && !isWeekend && !isHoliday;
    }

    // returns the number of working days in a month
    getWorkingDaysInMonth(dt: DateTime): number {
        const daysInMonth = dt.endOf("month").day;
        let workingDays = 0;
        for (let day = 1; day <= daysInMonth; day++) {
            const date = DateTime.fromObject({
                year: dt.year,
                month: dt.month,
                day: day
            }, { zone: this.settings.timeZone });
            const isWeekend = this.getIsWeekend(date);
            const isHoliday = this.getIsHoliday(date);
            if (!isWeekend && !isHoliday) workingDays++;
        }
        return workingDays;
    }

    // calculates current earnings from the start of the month
    getCurrentEarnings(dt: DateTime): number {
        let earnings = 0;
        const msPerHour = 1000 * 60 * 60;
        const year = dt.year;
        const month = dt.month;
        const { hour: startHour, minute: startMinute } = parseTimeStringToObject(this.settings.workHoursStart);
        const { hour: endHour, minute: endMinute } = parseTimeStringToObject(this.settings.workHoursEnd);
        const startOfMonth = DateTime.fromObject({
            year,
            month,
            day: 1,
            hour: startHour,
            minute: startMinute,
            second: 0
        }, { zone: this.settings.timeZone });
        const today = DateTime.fromObject({
            year,
            month,
            day: dt.day
        }, { zone: this.settings.timeZone });
        // earnings for each full day
        let day = startOfMonth;
        while (day < today) {
            if (!this.getIsWeekend(day) && !this.getIsHoliday(day)) {
                earnings += this.settings.mandayRate;
            }
            day = day.plus({ days: 1 });
        }
        // earnings for today
        if (!this.getIsWeekend(today) && !this.getIsHoliday(today)) {
            const workStart = DateTime.fromObject({
                year,
                month,
                day: dt.day,
                hour: startHour,
                minute: startMinute,
                second: 0
            }, { zone: this.settings.timeZone });
            const workEnd = DateTime.fromObject({
                year,
                month,
                day: dt.day,
                hour: endHour,
                minute: endMinute,
                second: 0
            }, { zone: this.settings.timeZone });
            if (dt > workStart) {
                const end = dt < workEnd ? dt : workEnd;
                const workedMs = end.toMillis() - workStart.toMillis();
                const workedHours = workedMs / msPerHour;
                earnings += (this.settings.mandayRate / 8) * workedHours;
            }
        }
        return roundAmount(earnings);
    }

    // calculates maximum earnings in a month
    getMaximumEarnings(dt: DateTime): number {
        const workingDays = this.getWorkingDaysInMonth(dt);
        const maximumEarnings = workingDays * this.settings.mandayRate;
        return roundAmount(maximumEarnings);
    }

    // calculates earnings growth rate
    getEarningsGrowthRate(): EarningsGrowthRate {
        const earningsGrowthRate: EarningsGrowthRate = {
            perDay: roundAmount(this.settings.mandayRate),
            perHour: roundAmount(this.settings.mandayRate / 8),
            perMinute: roundAmount(this.settings.mandayRate / 8 / 60),
            perSecond: roundAmount(this.settings.mandayRate / 8 / 60 / 60)
        };
        return earningsGrowthRate;
    }

    // calculates earnings with VAT
    getEarningsWithVAT(earnings: number): number {
        return roundAmount(earnings * (1 + this.settings.vatRate));
    }

    // calculates dashboard data
    getDashboardData(dt: DateTime): DashboardData {
        let currentEarnings = this.getCurrentEarnings(dt);
        let maximumEarnings = this.getMaximumEarnings(dt);
        let earningsGrowthRate = this.getEarningsGrowthRate();
        const useVAT = this.settings.vatRate > 0;
        if (useVAT) {
            currentEarnings = this.getEarningsWithVAT(currentEarnings);
            maximumEarnings = this.getEarningsWithVAT(maximumEarnings);
            earningsGrowthRate = Object.fromEntries(
                Object.entries(earningsGrowthRate).map(([k, v]) => [k, this.getEarningsWithVAT(v)])
            ) as EarningsGrowthRate;
        }
        return {
            settings: this.settings,
            calendar: {
                now: dt,
                isWeekend: this.getIsWeekend(dt),
                isHoliday: this.getIsHoliday(dt),
                isEarningTime: this.getIsEarningTime(dt),
                workingDaysInMonth: this.getWorkingDaysInMonth(dt),
            },
            earnings: {
                currentEarnings: currentEarnings,
                maximumEarnings: maximumEarnings,
                earningsGrowthRate: earningsGrowthRate,
                useVAT: useVAT,
                currency: this.settings.currency,
            }
        };
    }
}