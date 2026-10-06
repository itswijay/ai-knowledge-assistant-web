import { describe, expect, it } from "vitest";

import { getReadableTextColor } from "./contrast";

describe("getReadableTextColor", () => {
  it("returns dark text for light background colors", () => {
    expect(getReadableTextColor("#ffffff")).toBe("#0f172a");
    expect(getReadableTextColor("#fef08a")).toBe("#0f172a"); // light yellow
    expect(getReadableTextColor("#e0e7ff")).toBe("#0f172a"); // light indigo
    expect(getReadableTextColor("#f1f5f9")).toBe("#0f172a"); // slate 100
  });

  it("returns light text for dark background colors", () => {
    expect(getReadableTextColor("#000000")).toBe("#ffffff");
    expect(getReadableTextColor("#0f766e")).toBe("#ffffff"); // deep teal
    expect(getReadableTextColor("#2563EB")).toBe("#ffffff"); // royal blue
    expect(getReadableTextColor("#1e1b4b")).toBe("#ffffff"); // dark indigo
    expect(getReadableTextColor("#dc2626")).toBe("#ffffff"); // red 600
  });

  it("returns default light text for invalid hex codes", () => {
    expect(getReadableTextColor("")).toBe("#ffffff");
    expect(getReadableTextColor("invalid")).toBe("#ffffff");
    expect(getReadableTextColor("#123")).toBe("#ffffff");
  });
});
