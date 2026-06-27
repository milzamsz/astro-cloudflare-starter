import type {
  BreadcrumbList,
  BlogPosting,
  FAQPage,
  Organization,
  Person,
  Service,
  WebSite,
  WithContext,
} from "schema-dts";
import {
  siteConfig as defaultSiteConfig,
  type SiteConfig,
} from "../config/site.config";

export function buildWebSiteSchema(
  site: Pick<SiteConfig, "name" | "url" | "description"> = defaultSiteConfig,
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${site.url}/search?query={search_term_string}`,
    },
  } satisfies WithContext<WebSite>;
}

export function buildOrganizationSchema(site: SiteConfig = defaultSiteConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    description: site.description,
    logo: site.branding.logo.light,
    contactPoint: site.email
      ? [
          {
            "@type": "ContactPoint",
            email: site.email,
            contactType: "customer support",
          },
        ]
      : undefined,
    sameAs: site.socialLinks.map((link) => link.url),
  } satisfies WithContext<Organization>;
}

export function buildPersonSchema(
  author: {
    name: string;
    bio?: string;
    avatar?: string;
    social?: Record<string, string | undefined>;
  },
  site: SiteConfig = defaultSiteConfig,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: site.url,
    image: author.avatar,
    description: author.bio,
    sameAs: Object.values(author.social ?? {}).filter(
      (value): value is string => Boolean(value),
    ),
  } satisfies WithContext<Person>;
}

export function buildBlogPostingSchema(
  post: {
    data: {
      title: string;
      description: string;
      publishDate: Date;
      updatedAt?: Date | null;
      author?: string;
      tags?: string[];
      image?: string;
      locale?: string;
    };
    id: string;
  },
  site: SiteConfig = defaultSiteConfig,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.data.title,
    description: post.data.description,
    datePublished: post.data.publishDate.toISOString(),
    dateModified: (post.data.updatedAt ?? post.data.publishDate).toISOString(),
    author: post.data.author
      ? { "@type": "Person", name: post.data.author }
      : undefined,
    mainEntityOfPage: `${site.url}/blog/${post.id}`,
    image: post.data.image ? [post.data.image] : undefined,
    keywords: post.data.tags?.join(", "),
    inLanguage: post.data.locale,
  } satisfies WithContext<BlogPosting>;
}

export function buildFAQSchema(
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  } satisfies WithContext<FAQPage>;
}

export function buildBreadcrumbSchema(
  crumbs: Array<{ label: string; href: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: crumb.href,
    })),
  } satisfies WithContext<BreadcrumbList>;
}

export function buildServiceSchema(
  service: {
    data: {
      title: string;
      description: string;
      slug: string;
      locale?: string;
      priceRange?: string;
      tags?: string[];
    };
  },
  site: SiteConfig = defaultSiteConfig,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.data.title,
    description: service.data.description,
    url: `${site.url}/services/${service.data.slug}`,
    provider: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
  } satisfies WithContext<Service>;
}
