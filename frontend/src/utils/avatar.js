function getInitials(label) {
  const fallback = "User";
  const words = String(label || fallback)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "U";
  }

  return words
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase();
}

export function getAvatarPlaceholder(label) {
  const initials = getInitials(label);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">` +
    `<rect width="120" height="120" rx="60" fill="#e8f1ff"/>` +
    `<circle cx="92" cy="28" r="24" fill="#d7f7e5"/>` +
    `<circle cx="28" cy="94" r="26" fill="#ffe9d6"/>` +
    `<text x="60" y="70" text-anchor="middle" fill="#1f3b57" font-family="Arial, sans-serif" font-size="36" font-weight="700">` +
    initials +
    `</text>` +
    `</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function getAvatarUrl(source, label) {
  const avatarUrl =
    source?.avatar_url ||
    source?.avatarUrl ||
    source?.avatar ||
    source?.image_url ||
    source?.imageUrl ||
    "";

  return String(avatarUrl).trim() || getAvatarPlaceholder(label || source?.name);
}
