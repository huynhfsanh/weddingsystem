import { describe, expect, it } from "vitest";
import { calculateContractPricing } from "../src/domain/pricing.js";

describe("calculateContractPricing", () => {
  it("tinh dung tong tien va tien coc 50 phan tram", () => {
    const result = calculateContractPricing({
      basePrice: 30_000_000,
      standardTables: 20,
      tableCount: 25,
      depositRate: 50,
      items: [{ unitPrice: 2_000_000, quantity: 1 }],
    });
    expect(result.totalAmount).toBe(39_500_000);
    expect(result.depositAmount).toBe(19_750_000);
  });
});
