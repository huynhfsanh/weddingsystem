import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { calculateContractPricing } from "../domain/pricing.js";
import { ApiError } from "../utils/api-error.js";
import { createCode } from "../utils/codes.js";
import { calendarDate, checkCapacity, dayRange } from "./capacity.service.js";

export interface CreateContractInput {
  packageId: string;
  menuComboId: string;
  tableCount: number;
  setupDate: Date;
  eventDate: Date;
  hostName: string;
  hostPhone: string;
  address: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  notes?: string;
  selectedPackageItemIds: string[];
  menuSelections?: Array<{ originalDishId: string; selectedDishId: string }>;
}

export const createContract = async (customerId: string, input: CreateContractInput) => {
  const capacity = await checkCapacity(input.eventDate);
  if (!capacity.available) throw new ApiError(409, "Ngay da chon da dat gioi han so tiec");
  if (input.setupDate > input.eventDate) throw new ApiError(422, "Ngay lap dat phai truoc hoac bang ngay to chuc");

  const [weddingPackage, menuCombo] = await Promise.all([
    prisma.weddingPackage.findFirst({ where: { id: input.packageId, isActive: true }, include: { packageItems: { include: { catalogItem: true } } } }),
    prisma.menuCombo.findFirst({ where: { id: input.menuComboId, isActive: true }, include: { dishes: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } } }),
  ]);
  if (!weddingPackage) throw new ApiError(404, "Khong tim thay goi cuoi");
  if (!menuCombo) throw new ApiError(404, "Khong tim thay combo thuc don");
  const packageItems = weddingPackage.packageItems.filter((item) => item.catalogItem.isActive);
  const selectedIds = new Set(input.selectedPackageItemIds);
  if (selectedIds.size !== input.selectedPackageItemIds.length || [...selectedIds].some((id) => !packageItems.some((item) => item.catalogItemId === id))) throw new ApiError(422, "Hang muc da chon khong thuoc goi cuoi");
  if (packageItems.some((item) => item.isRequired && !selectedIds.has(item.catalogItemId))) throw new ApiError(422, "Khong the bo hang muc bat buoc trong goi cuoi");
  const selectedPackageItems = packageItems.filter((item) => selectedIds.has(item.catalogItemId));
  const removedAmount = packageItems.filter((item) => !selectedIds.has(item.catalogItemId)).reduce((sum, item) => sum + Number(item.catalogItem.unitPrice) * item.quantity, 0);
  const selectionMap = new Map((input.menuSelections ?? []).map((selection) => [selection.originalDishId, selection.selectedDishId]));
  if (menuCombo && [...selectionMap.keys()].some((id) => !menuCombo.dishes.some((dish) => dish.id === id))) {
    throw new ApiError(422, "Mon goc khong thuoc combo da chon");
  }
  const selectedDishIds = menuCombo?.dishes.map((dish) => selectionMap.get(dish.id) ?? dish.id) ?? [];
  const selectedDishes = selectedDishIds.length ? await prisma.menuDish.findMany({ where: { id: { in: selectedDishIds }, isActive: true, combo: { isActive: true } } }) : [];
  if (selectedDishes.length !== new Set(selectedDishIds).size) throw new ApiError(422, "Mot hoac nhieu mon thay the khong hop le");
  const menuSnapshots = menuCombo?.dishes.map((original, index) => {
    const selectedId = selectionMap.get(original.id) ?? original.id;
    const selected = selectedDishes.find((dish) => dish.id === selectedId)!;
    return { sourceDishId: selected.id, originalDishName: original.name, selectedDishName: selected.name, referenceUrl: selected.referenceUrl, imageUrl: selected.imageUrl, isReplacement: original.id !== selected.id, sortOrder: index };
  }) ?? [];
  const pricing = calculateContractPricing({
    basePrice: Number(weddingPackage.basePrice),
    standardTables: weddingPackage.standardTables,
    tableCount: input.tableCount,
    depositRate: env.DEFAULT_DEPOSIT_RATE,
    items: [
      ...(menuCombo && Number(menuCombo.pricePerTable) > 0 ? [{ unitPrice: Number(menuCombo.pricePerTable), quantity: input.tableCount }] : []),
    ],
    discountAmount: removedAmount,
  });

  return prisma.$transaction(async (tx) => {
    const eventRange = dayRange(input.eventDate);
    const eventDay = calendarDate(input.eventDate);
    const dailyCapacity = await tx.dailyCapacity.upsert({
      where: { date: eventDay },
      update: {},
      create: { date: eventDay, maxEvents: env.DEFAULT_CAPACITY_PER_DAY },
    });
    const accepted = await tx.weddingContract.count({
      where: {
        eventDate: { gte: eventRange.start, lt: eventRange.end },
        status: { in: ["PENDING_DEPOSIT", "DEPOSITED", "APPROVED", "IN_PROGRESS"] },
      },
    });
    if (accepted >= dailyCapacity.maxEvents) throw new ApiError(409, "Ngay da chon vua dat gioi han so tiec");

    const contractCode = createCode("HD");
    const contract = await tx.weddingContract.create({
      data: {
        contractCode,
        customerId,
        packageId: input.packageId,
        menuComboId: menuCombo?.id,
        hostName: input.hostName,
        hostPhone: input.hostPhone,
        tableCount: input.tableCount,
        setupDate: input.setupDate,
        eventDate: input.eventDate,
        address: input.address,
        formattedAddress: input.formattedAddress,
        latitude: input.latitude,
        longitude: input.longitude,
        placeId: input.placeId,
        notes: input.notes,
        subtotal: pricing.subtotal,
        totalAmount: pricing.totalAmount,
        depositRate: env.DEFAULT_DEPOSIT_RATE,
        depositAmount: pricing.depositAmount,
        remainingAmount: pricing.remainingAmount,
        items: {
          create: selectedPackageItems.map(({ catalogItem, quantity }) => ({
            catalogItemId: catalogItem.id,
            itemName: catalogItem.name,
            itemType: catalogItem.type,
            unitPrice: catalogItem.unitPrice,
            quantity,
            lineTotal: new Prisma.Decimal(Number(catalogItem.unitPrice) * quantity),
          })),
        },
        menuItems: { create: menuSnapshots },
      },
      include: { items: true, menuItems: true, menuCombo: true, weddingPackage: true },
    });

    await tx.contractPayment.create({
      data: {
        contractId: contract.id,
        transactionCode: createCode("PAY"),
        transferContent: `COC ${contractCode}`,
        type: "DEPOSIT",
        expectedAmount: contract.depositAmount,
      },
    });
    return contract;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
};
