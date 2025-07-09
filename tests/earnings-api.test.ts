import * as earningsApi from "../src/routes/earnings-api";
import { describe, it, expect } from "vitest";
import { TZDate } from "@date-fns/tz";

/* getIsWeekend() */
describe("getIsWeekend()", () => {

    // monday
    it("returns false for monday", () => {
        const monday = new TZDate(new Date("2025-07-07"), earningsApi.TIME_ZONE);
        expect(earningsApi.getIsWeekend(monday)).toBe(false);
    });

    // saturday
    it("returns true for saturday", () => {
        const saturday = new TZDate(new Date("2025-07-12"), earningsApi.TIME_ZONE);
        expect(earningsApi.getIsWeekend(saturday)).toBe(true);
    });

    // sunday
    it("returns true for sunday", () => {
        const sunday = new TZDate(new Date("2025-07-13"), earningsApi.TIME_ZONE);
        expect(earningsApi.getIsWeekend(sunday)).toBe(true);
    });
});

/* getIsHoliday() */
describe("getIsHoliday()", () => {

    // non-holiday
    it("returns false for a non-holiday", () => {
        const nonHoliday = new TZDate(new Date("2025-07-07"), earningsApi.TIME_ZONE);  // mon 2025-07-07
        expect(earningsApi.getIsHoliday(nonHoliday)).toBe(false);
    });

    // non-public holiday
    it("returns false for a non-public holiday", () => {
        const nonPublicHoliday = new TZDate(new Date("2025-04-17"), earningsApi.TIME_ZONE);  // easter maudy thursday
        expect(earningsApi.getIsHoliday(nonPublicHoliday)).toBe(false);
    });

    // public holiday
    it("returns true for a public holiday", () => {
        const publicHoliday = new TZDate(new Date("2025-04-18"), earningsApi.TIME_ZONE);  // easter good friday
        expect(earningsApi.getIsHoliday(publicHoliday)).toBe(true);
    });
});

/* getIsEarningTime() */
describe("getIsEarningTime()", () => {

    // work hour
    it("returns true for a work hour", () => {
        const workHour = new TZDate(new Date(2025, 6, 7, earningsApi.WORK_HOURS_START, 0, 0), earningsApi.TIME_ZONE);  // mon 2025-07-07
        expect(earningsApi.getIsEarningTime(workHour)).toBe(true);
    });

    // outside work hours
    it("returns false for outside work hours", () => {
        const outsideWorkHours = new TZDate(new Date(2025, 6, 7, earningsApi.WORK_HOURS_END, 0, 0), earningsApi.TIME_ZONE);  // mon 2025-07-07
        expect(earningsApi.getIsEarningTime(outsideWorkHours)).toBe(false);
    });

    // weekend
    it("returns false for a weekend", () => {
        const weekend = new TZDate(new Date("2025-07-12T12:00:00"), earningsApi.TIME_ZONE);  // sat 2025-07-12
        expect(earningsApi.getIsEarningTime(weekend)).toBe(false);
    });

    // holiday
    it("returns false for a holiday", () => {
        const holiday = new TZDate(new Date("2025-04-18T12:00:00"), earningsApi.TIME_ZONE);  // easter good friday
        expect(earningsApi.getIsEarningTime(holiday)).toBe(false);
    });
});

/* getWorkingDaysInMonth() */
describe("getWorkingDaysInMonth()", () => {

    // month with 20 working days
    it("returns 20 for a month with 20 working days", () => {
        const date = new TZDate(new Date("2025-04-15"), earningsApi.TIME_ZONE);
        expect(earningsApi.getWorkingDaysInMonth(date)).toBe(20);
    });

    // month with 23 working days
    it("returns 23 for a month with 23 working days", () => {
        const date = new TZDate(new Date("2025-07-15"), earningsApi.TIME_ZONE);
        expect(earningsApi.getWorkingDaysInMonth(date)).toBe(23);
    });
});

/* getCurrentEarnings() */
describe("getCurrentEarnings()", () => {

    // zero earnings 1 minute before working hours in a first working day of the month
    it("returns zero earnings 1 minute before working hours in a first working day of the month", () => {
        const date = new TZDate(new Date(2025, 6, 1, earningsApi.WORK_HOURS_START - 1, 59, 0), earningsApi.TIME_ZONE); // tue 2025-07-01
        expect(earningsApi.getCurrentEarnings(date)).toBe(0);
    });

    // earnings for 1 hour of work in a first working day of the month
    it("returns earnings for 1 hour of work in a first working day of the month", () => {
        const date = new TZDate(new Date(2025, 6, 1, earningsApi.WORK_HOURS_START + 1, 0, 0), earningsApi.TIME_ZONE);  // tue 2025-07-01
        const expectedEarnings = Math.floor(earningsApi.MANDAY_RATE / 8); // 1 hour of work
        expect(earningsApi.getCurrentEarnings(date)).toBe(expectedEarnings);
    });

    // earnings for two and a half days of work
    it("returns earnings for two and a half days of work", () => {
        const date = new TZDate(new Date(2025, 6, 3, earningsApi.WORK_HOURS_START + 4, 0, 0), earningsApi.TIME_ZONE);  // thu 2025-07-03
        const expectedEarnings = Math.floor(earningsApi.MANDAY_RATE * 2.5);
        expect(earningsApi.getCurrentEarnings(date)).toBe(expectedEarnings);
    });

});

/* getEarningsWithVAT() */
describe("getEarningsWithVAT()", () => {

    // earnings with VAT
    it("returns earnings with VAT", () => {
        const earnings = 1000;
        const expected = Math.floor(earnings * (1 + earningsApi.VAT_RATE));
        expect(earningsApi.getEarningsWithVAT(earnings)).toBe(expected);
    });

    // zero earnings
    it("returns 0 for zero earnings", () => {
        expect(earningsApi.getEarningsWithVAT(0)).toBe(0);
    });
});
