import { describe, it, expect } from "vitest";
import { cn, isoToLocalDate } from "./utils";

describe("utils", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      const result = cn("text-red-500", "bg-blue-500");
      expect(result).toContain("text-red-500");
      expect(result).toContain("bg-blue-500");
    });

    it("should handle conditional class names", () => {
      const condition = false;
      const result = cn("text-red-500", condition && "bg-blue-500");
      expect(result).toContain("text-red-500");
      expect(result).not.toContain("bg-blue-500");
    });
  });

  describe("isoToLocalDate", () => {
    it("should return empty string if input is null or undefined or empty", () => {
      expect(isoToLocalDate(null)).toBe("");
      expect(isoToLocalDate(undefined)).toBe("");
      expect(isoToLocalDate("")).toBe("");
    });

    it("should convert ISO date string to YYYY-MM-DD format", () => {
      const date = "2026-06-06T12:00:00Z";
      const result = isoToLocalDate(date);
      // Wait, Date constructor behaves differently depending on system timezone if not fully Z,
      // but "2026-06-06T12:00:00Z" is UTC, when parsed, d.getFullYear(), d.getMonth() and d.getDate()
      // will be local timezone values. To make it environment-independent:
      const d = new Date(date);
      const expectedYear = d.getFullYear();
      const expectedMonth = String(d.getMonth() + 1).padStart(2, "0");
      const expectedDay = String(d.getDate()).padStart(2, "0");
      expect(result).toBe(`${expectedYear}-${expectedMonth}-${expectedDay}`);
    });
  });
});
