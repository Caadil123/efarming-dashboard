import { z } from "zod";

export const postSchema = z.object({
    title: z.string().min(1, "Post Name is required"),
    slug: z.string().optional(),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    contentSections: z.array(z.object({
        subtitle: z.string().optional(),
        content: z.string().min(1, "Section content is required"),
    })).optional(),
    status: z.enum(["DRAFT", "PUBLISHED"]),
    featuredImage: z.string().optional().or(z.literal("")),
    publishedAt: z.string().optional().or(z.literal("")),
});

export type PostInput = z.infer<typeof postSchema>;
