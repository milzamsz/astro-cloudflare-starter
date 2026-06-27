import { describe, it, expect } from "vitest";
import {
  buildWebSiteSchema,
  buildOrganizationSchema,
  buildPersonSchema,
  buildBlogPostingSchema,
  buildFAQSchema,
  buildBreadcrumbSchema,
  buildServiceSchema,
} from "../../lib/schema";
import { siteConfig } from "../../config/site.config";

describe("buildWebSiteSchema", () => {
  it("builds a WebSite schema with required fields", () => {
    const schema = buildWebSiteSchema(siteConfig);
    expect(schema["@type"]).toBe("WebSite");
    expect(schema.name).toBe(siteConfig.name);
    expect(schema.url).toBe(siteConfig.url);
    expect(schema.potentialAction?.["@type"]).toBe("SearchAction");
  });
});

describe("buildOrganizationSchema", () => {
  it("builds an Organization schema", () => {
    const schema = buildOrganizationSchema(siteConfig);
    expect(schema["@type"]).toBe("Organization");
    expect(schema.name).toBe(siteConfig.name);
    expect(Array.isArray(schema.sameAs)).toBe(true);
  });
});

describe("buildPersonSchema", () => {
  it("builds a Person schema filtering empty socials", () => {
    const schema = buildPersonSchema(
      {
        name: "Jane",
        bio: "Writer",
        social: { github: "https://github.com/jane", twitter: undefined },
      },
      siteConfig,
    );
    expect(schema["@type"]).toBe("Person");
    expect(schema.name).toBe("Jane");
    expect(schema.sameAs).toEqual(["https://github.com/jane"]);
  });
});

describe("buildBlogPostingSchema", () => {
  it("builds a BlogPosting schema with required fields", () => {
    const post = {
      id: "welcome",
      data: {
        title: "Welcome",
        description: "Hello world",
        publishDate: new Date("2025-01-01"),
        author: "Admin",
        tags: ["astro"],
        locale: "en",
      },
    };
    const schema = buildBlogPostingSchema(post, siteConfig);
    expect(schema["@type"]).toBe("BlogPosting");
    expect(schema.headline).toBe("Welcome");
    expect(schema.author).toEqual({ "@type": "Person", name: "Admin" });
    expect(schema.datePublished).toBe("2025-01-01T00:00:00.000Z");
    expect(schema.mainEntityOfPage).toBe(`${siteConfig.url}/blog/welcome`);
    expect(schema.keywords).toBe("astro");
    expect(schema.inLanguage).toBe("en");
  });

  it("falls back to publishDate when updatedAt is missing", () => {
    const post = {
      id: "welcome",
      data: {
        title: "Welcome",
        description: "Hi",
        publishDate: new Date("2025-01-01"),
      },
    };
    const schema = buildBlogPostingSchema(post, siteConfig);
    expect(schema.dateModified).toBe("2025-01-01T00:00:00.000Z");
  });
});

describe("buildFAQSchema", () => {
  it("builds an FAQPage with Question entries", () => {
    const schema = buildFAQSchema([
      { question: "What is Astro?", answer: "A web framework." },
    ]);
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toHaveLength(1);
    expect(schema.mainEntity[0]["@type"]).toBe("Question");
    expect(schema.mainEntity[0].acceptedAnswer?.["@type"]).toBe("Answer");
  });
});

describe("buildBreadcrumbSchema", () => {
  it("builds a BreadcrumbList with positions", () => {
    const schema = buildBreadcrumbSchema([
      { label: "Home", href: "/" },
      { label: "Blog", href: "/blog" },
    ]);
    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement).toHaveLength(2);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[1].position).toBe(2);
  });
});

describe("buildServiceSchema", () => {
  it("builds a Service schema with provider", () => {
    const service = {
      data: {
        title: "Cloud Deployment",
        description: "Fast deploys",
        slug: "cloud-deployment",
      },
    };
    const schema = buildServiceSchema(service, siteConfig);
    expect(schema["@type"]).toBe("Service");
    expect(schema.name).toBe("Cloud Deployment");
    expect(schema.url).toBe(`${siteConfig.url}/services/cloud-deployment`);
    expect(schema.provider?.["@type"]).toBe("Organization");
  });
});
