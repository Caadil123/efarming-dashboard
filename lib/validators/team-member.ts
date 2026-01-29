import { z } from "zod";

export const teamMemberSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    imageUrl: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
});

export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
