import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { getPayOS, payosEnabled } from "../config/payos.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { createCode } from "../utils/codes.js";
import { writeAuditLog } from "../services/audit.service.js";

const router = Router();

const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};

const verifyWebhookSignature = (rawBody: Buffer, signature?: string, secureToken?: string) => {
  if (!env.CASSO_WEBHOOK_SECRET) return false;
  if (secureToken && safeEqual(secureToken, env.CASSO_WEBHOOK_SECRET)) return true;
  if (!signature) return false;
  const expected = createHmac("sha256", env.CASSO_WEBHOOK_SECRET).update(rawBody).digest("hex");
  return safeEqual(signature.replace(/^sha256=/, ""), expected);
};

const jsonObject = (value: Prisma.JsonValue | null): Prisma.JsonObject => (
  value && typeof value === "object" && !Array.isArray(value) ? value : {}
);

const payosOrderCode = (transactionCode: string) => Number.parseInt(
  createHash("sha256").update(transactionCode).digest("hex").slice(0, 12),
  16,
);

const frontendUrl = (requestOrigin?: string) => {
  const configured = env.CLIENT_URL.split(",").map((value) => value.trim());
  const localOrigin = /^https?:\/\/(localhost|127\.0\.0\.1|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?::\d+)?$/;
  if (requestOrigin && (configured.includes(requestOrigin) || (env.NODE_ENV === "development" && localOrigin.test(requestOrigin)))) {
    return requestOrigin.replace(/\/$/, "");
  }
  return configured[0]!.replace(/\/$/, "");
};

const reconcilePayment = async (paymentId: string, receivedAmount: number, externalReference: string, payload: unknown) => prisma.$transaction(async (tx) => {
  const payment = await tx.contractPayment.findUnique({ where: { id: paymentId }, include: { contract: { include: { signature: true } } } });
  if (!payment) throw new ApiError(404, "Khong tim thay thanh toan");
  if (payment.type === "DEPOSIT" && !payment.contract.signature) throw new ApiError(409, "Hop dong chua co chu ky dien tu cua khach hang");
  if (payment.externalReference && payment.externalReference !== externalReference) throw new ApiError(409, "Thanh toan da duoc doi soat");
  const expected = Number(payment.expectedAmount);
  const status = receivedAmount === expected ? "SUCCESS" : receivedAmount < expected ? "PARTIAL" : "OVERPAID";
  const updated = await tx.contractPayment.update({
    where: { id: payment.id },
    data: {
      receivedAmount,
      externalReference,
      status,
      paidAt: new Date(),
      metadata: { ...jsonObject(payment.metadata), reconciliation: payload } as Prisma.InputJsonValue,
    },
  });
  const aggregate = await tx.contractPayment.aggregate({
    where: { contractId: payment.contractId, status: { in: ["SUCCESS", "PARTIAL", "OVERPAID"] } },
    _sum: { receivedAmount: true },
  });
  const paidAmount = Number(aggregate._sum.receivedAmount ?? 0);
  const remainingAmount = Math.max(0, Number(payment.contract.totalAmount) - paidAmount);
  const reachedDeposit = paidAmount >= Number(payment.contract.depositAmount);
  await tx.weddingContract.update({
    where: { id: payment.contractId },
    data: {
      paidAmount,
      remainingAmount,
      status: reachedDeposit && payment.contract.status === "PENDING_DEPOSIT" ? "DEPOSITED" : payment.contract.status,
    },
  });
  await tx.notification.create({
    data: {
      userId: payment.contract.customerId,
      title: "Cap nhat thanh toan",
      message: status === "SUCCESS" ? "Khoan thanh toan da duoc doi soat thanh cong." : "Khoan thanh toan da duoc ghi nhan va can doi soat them.",
      type: "PAYMENT",
      link: `/customer/contracts/${payment.contractId}`,
    },
  });
  return updated;
}, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

router.post("/casso/webhook", asyncHandler(async (req, res) => {
  const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body));
  const signature = req.header("x-casso-signature") ?? req.header("x-signature") ?? undefined;
  const secureToken = req.header("secure-token") ?? req.header("x-secure-token") ?? undefined;
  const signatureValid = verifyWebhookSignature(rawBody, signature, secureToken);
  const transactionSchema = z.object({
    id: z.union([z.string(), z.number()]).optional(),
    tid: z.string().optional(),
    amount: z.coerce.number().positive(),
    description: z.string().default(""),
  }).passthrough();
  const body = z.object({ data: z.union([transactionSchema, z.array(transactionSchema)]).optional() }).passthrough().parse(req.body);
  const transactions = body.data ? (Array.isArray(body.data) ? body.data : [body.data]) : [transactionSchema.parse(req.body)];
  const candidates = await prisma.contractPayment.findMany({ where: { status: { in: ["PENDING", "PARTIAL"] } } });
  const results = [];

  for (const [index, transaction] of transactions.entries()) {
    const fallbackId = createHash("sha256").update(rawBody).update(String(index)).digest("hex");
    const externalEventId = String(transaction.id ?? transaction.tid ?? fallbackId);
    const webhook = await prisma.cassoWebhookEvent.upsert({
      where: { externalEventId },
      update: {},
      create: { externalEventId, payload: transaction as Prisma.InputJsonValue, signatureValid },
    });
    if (webhook.processed) continue;
    if (!signatureValid) {
      await prisma.cassoWebhookEvent.update({ where: { id: webhook.id }, data: { errorMessage: "Chu ky webhook khong hop le" } });
      continue;
    }
    const description = transaction.description.toLocaleUpperCase("vi-VN").replace(/\s+/g, " ").trim();
    const payment = candidates.find((candidate) => description.includes(candidate.transferContent.toLocaleUpperCase("vi-VN")) || description.includes(candidate.transactionCode.toLocaleUpperCase("vi-VN")));
    if (!payment) {
      await prisma.cassoWebhookEvent.update({ where: { id: webhook.id }, data: { errorMessage: "Khong tim thay thanh toan phu hop" } });
      continue;
    }
    const result = await reconcilePayment(payment.id, transaction.amount, externalEventId, transaction);
    await prisma.cassoWebhookEvent.update({ where: { id: webhook.id }, data: { processed: true, processedAt: new Date() } });
    results.push(result);
  }
  if (!signatureValid) throw new ApiError(401, "Chu ky webhook khong hop le");
  res.json({ success: true, data: results, message: `Da xu ly ${results.length} giao dich` });
}));

router.post("/payos/webhook", asyncHandler(async (req, res) => {
  if (!payosEnabled) throw new ApiError(503, "payOS chua duoc cau hinh");

  let webhookData;
  try {
    webhookData = await getPayOS().webhooks.verify(req.body);
  } catch {
    throw new ApiError(401, "Chu ky webhook payOS khong hop le");
  }

  const externalEventId = `payos:${webhookData.reference}`;
  const event = await prisma.cassoWebhookEvent.upsert({
    where: { externalEventId },
    update: {},
    create: {
      externalEventId,
      payload: webhookData as Prisma.InputJsonValue,
      signatureValid: true,
    },
  });
  if (event.processed) {
    res.json({ success: true, data: null, message: "Webhook da duoc xu ly" });
    return;
  }

  if (req.body?.success !== true || webhookData.code !== "00") {
    await prisma.cassoWebhookEvent.update({
      where: { id: event.id },
      data: { processed: true, processedAt: new Date(), errorMessage: "payOS khong bao giao dich thanh cong" },
    });
    res.json({ success: true, data: null, message: "Da xac nhan webhook payOS" });
    return;
  }

  const candidates = await prisma.contractPayment.findMany({
    where: { status: { in: ["PENDING", "PARTIAL", "SUCCESS", "OVERPAID"] } },
  });
  const payment = candidates.find((candidate) => payosOrderCode(candidate.transactionCode) === webhookData.orderCode);
  if (!payment) {
    await prisma.cassoWebhookEvent.update({
      where: { id: event.id },
      data: {
        processed: true,
        processedAt: new Date(),
        errorMessage: "Khong tim thay thanh toan payOS phu hop",
      },
    });
    // payOS sends a signed sample while registering the webhook. A valid
    // signature must receive 2xx even when the sample is not a local order.
    res.json({ success: true, data: null, message: "Da xac nhan webhook payOS" });
    return;
  }

  const data = await reconcilePayment(payment.id, webhookData.amount, externalEventId, webhookData);
  await prisma.cassoWebhookEvent.update({
    where: { id: event.id },
    data: { processed: true, processedAt: new Date(), errorMessage: null },
  });
  res.json({ success: true, data });
}));

router.use(authenticate);
router.get("/", authorize("ADMIN"), asyncHandler(async (_req, res) => {
  const data = await prisma.contractPayment.findMany({ include: { contract: { include: { customer: { select: { fullName: true, email: true } } } } }, orderBy: { createdAt: "desc" } });
  res.json({ success: true, data });
}));
router.get("/:id", asyncHandler(async (req, res) => {
  const data = await prisma.contractPayment.findUnique({ where: { id: req.params.id! }, include: { contract: true } });
  if (!data) throw new ApiError(404, "Khong tim thay thanh toan");
  if (req.auth!.role !== "ADMIN" && data.contract.customerId !== req.auth!.userId) throw new ApiError(403, "Khong co quyen xem thanh toan nay");
  res.json({ success: true, data });
}));
router.post("/:id/payos-link", asyncHandler(async (req, res) => {
  if (!payosEnabled) throw new ApiError(503, "payOS chua duoc cau hinh");
  const payment = await prisma.contractPayment.findUnique({
    where: { id: req.params.id! },
    include: { contract: { include: { signature: true, customer: true } } },
  });
  if (!payment) throw new ApiError(404, "Khong tim thay thanh toan");
  if (req.auth!.role !== "ADMIN" && payment.contract.customerId !== req.auth!.userId) {
    throw new ApiError(403, "Khong co quyen thanh toan hop dong nay");
  }
  if (payment.type === "DEPOSIT" && !payment.contract.signature) {
    throw new ApiError(409, "Hop dong chua co chu ky dien tu cua khach hang");
  }
  if (!["PENDING", "PARTIAL"].includes(payment.status)) {
    throw new ApiError(409, "Khoan thanh toan nay khong con cho xu ly");
  }

  const metadata = jsonObject(payment.metadata);
  const existingPayos = metadata.payos;
  if (existingPayos && typeof existingPayos === "object" && !Array.isArray(existingPayos)) {
    const checkoutUrl = existingPayos.checkoutUrl;
    if (typeof checkoutUrl === "string") {
      res.json({ success: true, data: existingPayos });
      return;
    }
  }

  const amount = Math.round(Number(payment.expectedAmount) - Number(payment.receivedAmount));
  if (amount <= 0) throw new ApiError(409, "Khoan thanh toan da duoc thanh toan du");
  const clientUrl = frontendUrl(req.header("origin") ?? undefined);
  const returnBase = `${clientUrl}/customer/contracts/${payment.contractId}/payment`;
  const link = await getPayOS().paymentRequests.create({
    orderCode: payosOrderCode(payment.transactionCode),
    amount,
    description: payment.transferContent.slice(0, 25),
    returnUrl: `${returnBase}?payos=success`,
    cancelUrl: `${returnBase}?payos=cancelled`,
    buyerName: payment.contract.customer.fullName,
    buyerEmail: payment.contract.customer.email,
    buyerPhone: payment.contract.customer.phone ?? undefined,
    items: [{ name: payment.type === "DEPOSIT" ? "Dat coc tiec cuoi" : "Thanh toan hop dong", quantity: 1, price: amount }],
  });
  const payosMetadata = {
    orderCode: link.orderCode,
    paymentLinkId: link.paymentLinkId,
    checkoutUrl: link.checkoutUrl,
    qrCode: link.qrCode,
    accountNumber: link.accountNumber,
    accountName: link.accountName,
    amount: link.amount,
    description: link.description,
    status: link.status,
    expiredAt: link.expiredAt ?? null,
  };
  await prisma.contractPayment.update({
    where: { id: payment.id },
    data: { metadata: { ...metadata, payos: payosMetadata } as Prisma.InputJsonValue },
  });
  res.json({ success: true, data: payosMetadata });
}));
router.post("/:id/payos-sync", asyncHandler(async (req, res) => {
  if (!payosEnabled) throw new ApiError(503, "payOS chua duoc cau hinh");
  const payment = await prisma.contractPayment.findUnique({
    where: { id: req.params.id! },
    include: { contract: { include: { signature: true } } },
  });
  if (!payment) throw new ApiError(404, "Khong tim thay thanh toan");
  if (req.auth!.role !== "ADMIN" && payment.contract.customerId !== req.auth!.userId) {
    throw new ApiError(403, "Khong co quyen thanh toan hop dong nay");
  }
  if (payment.type === "DEPOSIT" && !payment.contract.signature) {
    throw new ApiError(409, "Hop dong chua co chu ky dien tu cua khach hang");
  }
  if (["SUCCESS", "OVERPAID"].includes(payment.status)) {
    res.json({ success: true, data: payment, synchronized: true });
    return;
  }
  const payosMetadata = jsonObject(payment.metadata).payos;
  if (!payosMetadata || typeof payosMetadata !== "object" || Array.isArray(payosMetadata)) {
    throw new ApiError(409, "Chua tao lien ket thanh toan payOS");
  }

  const detail = await getPayOS().paymentRequests.get(payosOrderCode(payment.transactionCode));
  if (detail.amountPaid <= 0) {
    res.json({ success: true, data: payment, synchronized: false, message: "payOS chua ghi nhan giao dich" });
    return;
  }
  const reference = detail.transactions.at(-1)?.reference ?? detail.id;
  const data = await reconcilePayment(payment.id, detail.amountPaid, `payos:${reference}`, detail);
  res.json({ success: true, data, synchronized: true });
}));
router.post("/:id/confirm", authorize("ADMIN"), asyncHandler(async (req, res) => {
  const input = z.object({ receivedAmount: z.number().positive(), reference: z.string().min(2) }).parse(req.body);
  const data = await reconcilePayment(req.params.id!, input.receivedAmount, input.reference, { confirmedByAdmin: req.auth!.userId });
  await writeAuditLog(req, "CONFIRM_PAYMENT", "ContractPayment", data.id, input);
  res.json({ success: true, data });
}));

export const contractPaymentsRouter = Router({ mergeParams: true })
  .use(authenticate)
  .post("/", asyncHandler(async (req, res) => {
    const contract = await prisma.weddingContract.findUnique({ where: { id: req.params.id! } });
    if (!contract) throw new ApiError(404, "Khong tim thay hop dong");
    if (req.auth!.role !== "ADMIN" && contract.customerId !== req.auth!.userId) throw new ApiError(403, "Khong co quyen tao thanh toan");
    const input = z.object({ type: z.enum(["DEPOSIT", "REMAINING"]).default("REMAINING") }).parse(req.body);
    const expectedAmount = input.type === "DEPOSIT" ? contract.depositAmount : contract.remainingAmount;
    if (Number(expectedAmount) <= 0) throw new ApiError(409, "Hop dong khong con so tien can thanh toan");
    const existing = await prisma.contractPayment.findFirst({ where: { contractId: contract.id, type: input.type, status: { in: ["PENDING", "PARTIAL"] } } });
    if (existing) throw new ApiError(409, "Da ton tai yeu cau thanh toan dang cho cho loai nay");
    const data = await prisma.contractPayment.create({
      data: { contractId: contract.id, transactionCode: createCode("PAY"), transferContent: `TT ${contract.contractCode} ${Date.now().toString().slice(-5)}`, type: input.type, expectedAmount },
    });
    res.status(201).json({ success: true, data });
  }))
  .get("/", asyncHandler(async (req, res) => {
    const contract = await prisma.weddingContract.findUnique({ where: { id: req.params.id! } });
    if (!contract) throw new ApiError(404, "Khong tim thay hop dong");
    if (req.auth!.role !== "ADMIN" && contract.customerId !== req.auth!.userId) throw new ApiError(403, "Khong co quyen xem thanh toan");
    const data = await prisma.contractPayment.findMany({ where: { contractId: contract.id }, orderBy: { createdAt: "desc" } });
    res.json({ success: true, data });
  }));

export { router as paymentsRouter };
