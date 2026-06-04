import { createHash, randomBytes } from "crypto";

export const PASSWORD_RESET_TOKEN_TTL_MS = 1000 * 60 * 60;

export function createPasswordResetToken() {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: hashPasswordResetToken(token),
    expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
  };
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getPasswordResetUrl(token: string) {
  const baseUrl =
    process.env.RESET_PASSWORD_URL ||
    (process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL.replace(/\/$/, "")}/reset-password` : "http://localhost:3000/reset-password");

  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
}
