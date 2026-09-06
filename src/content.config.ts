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

const study = defineCollection({
    loader: glob({ base: './src/content/study', pattern: '**/*.{md,mdx}' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        mode: z.enum(['lab', 'reading', 'derivation', 'build']).default('lab'),
        subject: z.string().optional(),
        part: z.number().int().positive().optional(),
        estimatedMinutes: z.number().int().positive().optional(),
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
    loader: glob({ base: './src/content/papers', pattern: '**/*.{md,mdx}' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        indexTitle: z.string(),
        indexDescription: z.string(),
        topic: z.string(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        authors: z.array(z.string()).optional(),
        venue: z.string().optional(),
        year: z.number().optional(),
    }),
});

export const collections = { reading, games, study, works, papers };
