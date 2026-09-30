import { PayOS } from "@payos/node";
import { env } from "./env.js";

// CASSO_* aliases keep existing local configuration compatible with payOS credentials.
const clientId = env.PAYOS_CLIENT_ID ?? env.CASSO_CLIENT_ID;
const apiKey = env.PAYOS_API_KEY ?? env.CASSO_API_KEY;
const checksumKey = env.PAYOS_CHECKSUM_KEY ?? env.CASSO_CHECKSUM_KEY;

export const payosEnabled = Boolean(clientId && apiKey && checksumKey);

let client: PayOS | undefined;

export const getPayOS = () => {
  if (!payosEnabled || !clientId || !apiKey || !checksumKey) {
    throw new Error("payOS chua duoc cau hinh");
  }
  client ??= new PayOS({ clientId, apiKey, checksumKey, logLevel: "error" });
  return client;
};
