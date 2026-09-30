export interface PricingInput {
  basePrice: number;
  standardTables: number;
  tableCount: number;
  items: Array<{ unitPrice: number; quantity: number }>;
  depositRate: number;
  discountAmount?: number;
}

export const calculateContractPricing = (input: PricingInput) => {
  if (input.tableCount < 1 || input.standardTables < 1) throw new Error("So ban phai lon hon 0");
  if (input.depositRate <= 0 || input.depositRate > 100) throw new Error("Ty le coc khong hop le");

  const packageAmount = Math.round((input.basePrice / input.standardTables) * input.tableCount);
  const itemAmount = input.items.reduce(
    (total, item) => total + Math.round(item.unitPrice * item.quantity),
    0,
  );
  const discountAmount = Math.max(0, Math.round(input.discountAmount ?? 0));
  const totalAmount = Math.max(0, packageAmount + itemAmount - discountAmount);
  const depositAmount = Math.round((totalAmount * input.depositRate) / 100);

  return {
    packageAmount,
    itemAmount,
    discountAmount,
    subtotal: totalAmount,
    totalAmount,
    depositAmount,
    remainingAmount: totalAmount,
  };
};
