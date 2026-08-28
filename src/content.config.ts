import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const reading = defineCollection({
    loader: glob({ base: './src/content/reading', pattern: '**/*.{md,mdx}' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
    }),
});

const games = defineCollection({
    loader: glob({ base: './src/content/games', pattern: '**/*.{md,mdx}' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        pageLayout: z.enum(['experience', 'reading']).optional(),
    }),
});

const threeD = defineCollection({
    loader: glob({ base: './src/content/threeD', pattern: '**/*.{md,mdx}' }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            description: z.string(),
            pubDate: z.coerce.date(),
            updatedDate: z.coerce.date().optional(),
            heroImage: z.optional(image()),
            hideHeader: z.boolean().optional(),
            hideTopbar: z.boolean().optional(),
        }),
});

const works = defineCollection({
    loader: glob({ base: './src/content/works', pattern: '**/*.{md,mdx}' }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            description: z.string(),
            pubDate: z.coerce.date(),
            updatedDate: z.coerce.date().optional(),
            heroImage: z.optional(image()),
        }),
});

const papers = defineCollection({
    // 注意这里路径是 ./src/content/papers
    loader: glob({ base: './src/content/papers', pattern: '**/*.{md,mdx}' }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            description: z.string(),
            pubDate: z.coerce.date(),
            updatedDate: z.coerce.date().optional(),
            heroImage: z.optional(image()),
            // 论文专用可选字段
            authors: z.array(z.string()).optional(),
            venue: z.string().optional(),
            year: z.number().optional(),
            pdfUrl: z.string().url().optional(),
            tags: z.array(z.string()).optional(),
        }),
});

export const collections = { reading, games, threeD, works, papers };
