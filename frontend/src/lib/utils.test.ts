import { describe, expect, it } from "vitest";
import { cn, formatCurrency } from "./utils";

describe("frontend utilities", () => {
  it("gop class Tailwind va uu tien class sau", () => {
    expect(cn("px-2 text-red-500", "px-4")).toContain("px-4");
    expect(cn("px-2 text-red-500", "px-4")).not.toContain("px-2");
  });

  it("dinh dang tien Viet Nam", () => {
    expect(formatCurrency(1_500_000)).toContain("1.500.000");
  });
});
