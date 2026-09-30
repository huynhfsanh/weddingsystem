import { env } from "../config/env.js";
import { getPayOS, payosEnabled } from "../config/payos.js";

const main = async () => {
  if (!payosEnabled) throw new Error("Chua cau hinh du PAYOS_CLIENT_ID, PAYOS_API_KEY va PAYOS_CHECKSUM_KEY");

  const input = process.argv[2] || env.PAYMENT_WEBHOOK_URL;
  if (!input) throw new Error("Can truyen URL webhook hoac cau hinh PAYMENT_WEBHOOK_URL");

  const webhookUrl = new URL(input);
  if (webhookUrl.protocol !== "https:") throw new Error("Webhook payOS phai dung HTTPS cong khai");
  if (!webhookUrl.pathname.endsWith("/api/payments/payos/webhook")) {
    throw new Error("URL webhook phai ket thuc bang /api/payments/payos/webhook");
  }

  const result = await getPayOS().webhooks.confirm(webhookUrl.toString());
  console.log(`Da dang ky webhook payOS thanh cong: ${result.webhookUrl}`);
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Khong the dang ky webhook payOS");
  process.exitCode = 1;
});
