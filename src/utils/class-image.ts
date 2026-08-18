const CLASS_IMAGES: Record<string, string> = {
  yoga: "/assets/book-page/yoga-class.png",
  pilates: "/assets/book-page/pilates-class.png",
  ballet: "/assets/book-page/ballet-class.png",
};

export const DEFAULT_CLASS_IMAGE = CLASS_IMAGES.yoga;

/**
 * Pick a local placeholder image for a class based on its name.
 * The Public API does not expose a photo per class, so we fall back to
 * the closest bundled artwork (or the generic yoga cover).
 */
export const getClassImage = (className?: string | null): string => {
  const key = (className || "").toLowerCase();
  if (key.includes("yoga")) return CLASS_IMAGES.yoga;
  if (key.includes("pilates")) return CLASS_IMAGES.pilates;
  if (key.includes("ballet")) return CLASS_IMAGES.ballet;
  return DEFAULT_CLASS_IMAGE;
};
