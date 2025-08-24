import { z } from "zod";

export const userSettingsSchema = z.object({
    mandayRate: z.number()
        .min(0, "manday rate must be a positive number or zero (e.g. 10000)"),
    currency: z.string()
        .length(3, "currency must be a 3-letter code (e.g. CZK)"),
    vatRate: z.number()
        .min(0, "VAT rate must be a minimum of 0% (e.g. 0.0)")
        .max(1, "VAT rate must be a maximum of 100% (e.g. 1.0)"),
    country: z.string()
        .length(2, "country must be a 2-letter code (e.g. CZ)"),
    timeZone: z.string()
        .min(1, "time zone is required (e.g. Europe/Prague)"),
    workHoursStart: z.string()
        .regex(/^(0?[0-9]|1[0-9]|2[0-3])(:[0-5][0-9])?$/, {
            message: "work hours start must be in format H or H:MM (e.g. 9, 9:30)"
        }),
    workHoursEnd: z.string()
        .regex(/^(0?[0-9]|1[0-9]|2[0-3])(:[0-5][0-9])?$/, {
            message: "work hours end must be in format H or H:MM (e.g. 17, 17:30)"
        }),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;