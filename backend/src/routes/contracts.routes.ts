import { existsSync } from "node:fs";
import { Router } from "express";
import PDFDocument from "pdfkit";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { createContract } from "../services/contract.service.js";
import { writeAuditLog } from "../services/audit.service.js";
import { env } from "../config/env.js";
import { imageUpload } from "../middlewares/upload.js";
import { deleteStoredImage, loadStoredImage, storeImage } from "../services/storage.service.js";
import { contractArticles, contractDocumentHash } from "../services/contract-document.service.js";

const router = Router();
router.use(authenticate);

const contractInclude = {
  weddingPackage: true,
  menuCombo: true,
  menuItems: { orderBy: { sortOrder: "asc" as const } },
  signature: true,
  customer: { select: { id: true, fullName: true, email: true, phone: true } },
  items: true,
  payments: { orderBy: { createdAt: "desc" as const } },
  assignments: { include: { staff: { select: { id: true, fullName: true, phone: true } }, staffRate: true } },
  damageReports: true,
};

const ensureContractAccess = async (contractId: string, auth: NonNullable<Express.Request["auth"]>) => {
  const contract = await prisma.weddingContract.findUnique({ where: { id: contractId }, include: contractInclude });
  if (!contract) throw new ApiError(404, "Khong tim thay hop dong");
  const canAccess = auth.role === "ADMIN" || contract.customerId === auth.userId || contract.assignments.some((item) => item.staffId === auth.userId);
  if (!canAccess) throw new ApiError(403, "Ban khong co quyen xem hop dong nay");
  return contract;
};

router.post("/", asyncHandler(async (req, res) => {
  const input = z.object({
    customerId: z.string().optional(),
    packageId: z.string(), menuComboId: z.string(), tableCount: z.number().int().positive(),
    setupDate: z.coerce.date(), eventDate: z.coerce.date(),
    hostName: z.string().min(2), hostPhone: z.string().min(9).max(20), address: z.string().min(5),
    formattedAddress: z.string().optional(), latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(), placeId: z.string().optional(), notes: z.string().max(2000).optional(),
    selectedPackageItemIds: z.array(z.string()).default([]),
    menuSelections: z.array(z.object({ originalDishId: z.string(), selectedDishId: z.string() })).default([]),
  }).parse(req.body);
  if (!['CUSTOMER', 'ADMIN'].includes(req.auth!.role)) throw new ApiError(403, "Chi khach hang hoac quan tri vien moi co the tao hop dong");
  const customerId = req.auth!.role === "CUSTOMER" ? req.auth!.userId : input.customerId;
  if (!customerId) throw new ApiError(422, "Quan tri vien phai chon khach hang");
  const customer = await prisma.user.findFirst({ where: { id: customerId, role: { code: "CUSTOMER" }, status: "ACTIVE" } });
  if (!customer) throw new ApiError(404, "Khong tim thay khach hang dang hoat dong");
  const data = await createContract(customerId, input);
  await writeAuditLog(req, "CREATE_CONTRACT", "WeddingContract", data.id, { contractCode: data.contractCode });
  res.status(201).json({ success: true, data });
}));

router.get("/", asyncHandler(async (req, res) => {
  if (req.auth!.role !== "ADMIN") throw new ApiError(403, "Chi quan tri vien co the xem danh sach hop dong");
  const status = z.enum(["DRAFT", "PENDING_DEPOSIT", "DEPOSITED", "APPROVED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "REJECTED"]).optional().parse(req.query.status);
  const data = await prisma.weddingContract.findMany({ where: status ? { status } : undefined, include: contractInclude, orderBy: { createdAt: "desc" } });
  res.json({ success: true, data });
}));

router.get("/me", asyncHandler(async (req, res) => {
  if (req.auth!.role !== "CUSTOMER") throw new ApiError(403, "API nay danh cho khach hang");
  const data = await prisma.weddingContract.findMany({ where: { customerId: req.auth!.userId }, include: contractInclude, orderBy: { createdAt: "desc" } });
  res.json({ success: true, data });
}));

router.get("/:id", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await ensureContractAccess(req.params.id!, req.auth!) });
}));

router.patch("/:id", asyncHandler(async (req, res) => {
  const existing = await ensureContractAccess(req.params.id!, req.auth!);
  if (existing.signature) throw new ApiError(409, "Hop dong da ky dien tu; noi dung chi duoc thay doi bang phu luc moi");
  if (req.auth!.role !== "ADMIN" && (existing.customerId !== req.auth!.userId || !["DRAFT", "PENDING_DEPOSIT"].includes(existing.status))) {
    throw new ApiError(403, "Hop dong khong con duoc phep chinh sua");
  }
  const input = z.object({ hostName: z.string().min(2).optional(), hostPhone: z.string().min(9).max(20).optional(), notes: z.string().max(2000).nullable().optional() }).parse(req.body);
  const data = await prisma.weddingContract.update({ where: { id: existing.id }, data: input, include: contractInclude });
  res.json({ success: true, data });
}));

router.patch("/:id/status", asyncHandler(async (req, res) => {
  if (req.auth!.role !== "ADMIN") throw new ApiError(403, "Chi quan tri vien co the doi trang thai");
  const { status } = z.object({ status: z.enum(["DEPOSITED", "APPROVED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "REJECTED"]) }).parse(req.body);
  const existing = await prisma.weddingContract.findUnique({ where: { id: req.params.id! }, include: { signature: true } });
  if (!existing) throw new ApiError(404, "Khong tim thay hop dong");
  if (status === "DEPOSITED" && !existing.signature) throw new ApiError(409, "Hop dong chua co chu ky dien tu cua khach hang");
  const transitions: Record<string, string[]> = {
    PENDING_DEPOSIT: ["DEPOSITED", "CANCELLED", "REJECTED"],
    DEPOSITED: ["APPROVED", "CANCELLED", "REJECTED"],
    APPROVED: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  };
  if (!transitions[existing.status]?.includes(status)) throw new ApiError(409, `Khong the chuyen tu ${existing.status} sang ${status}`);
  const data = await prisma.weddingContract.update({
    where: { id: req.params.id! },
    data: { status, approvedAt: status === "APPROVED" ? new Date() : undefined },
    include: contractInclude,
  });
  await prisma.notification.create({
    data: { userId: data.customerId, title: "Hợp đồng đã cập nhật", message: `Hợp đồng ${data.contractCode} chuyển sang trạng thái ${status}.`, type: "CONTRACT", link: `/customer/contracts/${data.id}` },
  });
  await writeAuditLog(req, "CHANGE_CONTRACT_STATUS", "WeddingContract", data.id, { status });
  res.json({ success: true, data });
}));

router.post("/:id/cancel", asyncHandler(async (req, res) => {
  const contract = await ensureContractAccess(req.params.id!, req.auth!);
  if (req.auth!.role === "STAFF" || (req.auth!.role === "CUSTOMER" && contract.customerId !== req.auth!.userId)) throw new ApiError(403, "Khong co quyen huy hop dong");
  if (["COMPLETED", "CANCELLED"].includes(contract.status)) throw new ApiError(409, "Hop dong khong the huy o trang thai hien tai");
  const data = await prisma.weddingContract.update({ where: { id: contract.id }, data: { status: "CANCELLED" } });
  await writeAuditLog(req, "CANCEL_CONTRACT", "WeddingContract", data.id);
  res.json({ success: true, data });
}));

router.post("/:id/signature", imageUpload.single("signature"), asyncHandler(async (req, res) => {
  const contract = await ensureContractAccess(req.params.id!, req.auth!);
  if (req.auth!.role !== "CUSTOMER" || contract.customerId !== req.auth!.userId) throw new ApiError(403, "Chi khach hang so huu hop dong moi co the ky");
  if (contract.status !== "PENDING_DEPOSIT" || Number(contract.paidAmount) > 0) throw new ApiError(409, "Hop dong khong con o trang thai cho ky dat coc");
  if (contract.signature) throw new ApiError(409, "Hop dong da duoc ky dien tu");
  if (!req.file) throw new ApiError(422, "Vui long ky ten truoc khi xac nhan");
  const input = z.object({ signerName: z.string().trim().min(2).max(100), agreed: z.literal("true") }).parse(req.body);
  const stored = await storeImage(req.file);
  let data;
  try {
    data = await prisma.contractSignature.create({
      data: {
        contractId: contract.id,
        signerId: req.auth!.userId,
        signerName: input.signerName,
        signatureUrl: stored.url,
        documentHash: contractDocumentHash(contract),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });
  } catch (error) {
    await deleteStoredImage(stored.url);
    throw error;
  }
  await writeAuditLog(req, "SIGN_CONTRACT", "WeddingContract", contract.id, { signedAt: data.signedAt, documentHash: data.documentHash });
  res.status(201).json({ success: true, data });
}));

router.post("/:id/generate-pdf", asyncHandler(async (req, res) => {
  await ensureContractAccess(req.params.id!, req.auth!);
  res.json({ success: true, data: { url: `/api/contracts/${req.params.id}/pdf` } });
}));

router.get("/:id/pdf", asyncHandler(async (req, res) => {
  const contract = await ensureContractAccess(req.params.id!, req.auth!);
  const document = new PDFDocument({ margin: 48, size: "A4" });
  const fonts = ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "C:\\Windows\\Fonts\\arial.ttf"];
  const font = fonts.find(existsSync);
  if (font) document.font(font);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${contract.contractCode}.pdf`);
  document.pipe(res);
  const money = (value: unknown) => `${Number(value).toLocaleString("vi-VN")} VNĐ`;
  const paragraph = (text: string) => document.fontSize(10).fillColor("#222222").text(text, { align: "justify", lineGap: 2 }).moveDown(0.35);
  const section = (title: string) => document.moveDown(0.4).fontSize(11).fillColor("#134E4A").text(title, { align: "left" }).moveDown(0.25);
  document.fontSize(12).fillColor("#111111").text("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", { align: "center" });
  document.fontSize(11).text("Độc lập - Tự do - Hạnh phúc", { align: "center" });
  document.text("____________________________", { align: "center" }).moveDown(0.8);
  document.fontSize(17).fillColor("#134E4A").text("HỢP ĐỒNG TỔ CHỨC SỰ KIỆN ĐÁM CƯỚI", { align: "center" });
  document.fontSize(10).fillColor("#333333").text(`Số: ${contract.contractCode}`, { align: "center" }).moveDown();
  paragraph("Căn cứ Bộ luật Dân sự năm 2015; Căn cứ Luật Thương mại năm 2005; Căn cứ nhu cầu và khả năng thực hiện của hai bên.");
  paragraph(`Hôm nay, ngày ${new Date().toLocaleDateString("vi-VN")}, các bên gồm:`);
  section("BÊN A - BÊN SỬ DỤNG DỊCH VỤ");
  paragraph(`Khách hàng: ${contract.customer.fullName}`);
  paragraph(`Người đại diện/Gia chủ: ${contract.hostName} | Điện thoại: ${contract.hostPhone} | Email: ${contract.customer.email}`);
  section("BÊN B - BÊN CUNG CẤP DỊCH VỤ");
  paragraph(`${env.BUSINESS_NAME} | Đại diện: ${env.BUSINESS_REPRESENTATIVE}`);
  paragraph(`Địa chỉ: ${env.BUSINESS_ADDRESS} | Điện thoại: ${env.BUSINESS_PHONE} | Email: ${env.BUSINESS_EMAIL}`);
  paragraph("Hai bên thống nhất ký kết hợp đồng tổ chức sự kiện đám cưới với các điều khoản sau:");
  for (const article of contractArticles) {
    section(article.title);
    for (const content of article.paragraphs) paragraph(`- ${content}`);
  }
  section("PHỤ LỤC 1. THÔNG TIN VÀ GIÁ TRỊ DỊCH VỤ");
  paragraph(`Gói dịch vụ: ${contract.weddingPackage.name} | Số bàn: ${contract.tableCount}`);
  paragraph(`Thời gian lắp đặt: ${contract.setupDate.toLocaleString("vi-VN")} | Thời gian tổ chức: ${contract.eventDate.toLocaleString("vi-VN")}`);
  paragraph(`Địa điểm tổ chức: ${contract.formattedAddress ?? contract.address}`);
  paragraph(`Tổng giá trị: ${money(contract.totalAmount)} | Đặt cọc ${Number(contract.depositRate)}%: ${money(contract.depositAmount)} | Còn lại: ${money(contract.remainingAmount)}`);
  if (contract.items.length) {
    document.fontSize(10).fillColor("#134E4A").text("Hạng mục bổ sung:");
    for (const item of contract.items) paragraph(`• ${item.itemName} x ${item.quantity}: ${money(item.lineTotal)}`);
  }
  section("PHỤ LỤC 2. THỰC ĐƠN");
  paragraph(contract.menuCombo ? `${contract.menuCombo.groupName} - ${contract.menuCombo.name}` : "Chưa chọn combo thực đơn.");
  for (const item of contract.menuItems) paragraph(`• ${item.selectedDishName}${item.isReplacement ? ` (thay cho ${item.originalDishName})` : ""}`);
  section("XÁC NHẬN VÀ CHỮ KÝ");
  if (document.y > 590) document.addPage();
  const signatureY = document.y + 8;
  const leftX = 48;
  const rightX = 320;
  document.fontSize(10).fillColor("#111111").text("ĐẠI DIỆN BÊN A", leftX, signatureY, { width: 220, align: "center" });
  document.text("ĐẠI DIỆN BÊN B", rightX, signatureY, { width: 220, align: "center" });
  document.fontSize(8).fillColor("#666666").text(contract.signature ? `Ký điện tử lúc ${contract.signature.signedAt.toLocaleString("vi-VN")}` : "Chưa ký điện tử", leftX, signatureY + 18, { width: 220, align: "center" });
  document.text("Chữ ký được xác nhận sẵn", rightX, signatureY + 18, { width: 220, align: "center" });
  if (contract.signature) {
    try {
      const signature = await loadStoredImage(contract.signature.signatureUrl);
      document.image(signature, leftX + 50, signatureY + 38, { fit: [120, 55], align: "center" });
    } catch { document.fontSize(9).fillColor("#777777").text("[Ảnh chữ ký không khả dụng]", leftX, signatureY + 55, { width: 220, align: "center" }); }
  }
  document.font("Times-Italic").fontSize(24).fillColor("#134E4A").text("Sanh", rightX, signatureY + 45, { width: 220, align: "center" });
  if (font) document.font(font);
  document.fontSize(9).fillColor("#111111").text(contract.signature?.signerName ?? contract.customer.fullName, leftX, signatureY + 102, { width: 220, align: "center" });
  document.text(env.BUSINESS_REPRESENTATIVE, rightX, signatureY + 102, { width: 220, align: "center" });
  if (contract.signature) document.fontSize(7).fillColor("#777777").text(`Mã xác thực: ${contract.signature.documentHash}`, 48, signatureY + 130, { width: 496, align: "center" });
  document.end();
}));

export { router as contractsRouter };
