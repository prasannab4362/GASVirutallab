import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "gas-virtual-ai-lab-default-secret-key-32-chars";

async function getKey() {
  const encoder = new TextEncoder();
  const keyData = await crypto.subtle.digest("SHA-256", encoder.encode(SECRET));
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "MENTOR" | "STUDENT";
  name: string;
  studentId?: string;
  mentorId?: string;
  batchId?: string;
  programId?: string;
  createdAt: number;
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(JSON.stringify(payload))
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  // Convert to base64url safely
  let binary = "";
  for (let i = 0; i < combined.byteLength; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const key = await getKey();
    
    // Pad base64url and decode
    let base64 = token.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const iv = bytes.slice(0, 12);
    const ciphertext = bytes.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted)) as SessionPayload;
  } catch (error) {
    console.error("JWT decryption failed:", error);
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return null;
  return await decrypt(sessionToken);
}

export async function setSession(payload: SessionPayload) {
  const token = await encrypt(payload);
  const cookieStore = await cookies();
  // Session expires in 7 days
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });
}
