import { mutation } from "./_generated/server";
import { v } from "convex/values";

declare const process: { env: Record<string, string | undefined> };

// Read at call time (not module load) so codegen/analysis works without the env var.
function tokenSecret(): string {
  const secret = process.env.CONVEX_JWT_SECRET;
  if (!secret) throw new Error("CONVEX_JWT_SECRET is not set on this Convex deployment");
  return secret;
}
const TOKEN_VERSION = "v1";
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Rows created before per-user salts have no `salt` and were hashed with this.
const LEGACY_SALT = "static-salt-change-in-prod";

const toHex = (bytes: Uint8Array) => Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");

const newSalt = () => toHex(crypto.getRandomValues(new Uint8Array(16)));

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]);
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: encoder.encode(salt), iterations: 100000 },
    key,
    256
  );
  return toHex(new Uint8Array(hash));
}

async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const candidate = await hashPassword(password, salt);
  if (candidate.length !== hash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) diff |= candidate.charCodeAt(i) ^ hash.charCodeAt(i);
  return diff === 0;
}

async function generateToken(userId: string, email: string): Promise<string> {
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).substring(2, 15);
  const data = `${TOKEN_VERSION}|${userId}|${email}|${timestamp}|${nonce}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(tokenSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(data)
  );

  const sig = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return `${data}|${sig}`;
}

export const verifyToken = async (token: string): Promise<{ userId: string; email: string } | null> => {
  const secret = tokenSecret();
  try {
    const parts = token.split("|");
    if (parts.length !== 6) return null;

    const [version, userId, email, timestamp, nonce, signature] = parts;

    if (version !== TOKEN_VERSION) return null;

    // Verify token hasn't expired
    const now = Date.now();
    const tokenTime = parseInt(timestamp);
    if (now - tokenTime > TOKEN_EXPIRY_MS) return null;

    // Verify signature
    const data = `${version}|${userId}|${email}|${timestamp}|${nonce}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigBytes = new Uint8Array(signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      encoder.encode(data)
    );

    if (!isValid) return null;

    return { userId, email };
  } catch {
    return null;
  }
};

export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser) {
      throw new Error("User already exists");
    }

    const salt = newSalt();
    const hashedPassword = await hashPassword(args.password, salt);

    // Create user
    const userId = args.email;
    await ctx.db.insert("users", {
      userId,
      username: args.username,
      email: args.email,
      emailVerified: false,
      imageUrl: undefined,
      lastActivityDate: Date.now(),
    });

    // Store password
    await ctx.db.insert("passwords", {
      userId,
      hashedPassword,
      salt,
    });

    // Generate token
    const token = await generateToken(userId, args.email);

    return {
      token,
      user: {
        userId,
        username: args.username,
        email: args.email,
      },
    };
  },
});

export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Find password record
    const passwordRecord = await ctx.db
      .query("passwords")
      .filter((q) => q.eq(q.field("userId"), user.userId))
      .first();

    if (!passwordRecord) {
      throw new Error("Invalid email or password");
    }

    const isValid = await verifyPassword(args.password, passwordRecord.hashedPassword, passwordRecord.salt ?? LEGACY_SALT);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    // Lazy migration: move legacy static-salt rows to a per-user salt on successful sign-in.
    if (!passwordRecord.salt) {
      const salt = newSalt();
      await ctx.db.patch(passwordRecord._id, { salt, hashedPassword: await hashPassword(args.password, salt) });
    }

    // Update lastActivityDate
    await ctx.db.patch(user._id, {
      lastActivityDate: Date.now(),
    });

    // Generate token
    const token = await generateToken(user.userId, user.email);

    return {
      token,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
      },
    };
  },
});
