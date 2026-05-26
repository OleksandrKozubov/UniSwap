export function formatPrice(price) {
  const numericPrice = Number(price);

  if (
    price === null ||
    price === undefined ||
    String(price).trim() === "" ||
    Number.isNaN(numericPrice)
  ) {
    return "Price on request";
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: numericPrice % 1 === 0 ? 0 : 2
  }).format(numericPrice);
}
