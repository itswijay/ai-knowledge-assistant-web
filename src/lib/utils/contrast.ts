/**
 * Calculates readable text color (dark or light) for a given hex background color
 * based on relative luminance according to WCAG 2.1 specifications.
 */
export function getReadableTextColor(hex: string): "#0f172a" | "#ffffff" {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    return "#ffffff";
  }

  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const lR = toLinear(r);
  const lG = toLinear(g);
  const lB = toLinear(b);

  const luminance = 0.2126 * lR + 0.7152 * lG + 0.0722 * lB;

  // Luminance > 0.4 provides optimal contrast with dark text, otherwise light text
  return luminance > 0.4 ? "#0f172a" : "#ffffff";
}
