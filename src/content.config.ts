import { defineCollection, z } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { glob } from "astro/loaders";
import { i18nConfig } from "./config/i18n.config";

// Add locale codes here (e.g. ["en", "id"]) when introducing new languages.
const localeSchema = z.enum(["en"]);

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/blog",
    generateId: ({ entry }) => entry.replace(/\.[^/.]+$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    locale: localeSchema,
    publishDate: z.date(),
    updatedAt: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    author: z.string().default("Admin"),
    authorId: z.string().optional(),
    uid: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    faqs: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    toc: z.boolean().optional(),
    svgSlug: z.string().optional(),
    translationKey: z.string().optional(),
  }),
});

const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema(),
});

const pageSectionSchema = z.object({
  type: z.enum(["hero", "cta", "features", "faq", "trust"]),
  title: z.string().optional(),
  content: z.string().optional(),
  ctaText: z.string().optional(),
  ctaHref: z.string().optional(),
  items: z
    .array(
      z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
      }),
    )
    .optional(),
});

const pages = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/pages",
    generateId: ({ entry }) => entry.replace(/\.[^/.]+$/, ""),
  }),
  schema: z.object({
    locale: localeSchema,
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    sections: z.array(pageSectionSchema).default([]),
    isLegal: z.boolean().default(false),
    order: z.number().default(0),
    translationKey: z.string().optional(),
  }),
});

const services = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/services",
    generateId: ({ entry }) => entry.replace(/\.[^/.]+$/, ""),
  }),
  schema: z.object({
    locale: localeSchema,
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    features: z.array(z.string()).default([]),
    priceRange: z.string().optional(),
    order: z.number().default(0),
    translationKey: z.string().optional(),
  }),
});

const authors = defineCollection({
  loader: glob({
    pattern: "**/*.json",
    base: "./src/content/authors",
    generateId: ({ entry }) => entry.replace(/\.json$/, ""),
  }),
  schema: z.object({
    name: z.string(),
    bio: z.string(),
    avatar: z.string().optional(),
    social: z
      .object({
        twitter: z.string().optional(),
        github: z.string().optional(),
        linkedin: z.string().optional(),
        email: z.string().optional(),
      })
      .optional(),
  }),
});

const faqs = defineCollection({
  loader: glob({
    pattern: "**/*.json",
    base: "./src/content/faqs",
    generateId: ({ entry }) => entry.replace(/\.json$/, ""),
  }),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    category: z.string().optional(),
    order: z.number().default(0),
    locale: localeSchema,
  }),
});

const stack = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/stack",
    generateId: ({ entry }) => entry.replace(/\.[^/.]+$/, ""),
  }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    version: z.string(),
    url: z.string().url(),
    icon: z.string(),
    colorOklch: z.string(),
    order: z.number().default(0),
  }),
});

const settings = defineCollection({
  loader: glob({
    pattern: "settings.yml",
    base: "./src/content",
    generateId: ({ entry }) => entry.replace(/\.[^/.]+$/, ""),
  }),
  schema: z.object({
    name: z.string(),
    description: z.string().optional(),
    url: z.string().optional(),
    defaultLocale: localeSchema.default("en"),
    analyticsProvider: z.enum(["none", "gtm", "umami"]).default("none"),
    gtmId: z.string().optional(),
    umamiUrl: z.string().optional(),
    umamiId: z.string().optional(),
    mapLatitude: z.string().optional(),
    mapLongitude: z.string().optional(),
    orgName: z.string().optional(),
    orgEmail: z.string().optional(),
  }),
});

export const collections = {
  blog,
  docs,
  pages,
  services,
  settings,
  authors,
  faqs,
  stack,
};
