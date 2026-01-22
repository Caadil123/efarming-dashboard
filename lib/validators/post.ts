import { z } from "zod";

export const postSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    excerpt: z.string().optional(),
    content: z.string().min(1, "Content is required"),
    status: z.enum(["DRAFT", "PUBLISHED"]),
    featuredImageUrl: z.string().url().optional().or(z.literal("")),
});

export type PostInput = z.infer<typeof postSchema>;
