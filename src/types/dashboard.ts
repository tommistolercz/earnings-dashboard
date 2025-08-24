import { UserSettings } from "../types/settings";
import { DateTime } from "luxon";

export type EarningsGrowthRate = {
    perDay: number;
    perHour: number;
    perMinute: number;
    perSecond: number;
};

export type DashboardData = {
    settings: UserSettings;
    calendar: {
        now: DateTime;
        isWeekend: boolean;
        isHoliday: boolean;
        isEarningTime: boolean;
        workingDaysInMonth: number;
    };
    earnings: {
        currentEarnings: number;
        maximumEarnings: number;
        earningsGrowthRate: EarningsGrowthRate;
        useVAT: boolean;
        currency: string;
    };
};
