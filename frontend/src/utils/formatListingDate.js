const listingDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short"
});

// Format a listing creation date for compact card display.
export function formatListingDate(createdAt) {
  if (!createdAt) {
    return "";
  }

  const parsedDate = new Date(createdAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return `Listed ${listingDateFormatter.format(parsedDate)}`;
}
