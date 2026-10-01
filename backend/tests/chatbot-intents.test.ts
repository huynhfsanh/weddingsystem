import { describe, expect, it } from "vitest";
import { detectChatIntents } from "../src/services/chatbot.service.js";

describe("detectChatIntents", () => {
  it("nhan dien cau hoi tieng Viet co dau va khong dau", () => {
    expect(detectChatIntents("Gói hiện đại giá sao?")).toContain("PACKAGE");
    expect(detectChatIntents("toi muon doi mon trong combo")).toContain("MENU");
    expect(detectChatIntents("Tôi đã thanh toán payOS chưa?")).toContain("PAYMENT");
  });

  it("nhan dien nhieu y dinh trong mot cau", () => {
    expect(detectChatIntents("Hợp đồng của tôi đã ký và đặt cọc chưa?")).toEqual(expect.arrayContaining(["CONTRACT", "PAYMENT"]));
  });

  it("dung GENERAL khi khong co tu khoa", () => {
    expect(detectChatIntents("toi can duoc ho tro them")).toEqual(["GENERAL"]);
  });
});
