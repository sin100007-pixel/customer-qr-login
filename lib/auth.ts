import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.APP_SECRET || "devsecret");

export type SessionPayload = { uid: string, name: string };

export async function setSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  cookies().set("session", token, { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export function clearSession() {
  cookies().set("session", "", { httpOnly: true, maxAge: 0, path: "/" });
}
