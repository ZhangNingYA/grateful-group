import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const reading = defineCollection({
    loader: glob({ base: './src/content/reading', pattern: '**/*.{md,mdx}' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        sourceUrl: z.string().url().optional(),
    }),
});

const games = defineCollection({
    // 注意这里路径改成了 ./src/content/games
    loader: glob({ base: './src/content/games', pattern: '**/*.{md,mdx}' }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            description: z.string(),
            pubDate: z.coerce.date(),
            // 你可以根据 games 栏目的实际情况增减字段
        }),
});

const learning = defineCollection({
    loader: glob({ base: './src/content/learning', pattern: '**/*.{md,mdx}' }),
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

export const collections = { reading, games, learning, threeD, works, papers };
