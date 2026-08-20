import { createHash, timingSafeEqual } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { z } from "zod";

export const DASHBOARD_SESSION_COOKIE = "tcf_partner_dashboard";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

export const dashboardLoginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

function getSessionKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Dashboard session signing is not configured");
  return new TextEncoder().encode(secret);
}

function secureEquals(received: string, expected: string) {
  const receivedHash = createHash("sha256").update(received).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(receivedHash, expectedHash);
}

export function isValidDashboardCredential(username: string, password: string) {
  const expectedUsername = process.env.TCF_PARTNER_DASHBOARD_USERNAME;
  const expectedPassword = process.env.TCF_PARTNER_DASHBOARD_PASSWORD;
  if (!expectedUsername || !expectedPassword) return false;
  return secureEquals(username, expectedUsername) && secureEquals(password, expectedPassword);
}

export async function createDashboardSession() {
  return new SignJWT({ access: "partner-dashboard" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSessionKey());
}

function getCookieValue(header: string | undefined, name: string) {
  if (!header) return undefined;
  return header.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`))?.slice(name.length + 1);
}

export async function hasDashboardSession(cookieHeader: string | undefined) {
  const token = getCookieValue(cookieHeader, DASHBOARD_SESSION_COOKIE);
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSessionKey());
    return payload.access === "partner-dashboard";
  } catch {
    return false;
  }
}

export const dashboardSessionMaxAgeMs = SESSION_DURATION_SECONDS * 1000;
