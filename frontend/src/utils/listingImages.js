const listingPlaceholderImage =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">' +
      '<rect width="600" height="400" fill="#2a2a2a"/>' +
      '<path d="M140 300l95-110 70 80 55-65 100 95H140z" fill="#4a4a4a"/>' +
      '<circle cx="235" cy="145" r="28" fill="#5c5c5c"/>' +
      '<text x="300" y="350" text-anchor="middle" fill="#cfcfcf" font-family="Arial, sans-serif" font-size="28">' +
        "No image available" +
      "</text>" +
    "</svg>"
  );

function getParsedImageValue(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  if (trimmedValue.startsWith("[") || trimmedValue.startsWith("{")) {
    try {
      return JSON.parse(trimmedValue);
    } catch (error) {
      return null;
    }
  }

  return null;
}

function getImageUrls(source) {
  if (!source) {
    return [];
  }

  if (Array.isArray(source)) {
    return source.flatMap(getImageUrls);
  }

  if (typeof source === "string") {
    const parsedSource = getParsedImageValue(source);

    if (parsedSource) {
      return getImageUrls(parsedSource);
    }

    return [source.trim()].filter(Boolean);
  }

  if (typeof source !== "object") {
    return [];
  }

  const directImageUrl = (
    source.image_url ||
    source.imageUrl ||
    source.url ||
    source.secure_url ||
    source.src ||
    source.path
  );

  if (typeof directImageUrl === "string" && directImageUrl.trim()) {
    return [directImageUrl.trim()];
  }

  return Object.values(source).flatMap(getImageUrls);
}

export function getListingImageUrls(listing) {
  if (!listing) {
    return [];
  }

  const imageSources = [
    listing.images,
    listing.image_urls,
    listing.image_url,
    listing.imageUrl
  ];

  return [...new Set(imageSources.flatMap(getImageUrls).filter(Boolean))];
}

export { listingPlaceholderImage };
