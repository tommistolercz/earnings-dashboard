import { describe, it, expect } from "vitest";
import { UserSettings } from "../src/routes/api/api-settings";
import { DateTime } from "luxon";

import * as apiDashboard from "../src/routes/api/api-dashboard";

// test data
const testSettings: UserSettings = {
    mandayRate: 7600,
    currency: "CZK",
    vatRate: 0.21,
    country: "CZ",
    timeZone: "Europe/Prague",
    workHoursStart: "9:00",
    workHoursEnd: "17:00",
};

/* getIsWeekend() */
describe("getIsWeekend()", () => {

    // monday
    it("returns false for monday", () => {
        const monday = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 7
        }, { zone: testSettings.timeZone });
        expect(apiDashboard.getIsWeekend(monday)).toBe(false);
    });

    // saturday
    it("returns true for saturday", () => {
        const saturday = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 12
        }, { zone: testSettings.timeZone });
        expect(apiDashboard.getIsWeekend(saturday)).toBe(true);
    });
});

/* getIsHoliday() */
describe("getIsHoliday()", () => {

    // non-holiday
    it("returns false for a non-holiday", () => {
        const nonHoliday = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 7
        }, { zone: testSettings.timeZone });  // mon 2025-07-07
        expect(apiDashboard.getIsHoliday(nonHoliday, testSettings)).toBe(false);
    });

    // non-public holiday
    it("returns false for a non-public holiday", () => {
        const nonPublicHoliday = DateTime.fromObject({
            year: 2025,
            month: 4,
            day: 17
        }, { zone: testSettings.timeZone });  // easter maudy thursday
        expect(apiDashboard.getIsHoliday(nonPublicHoliday, testSettings)).toBe(false);
    });

    // public holiday
    it("returns true for a public holiday", () => {
        const publicHoliday = DateTime.fromObject({
            year: 2025,
            month: 4,
            day: 18
        }, { zone: testSettings.timeZone });  // easter good friday
        expect(apiDashboard.getIsHoliday(publicHoliday, testSettings)).toBe(true);
    });
});

/* getIsEarningTime() */
describe("getIsEarningTime()", () => {

    // work hour
    it("returns true for a work hour", () => {
        const { hour: startHour, minute: startMinute } = apiDashboard.parseTimeStringToObject(testSettings.workHoursStart);
        const workHour = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 7,
            hour: startHour,
            minute: startMinute
        }, { zone: testSettings.timeZone });  // mon 2025-07-07, e.g. 9:00
        expect(apiDashboard.getIsEarningTime(workHour, testSettings)).toBe(true);
    });

    // outside work hours
    it("returns false for outside work hours", () => {
        const { hour: endHour, minute: endMinute } = apiDashboard.parseTimeStringToObject(testSettings.workHoursEnd);
        const outsideWorkHours = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 7,
            hour: endHour,
            minute: endMinute
        }, { zone: testSettings.timeZone }).plus({ minutes: 1 });  // mon 2025-07-07, e.g. 17:01
        expect(apiDashboard.getIsEarningTime(outsideWorkHours, testSettings)).toBe(false);
    });

    // weekend
    it("returns false for a weekend", () => {
        const weekend = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 12
        }, { zone: testSettings.timeZone });  // sat 2025-07-12
        expect(apiDashboard.getIsEarningTime(weekend, testSettings)).toBe(false);
    });

    // holiday
    it("returns false for a holiday", () => {
        const holiday = DateTime.fromObject({
            year: 2025,
            month: 4,
            day: 18
        }, { zone: testSettings.timeZone });  // easter good friday
        expect(apiDashboard.getIsEarningTime(holiday, testSettings)).toBe(false);
    });
});

/* getWorkingDaysInMonth() */
describe("getWorkingDaysInMonth()", () => {

    // month with 20 working days
    it("returns 20 for a month with 20 working days", () => {
        const date = DateTime.fromObject({
            year: 2025,
            month: 4,
            day: 1
        }, { zone: testSettings.timeZone });  // apr 2025
        expect(apiDashboard.getWorkingDaysInMonth(date, testSettings)).toBe(20);
    });

    // month with 23 working days
    it("returns 23 for a month with 23 working days", () => {
        const date = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 1
        }, { zone: testSettings.timeZone });  // jul 2025
        expect(apiDashboard.getWorkingDaysInMonth(date, testSettings)).toBe(23);
    });
});

/* getCurrentEarnings() */
describe("getCurrentEarnings()", () => {

    // zero earnings 1 minute before working hours in a first working day of the month
    it("returns zero earnings 1 minute before working hours in a first working day of the month", () => {
        const { hour: startHour, minute: startMinute } = apiDashboard.parseTimeStringToObject(testSettings.workHoursStart);
        const date = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 1,
            hour: startHour,
            minute: startMinute
        }, { zone: testSettings.timeZone }).minus({ minutes: 1 });  // tue 2025-07-01, e.g. 8:59
        expect(apiDashboard.getCurrentEarnings(date, testSettings)).toBe(0);
    });

    // earnings for 1 hour of work in a first working day of the month
    it("returns earnings for 1 hour of work in a first working day of the month", () => {
        const { hour: startHour, minute: startMinute } = apiDashboard.parseTimeStringToObject(testSettings.workHoursStart);
        const date = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 1,
            hour: startHour,
            minute: startMinute
        }, { zone: testSettings.timeZone }).plus({ hours: 1 });  // tue 2025-07-01, e.g. 10:00
        const expectedEarnings = apiDashboard.roundAmount(testSettings.mandayRate / 8);
        expect(apiDashboard.getCurrentEarnings(date, testSettings)).toBe(expectedEarnings);
    });

    // earnings for two and a half days of work
    it("returns earnings for two and a half days of work", () => {
        const { hour: startHour, minute: startMinute } = apiDashboard.parseTimeStringToObject(testSettings.workHoursStart);
        const date = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 1,
            hour: startHour,
            minute: startMinute
        }, { zone: testSettings.timeZone }).plus({ days: 2, hours: 4 });  // thu 2025-07-03, e.g. 13:00
        const expectedEarnings = apiDashboard.roundAmount(testSettings.mandayRate * 2.5);
        expect(apiDashboard.getCurrentEarnings(date, testSettings)).toBe(expectedEarnings);
    });
});

/* getMaximumEarnings() */
describe("getMaximumEarnings()", () => {
    // maximum earnings for a month with 20 working days
    it("returns maximum earnings for a month with 20 working days", () => {
        const date = DateTime.fromObject({
            year: 2025,
            month: 4,
            day: 1
        }, { zone: testSettings.timeZone });  // apr 2025
        const expectedEarnings = apiDashboard.roundAmount(20 * testSettings.mandayRate);
        expect(apiDashboard.getMaximumEarnings(date, testSettings)).toBe(expectedEarnings);
    });

    // maximum earnings for a month with 23 working days
    it("returns maximum earnings for a month with 23 working days", () => {
        const date = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 1
        }, { zone: testSettings.timeZone });  // jul 2025
        const expectedEarnings = apiDashboard.roundAmount(23 * testSettings.mandayRate);
        expect(apiDashboard.getMaximumEarnings(date, testSettings)).toBe(expectedEarnings);
    });
});

/* getEarningsGrowthRate() */
describe("getEarningsGrowthRate()", () => {

    // earnings growth rate
    it("returns earnings growth rate", () => {
        const expected = {
            perDay: apiDashboard.roundAmount(testSettings.mandayRate),
            perHour: apiDashboard.roundAmount(testSettings.mandayRate / 8),
            perMinute: apiDashboard.roundAmount(testSettings.mandayRate / 8 / 60),
            perSecond: apiDashboard.roundAmount(testSettings.mandayRate / 8 / 60 / 60)
        };
        expect(apiDashboard.getEarningsGrowthRate(testSettings)).toEqual(expected);
    });
});

/* getEarningsWithVAT() */
describe("getEarningsWithVAT()", () => {

    // earnings with VAT
    it("returns earnings with VAT", () => {
        const earnings = 1000;
        const expected = apiDashboard.roundAmount(earnings * (1 + testSettings.vatRate));
        expect(apiDashboard.getEarningsWithVAT(earnings, testSettings)).toBe(expected);
    });

    // zero earnings
    it("returns 0 for zero earnings", () => {
        expect(apiDashboard.getEarningsWithVAT(0, testSettings)).toBe(0);
    });
});
