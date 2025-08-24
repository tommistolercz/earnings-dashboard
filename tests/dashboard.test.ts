import { describe, it, expect } from "vitest";
import { UserSettings } from "../src/types/settings";
import { Dashboard, parseTimeStringToObject, roundAmount } from "../src/services/dashboard";
import { DateTime } from "luxon";

// test settings
const settings: UserSettings = {
    mandayRate: 7600,
    currency: "CZK",
    vatRate: 0.21,
    country: "CZ",
    timeZone: "Europe/Prague",
    workHoursStart: "9:00",
    workHoursEnd: "17:00",
};

const dashboard = new Dashboard(settings);

// dashboard.getIsWeekend()
describe("dashboard.getIsWeekend()", () => {

    // monday
    it("returns false for monday", () => {
        const monday = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 7
        }, { zone: settings.timeZone });  // mon 2025-07-07
        expect(dashboard.getIsWeekend(monday)).toBe(false);
    });

    // saturday
    it("returns true for saturday", () => {
        const saturday = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 12
        }, { zone: settings.timeZone });  // sat 2025-07-12
        expect(dashboard.getIsWeekend(saturday)).toBe(true);
    });
});

// dashboard.getIsHoliday()
describe("dashboard.getIsHoliday()", () => {

    // non-holiday
    it("returns false for a non-holiday", () => {
        const nonHoliday = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 7
        }, { zone: settings.timeZone });  // mon 2025-07-07
        expect(dashboard.getIsHoliday(nonHoliday)).toBe(false);
    });

    // non-public holiday
    it("returns false for a non-public holiday", () => {
        const nonPublicHoliday = DateTime.fromObject({
            year: 2025,
            month: 4,
            day: 17
        }, { zone: settings.timeZone });  // easter maudy thursday
        expect(dashboard.getIsHoliday(nonPublicHoliday)).toBe(false);
    });

    // public holiday
    it("returns true for a public holiday", () => {
        const publicHoliday = DateTime.fromObject({
            year: 2025,
            month: 4,
            day: 18
        }, { zone: settings.timeZone });  // easter good friday
        expect(dashboard.getIsHoliday(publicHoliday)).toBe(true);
    });
});

// dashboard.getIsEarningTime()
describe("dashboard.getIsEarningTime()", () => {

    // work hour
    it("returns true for a work hour", () => {
        const { hour: startHour, minute: startMinute } = parseTimeStringToObject(settings.workHoursStart);
        const workHour = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 7,
            hour: startHour,
            minute: startMinute
        }, { zone: settings.timeZone });  // mon 2025-07-07, e.g. 9:00
        expect(dashboard.getIsEarningTime(workHour)).toBe(true);
    });

    // outside work hours
    it("returns false for outside work hours", () => {
        const { hour: endHour, minute: endMinute } = parseTimeStringToObject(settings.workHoursEnd);
        const outsideWorkHours = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 7,
            hour: endHour,
            minute: endMinute
        }, { zone: settings.timeZone }).plus({ minutes: 1 });  // mon 2025-07-07, e.g. 17:01
        expect(dashboard.getIsEarningTime(outsideWorkHours)).toBe(false);
    });

    // weekend
    it("returns false for a weekend", () => {
        const weekend = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 12
        }, { zone: settings.timeZone });  // sat 2025-07-12
        expect(dashboard.getIsEarningTime(weekend)).toBe(false);
    });

    // holiday
    it("returns false for a holiday", () => {
        const holiday = DateTime.fromObject({
            year: 2025,
            month: 4,
            day: 18
        }, { zone: settings.timeZone });  // easter good friday
        expect(dashboard.getIsEarningTime(holiday)).toBe(false);
    });
});

// dashboard.getWorkingDaysInMonth()
describe("dashboard.getWorkingDaysInMonth()", () => {

    // month with 20 working days
    it("returns 20 for a month with 20 working days", () => {
        const date = DateTime.fromObject({
            year: 2025,
            month: 4,
            day: 1
        }, { zone: settings.timeZone });  // apr 2025
        expect(dashboard.getWorkingDaysInMonth(date)).toBe(20);
    });

    // month with 23 working days
    it("returns 23 for a month with 23 working days", () => {
        const date = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 1
        }, { zone: settings.timeZone });  // jul 2025
        expect(dashboard.getWorkingDaysInMonth(date)).toBe(23);
    });
});

// dashboard.getCurrentEarnings()
describe("dashboard.getCurrentEarnings()", () => {

    // zero earnings 1 minute before working hours in a first working day of the month
    it("returns zero earnings 1 minute before working hours in a first working day of the month", () => {
        const { hour: startHour, minute: startMinute } = parseTimeStringToObject(settings.workHoursStart);
        const date = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 1,
            hour: startHour,
            minute: startMinute
        }, { zone: settings.timeZone }).minus({ minutes: 1 });  // tue 2025-07-01, e.g. 8:59
        expect(dashboard.getCurrentEarnings(date)).toBe(0);
    });

    // earnings for 1 hour of work in a first working day of the month
    it("returns earnings for 1 hour of work in a first working day of the month", () => {
        const { hour: startHour, minute: startMinute } = parseTimeStringToObject(settings.workHoursStart);
        const date = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 1,
            hour: startHour,
            minute: startMinute
        }, { zone: settings.timeZone }).plus({ hours: 1 });  // tue 2025-07-01, e.g. 10:00
        const expectedEarnings = roundAmount(settings.mandayRate / 8);
        expect(dashboard.getCurrentEarnings(date)).toBe(expectedEarnings);
    });

    // earnings for two and a half days of work
    it("returns earnings for two and a half days of work", () => {
        const { hour: startHour, minute: startMinute } = parseTimeStringToObject(settings.workHoursStart);
        const date = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 1,
            hour: startHour,
            minute: startMinute
        }, { zone: settings.timeZone }).plus({ days: 2, hours: 4 });  // thu 2025-07-03, e.g. 13:00
        const expectedEarnings = roundAmount(settings.mandayRate * 2.5);
        expect(dashboard.getCurrentEarnings(date)).toBe(expectedEarnings);
    });
});

// dashboard.getMaximumEarnings()
describe("dashboard.getMaximumEarnings()", () => {

    // maximum earnings for a month with 20 working days
    it("returns maximum earnings for a month with 20 working days", () => {
        const date = DateTime.fromObject({
            year: 2025,
            month: 4,
            day: 1
        }, { zone: settings.timeZone });  // apr 2025
        const expectedEarnings = roundAmount(20 * settings.mandayRate);
        expect(dashboard.getMaximumEarnings(date)).toBe(expectedEarnings);
    });

    // maximum earnings for a month with 23 working days
    it("returns maximum earnings for a month with 23 working days", () => {
        const date = DateTime.fromObject({
            year: 2025,
            month: 7,
            day: 1
        }, { zone: settings.timeZone });  // jul 2025
        const expectedEarnings = roundAmount(23 * settings.mandayRate);
        expect(dashboard.getMaximumEarnings(date)).toBe(expectedEarnings);
    });
});

// dashboard.getEarningsGrowthRate()
describe("dashboard.getEarningsGrowthRate()", () => {

    // earnings growth rate
    it("returns earnings growth rate", () => {
        const expected = {
            perDay: roundAmount(settings.mandayRate),
            perHour: roundAmount(settings.mandayRate / 8),
            perMinute: roundAmount(settings.mandayRate / 8 / 60),
            perSecond: roundAmount(settings.mandayRate / 8 / 60 / 60)
        };
        expect(dashboard.getEarningsGrowthRate()).toEqual(expected);
    });
});

// dashboard.getEarningsWithVAT()
describe("dashboard.getEarningsWithVAT()", () => {

    // earnings with VAT
    it("returns earnings with VAT", () => {
        const earnings = 1000;
        const expected = roundAmount(earnings * (1 + settings.vatRate));
        expect(dashboard.getEarningsWithVAT(earnings)).toBe(expected);
    });

    // zero earnings
    it("returns 0 for zero earnings", () => {
        expect(dashboard.getEarningsWithVAT(0)).toBe(0);
    });
});
