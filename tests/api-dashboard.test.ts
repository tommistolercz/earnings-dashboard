import { describe, it, expect } from "vitest";
import { UserSettings } from "../src/routes/api/api-settings";
import { TZDate } from "@date-fns/tz";

import * as apiDashboard from "../src/routes/api/api-dashboard";

// test data
const testSettings: UserSettings = {
    mandayRate: 7600,
    currency: "CZK",
    vatRate: 0.21,
    country: "CZ",
    timeZone: "Europe/Prague",
    workHoursStart: 9,
    workHoursEnd: 17,
};

/* getIsWeekend() */
describe("getIsWeekend()", () => {

    // monday
    it("returns false for monday", () => {
        const monday = new TZDate(new Date("2025-07-07"), testSettings.timeZone);
        expect(apiDashboard.getIsWeekend(monday)).toBe(false);
    });

    // saturday
    it("returns true for saturday", () => {
        const saturday = new TZDate(new Date("2025-07-12"), testSettings.timeZone);
        expect(apiDashboard.getIsWeekend(saturday)).toBe(true);
    });

    // sunday
    it("returns true for sunday", () => {
        const sunday = new TZDate(new Date("2025-07-13"), testSettings.timeZone);
        expect(apiDashboard.getIsWeekend(sunday)).toBe(true);
    });
});

/* getIsHoliday() */
describe("getIsHoliday()", () => {

    // non-holiday
    it("returns false for a non-holiday", () => {
        const nonHoliday = new TZDate(new Date("2025-07-07"), testSettings.timeZone);  // mon 2025-07-07
        expect(apiDashboard.getIsHoliday(nonHoliday, testSettings)).toBe(false);
    });

    // non-public holiday
    it("returns false for a non-public holiday", () => {
        const nonPublicHoliday = new TZDate(new Date("2025-04-17"), testSettings.timeZone);  // easter maudy thursday
        expect(apiDashboard.getIsHoliday(nonPublicHoliday, testSettings)).toBe(false);
    });

    // public holiday
    it("returns true for a public holiday", () => {
        const publicHoliday = new TZDate(new Date("2025-04-18"), testSettings.timeZone);  // easter good friday
        expect(apiDashboard.getIsHoliday(publicHoliday, testSettings)).toBe(true);
    });
});

/* getIsEarningTime() */
describe("getIsEarningTime()", () => {

    // work hour
    it("returns true for a work hour", () => {
        const workHour = new TZDate(new Date(2025, 6, 7, testSettings.workHoursStart, 0, 0), testSettings.timeZone);  // mon 2025-07-07
        expect(apiDashboard.getIsEarningTime(workHour, testSettings)).toBe(true);
    });

    // outside work hours
    it("returns false for outside work hours", () => {
        const outsideWorkHours = new TZDate(new Date(2025, 6, 7, testSettings.workHoursEnd, 0, 0), testSettings.timeZone);  // mon 2025-07-07
        expect(apiDashboard.getIsEarningTime(outsideWorkHours, testSettings)).toBe(false);
    });

    // weekend
    it("returns false for a weekend", () => {
        const weekend = new TZDate(new Date("2025-07-12T12:00:00"), testSettings.timeZone);  // sat 2025-07-12
        expect(apiDashboard.getIsEarningTime(weekend, testSettings)).toBe(false);
    });

    // holiday
    it("returns false for a holiday", () => {
        const holiday = new TZDate(new Date("2025-04-18T12:00:00"), testSettings.timeZone);  // easter good friday
        expect(apiDashboard.getIsEarningTime(holiday, testSettings)).toBe(false);
    });
});

/* getWorkingDaysInMonth() */
describe("getWorkingDaysInMonth()", () => {

    // month with 20 working days
    it("returns 20 for a month with 20 working days", () => {
        const date = new TZDate(new Date("2025-04-15"), testSettings.timeZone);
        expect(apiDashboard.getWorkingDaysInMonth(date, testSettings)).toBe(20);
    });

    // month with 23 working days
    it("returns 23 for a month with 23 working days", () => {
        const date = new TZDate(new Date("2025-07-15"), testSettings.timeZone);
        expect(apiDashboard.getWorkingDaysInMonth(date, testSettings)).toBe(23);
    });
});

/* getCurrentEarnings() */
describe("getCurrentEarnings()", () => {

    // zero earnings 1 minute before working hours in a first working day of the month
    it("returns zero earnings 1 minute before working hours in a first working day of the month", () => {
        const date = new TZDate(new Date(2025, 6, 1, testSettings.workHoursStart - 1, 59, 0), testSettings.timeZone); // tue 2025-07-01
        expect(apiDashboard.getCurrentEarnings(date, testSettings)).toBe(0);
    });

    // earnings for 1 hour of work in a first working day of the month
    it("returns earnings for 1 hour of work in a first working day of the month", () => {
        const date = new TZDate(new Date(2025, 6, 1, testSettings.workHoursStart + 1, 0, 0), testSettings.timeZone);  // tue 2025-07-01
        const expectedEarnings = Math.floor(testSettings.mandayRate / 8); // 1 hour of work
        expect(apiDashboard.getCurrentEarnings(date, testSettings)).toBe(expectedEarnings);
    });

    // earnings for two and a half days of work
    it("returns earnings for two and a half days of work", () => {
        const date = new TZDate(new Date(2025, 6, 3, testSettings.workHoursStart + 4, 0, 0), testSettings.timeZone);  // thu 2025-07-03
        const expectedEarnings = Math.floor(testSettings.mandayRate * 2.5);
        expect(apiDashboard.getCurrentEarnings(date, testSettings)).toBe(expectedEarnings);
    });

});

/* getEarningsWithVAT() */
describe("getEarningsWithVAT()", () => {

    // earnings with VAT
    it("returns earnings with VAT", () => {
        const earnings = 1000;
        const expected = Math.floor(earnings * (1 + testSettings.vatRate));
        expect(apiDashboard.getEarningsWithVAT(earnings, testSettings)).toBe(expected);
    });

    // zero earnings
    it("returns 0 for zero earnings", () => {
        expect(apiDashboard.getEarningsWithVAT(0, testSettings)).toBe(0);
    });
});
