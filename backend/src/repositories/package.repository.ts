import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export const packageRepository = {
  list: (filters: { search?: string; style?: string; minPrice?: number; maxPrice?: number; featured?: boolean }) => {
    const where: Prisma.WeddingPackageWhereInput = {
      isActive: true,
      ...(filters.search ? { name: { contains: filters.search } } : {}),
      ...(filters.style ? { style: filters.style } : {}),
      ...(filters.featured !== undefined ? { isFeatured: filters.featured } : {}),
      ...((filters.minPrice !== undefined || filters.maxPrice !== undefined)
        ? { basePrice: { gte: filters.minPrice, lte: filters.maxPrice } }
        : {}),
    };
    return prisma.weddingPackage.findMany({
      where,
      include: { packageItems: { include: { catalogItem: true } }, images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] } },
      orderBy: [{ isFeatured: "desc" }, { basePrice: "asc" }],
    });
  },
  findById: (id: string) => prisma.weddingPackage.findUnique({
    where: { id },
    include: { packageItems: { include: { catalogItem: true } }, images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] } },
  }),
  findBySlug: (slug: string) => prisma.weddingPackage.findUnique({
    where: { slug },
    include: { packageItems: { include: { catalogItem: true } }, images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] } },
  }),
};
