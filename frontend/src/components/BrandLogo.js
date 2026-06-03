// BrandLogo renders the reusable cap mark used in headers and auth cards.
function BrandLogo({ size = "default" }) {
  const className =
    size === "large" ? "brand-logo brand-logo--large" : "brand-logo";

  return (
    <span className={className} role="img" aria-label="UniSwap graduation cap logo">
      <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <path className="brand-logo-cap" d="M32 10 5 24l27 14 27-14L32 10Z" />
        <path
          className="brand-logo-band"
          d="M18 32v9c0 5 6.3 9 14 9s14-4 14-9v-9l-14 7-14-7Z"
        />
        <path className="brand-logo-tassel" d="M51 26v13" />
        <circle className="brand-logo-tassel-dot" cx="51" cy="44" r="3" />
      </svg>
    </span>
  );
}

export default BrandLogo;
