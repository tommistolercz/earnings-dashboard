import { prisma } from "../db/db";
import { UserSettings } from "../types/settings";

// settings service
export class Settings {
    constructor(private userId: string) { }

    // gets user settings from db
    async getUserSettings(): Promise<UserSettings | null> {
        const settings = await prisma.userSetting.findUnique({
            where: { userId: this.userId }
        });
        if (!settings) return null;
        return {
            mandayRate: settings.mandayRate,
            currency: settings.currency,
            vatRate: settings.vatRate,
            country: settings.country,
            timeZone: settings.timeZone,
            workHoursStart: settings.workHoursStart,
            workHoursEnd: settings.workHoursEnd,
        };
    }

    // stores user settings into db
    async storeUserSettings(settings: UserSettings) {
        await prisma.userSetting.upsert({
            where: {
                userId: this.userId
            },
            update: {
                updatedAt: new Date(),
                mandayRate: settings.mandayRate,
                currency: settings.currency,
                vatRate: settings.vatRate,
                country: settings.country,
                timeZone: settings.timeZone,
                workHoursStart: settings.workHoursStart,
                workHoursEnd: settings.workHoursEnd,
            },
            create: {
                userId: this.userId,
                mandayRate: settings.mandayRate,
                currency: settings.currency,
                vatRate: settings.vatRate,
                country: settings.country,
                timeZone: settings.timeZone,
                workHoursStart: settings.workHoursStart,
                workHoursEnd: settings.workHoursEnd,
            }
        });
    }
}