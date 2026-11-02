import { describe, expect, it } from "vitest";
import { formatMoney } from "./money";
import { getInitials, getFirstName } from "./format";

describe("formatMoney", () => {
  it("formats integer minor units with currency digits", () => {
    expect(formatMoney(12450, "USD")).toBe("$124.50");
    expect(formatMoney(5, "USD")).toBe("$0.05");
  });
});

describe("name helpers", () => {
  it("derives initials and first names", () => {
    expect(getInitials("Alex Smith")).toBe("AS");
    expect(getInitials("")).toBe("?");
    expect(getFirstName("  Alex Smith ")).toBe("Alex");
  });
});
