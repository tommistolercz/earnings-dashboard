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
        const nonHoliday = new TZDate(new Date("2025-07-07"), earningsApi.TIME_ZONE);
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
        const workHour = new TZDate(new Date("2025-07-07T09:00:00"), earningsApi.TIME_ZONE);
        expect(earningsApi.getIsEarningTime(workHour)).toBe(true);
    });

    // outside work hours
    it("returns false for outside work hours", () => {
        const outsideWorkHours = new TZDate(new Date("2025-07-07T17:01:00"), earningsApi.TIME_ZONE);
        expect(earningsApi.getIsEarningTime(outsideWorkHours)).toBe(false);
    });

    // weekend
    it("returns false for a weekend", () => {
        const weekend = new TZDate(new Date("2025-07-12T10:00:00"), earningsApi.TIME_ZONE);
        expect(earningsApi.getIsEarningTime(weekend)).toBe(false);
    });

    // holiday
    it("returns false for a holiday", () => {
        const holiday = new TZDate(new Date("2025-04-18T10:00:00"), earningsApi.TIME_ZONE);  // easter good friday
        expect(earningsApi.getIsEarningTime(holiday)).toBe(false);
    });
});

/* getWorkingDaysInMonth() */
describe("getWorkingDaysInMonth()", () => {

    // month with 20 working days
    it("returns 20 for a month with 20 working days", () => {
        const date = new TZDate(new Date("2025-04-18"), earningsApi.TIME_ZONE);
        expect(earningsApi.getWorkingDaysInMonth(date)).toBe(20);
    });

    // month with 23 working days
    it("returns 23 for a month with 23 working days", () => {
        const date = new TZDate(new Date("2025-07-01"), earningsApi.TIME_ZONE);
        expect(earningsApi.getWorkingDaysInMonth(date)).toBe(23);
    });
});

/* getCurrentEarnings() */
describe("getCurrentEarnings()", () => {

    // zero earnings before working hours in a first working day of the month
    it("returns 0 before working hours in a first working day of the month", () => {
        const date = new TZDate(new Date("2025-07-01T08:59:00"), earningsApi.TIME_ZONE);
        expect(earningsApi.getCurrentEarnings(date)).toBe(0);
    });

    // earnings for 1 hour of work in a first working day of the month
    it("returns earnings after 1 hour of work in a first working day of the month", () => {
        const date = new TZDate(new Date("2025-07-01T10:00:00"), earningsApi.TIME_ZONE);
        const expectedEarnings = Math.floor(earningsApi.MANDAY_RATE / 8); // 1 hour of work
        expect(earningsApi.getCurrentEarnings(date)).toBe(expectedEarnings);
    });

    // earnings for two and a half days of work
    it("returns earnings for two and a half days of work", () => {
        const date = new TZDate(new Date("2025-07-03T13:00:00"), earningsApi.TIME_ZONE);
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
