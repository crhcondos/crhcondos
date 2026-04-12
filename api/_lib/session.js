import crypto from "crypto";

const COOKIE_NAME = "crh_session";
const SEVEN_DAYS = 60 * 60 * 24 * 7;

function getSecret() {
  const secret = process.env.SESSION_SECRET || process.env.POSTGRES_PASSWORD;
  if (!secret) {
    throw new Error("Missing SESSION_SECRET.");
  }
  return secret;
}

function base64urlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64urlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function createSessionToken(payload) {
  const body = base64urlEncode(JSON.stringify(payload));
  const signature = sign(body);
  return `${body}.${signature}`;
}

export function verifySessionToken(token) {
  if (!token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  const expected = sign(body);

  if (!signature || signature.length !== expected.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  try {
    return JSON.parse(base64urlDecode(body));
  } catch {
    return null;
  }
}

export function parseCookies(req) {
  const raw = req.headers.cookie || "";
  return Object.fromEntries(
    raw
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

export function readSession(req) {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  return verifySessionToken(token);
}

export function requireSession(req, res) {
  const session = readSession(req);
  if (!session?.userId || !session?.role) {
    res.status(401).json({ error: "Your session has expired. Please log in again." });
    return null;
  }
  return session;
}

export function requireRole(req, res, role) {
  const session = requireSession(req, res);
  if (!session) return null;
  if (session.role !== role) {
    res.status(403).json({ error: "You do not have access to this action." });
    return null;
  }
  return session;
}

export function setSessionCookie(res, payload) {
  const token = createSessionToken(payload);
  const cookie = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${SEVEN_DAYS}`,
    "HttpOnly",
    "SameSite=Lax",
    "Secure"
  ].join("; ");

  res.setHeader("Set-Cookie", cookie);
}

export function clearSessionCookie(res) {
  const cookie = [
    `${COOKIE_NAME}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Lax",
    "Secure"
  ].join("; ");

  res.setHeader("Set-Cookie", cookie);
}
