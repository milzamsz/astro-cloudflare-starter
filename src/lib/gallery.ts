export interface GallerySlide {
  src?: string;
  video?: string;
  alt?: string;
  caption?: string;
}

export function isVideoSlide(slide: GallerySlide) {
  return typeof slide.video === "string" && slide.video.length > 0;
}

export function isImageSlide(slide: GallerySlide) {
  return typeof slide.src === "string" && slide.src.length > 0;
}

export function getGalleryItems(entry: {
  data: { gallery?: GallerySlide[] | null };
}) {
  return entry.data.gallery ?? [];
}
