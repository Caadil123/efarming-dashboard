import { z } from "zod";

export const projectSchema = z.object({
    title: z.string().min(1, "Title is required"),
    summary: z.string().optional(),
    description: z.string().min(1, "Description is required"),
    location: z.string().optional(),
    category: z.string().optional(),
    focusAreas: z.array(z.string()).optional(),
    status: z.enum(["DRAFT", "PUBLISHED"]),
    coverImageUrl: z.string().optional().or(z.literal("")),
    startDate: z.string().optional().or(z.literal("")),
    endDate: z.string().optional().or(z.literal("")),
});

export type ProjectInput = z.infer<typeof projectSchema>;
