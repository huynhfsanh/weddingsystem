import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { answerChatMessage } from "../services/chatbot.service.js";

const router = Router();
router.use(authenticate);

const ownedConversation = async (id: string, userId: string) => {
  const conversation = await prisma.chatbotConversation.findFirst({ where: { id, userId }, include: { messages: { orderBy: { createdAt: "asc" } } } });
  if (!conversation) throw new ApiError(404, "Khong tim thay cuoc tro chuyen");
  return conversation;
};

router.post("/conversations", asyncHandler(async (req, res) => {
  const { title } = z.object({ title: z.string().max(100).optional() }).parse(req.body);
  const data = await prisma.chatbotConversation.create({ data: { userId: req.auth!.userId, title: title || "Tu van tiec cuoi" } });
  res.status(201).json({ success: true, data });
}));
router.get("/conversations", asyncHandler(async (req, res) => {
  const data = await prisma.chatbotConversation.findMany({ where: { userId: req.auth!.userId }, include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" } });
  res.json({ success: true, data });
}));
router.get("/conversations/:id", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await ownedConversation(req.params.id!, req.auth!.userId) });
}));
router.post("/conversations/:id/messages", asyncHandler(async (req, res) => {
  const { message } = z.object({ message: z.string().trim().min(1).max(2000) }).parse(req.body);
  const conversation = await ownedConversation(req.params.id!, req.auth!.userId);
  await prisma.chatbotMessage.create({ data: { conversationId: conversation.id, role: "USER", content: message } });
  const answer = await answerChatMessage(message, conversation.messages, req.auth!.userId);
  const data = await prisma.chatbotMessage.create({ data: { conversationId: conversation.id, role: "ASSISTANT", content: answer.content, media: JSON.parse(JSON.stringify(answer.media)) as Prisma.InputJsonValue } });
  await prisma.chatbotConversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
  res.status(201).json({ success: true, data: { ...data, media: answer.media } });
}));
router.delete("/conversations/:id", asyncHandler(async (req, res) => {
  await ownedConversation(req.params.id!, req.auth!.userId);
  await prisma.chatbotConversation.delete({ where: { id: req.params.id! } });
  res.status(204).send();
}));

export { router as chatbotRouter };
