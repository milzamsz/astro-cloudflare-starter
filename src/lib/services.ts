import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { siteConfig } from "../config/site.config";
import { countTags, filterByTag, sortTagsByCount } from "./tags";
import type { Locale } from "./site-config";

export type ServiceEntry = CollectionEntry<"services">;

function sortServices(services: ServiceEntry[]) {
  return [...services].sort(
    (a, b) =>
      a.data.order - b.data.order || a.data.title.localeCompare(b.data.title),
  );
}

export async function getAllServices(locale?: Locale) {
  const services = await getCollection("services");
  return sortServices(
    services.filter((service: ServiceEntry) =>
      locale ? service.data.locale === locale : true,
    ),
  );
}

export async function getFeaturedServices(limit = 3, locale?: Locale) {
  const services = await getAllServices(locale);
  return services.filter((service) => service.data.featured).slice(0, limit);
}

export async function getServicesByTag(tag: string, locale?: Locale) {
  const services = await getAllServices(locale);
  return filterByTag(services, tag);
}

export async function getAllServiceTags(locale?: Locale) {
  const services = await getAllServices(locale);
  return sortTagsByCount(countTags(services)).slice(
    0,
    siteConfig.services.tagCloudLimit,
  );
}

export async function getServiceBySlug(slug: string) {
  const services = await getAllServices();
  return services.find(
    (service) => service.id === slug || service.data.slug === slug,
  );
}
