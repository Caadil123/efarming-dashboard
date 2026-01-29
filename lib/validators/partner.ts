import { z } from "zod";

export const partnerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    imageUrl: z.string().optional().nullable(),
    url: z.string().transform(v => v === "" ? null : v).nullable().optional()
        .refine(v => !v || v.startsWith('http'), "URL must start with http:// or https://")
        .or(z.string().length(0).nullable().optional()),
});
