/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, expect, test, vi } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const creds = { email: "a@x.com", password: "hunter22" };

afterEach(() => vi.useRealTimers());

async function signUp(t: ReturnType<typeof convexTest>, email = creds.email) {
  return t.mutation(api.auth.signUp, { email, password: creds.password, username: email });
}

const addSolve = (t: ReturnType<typeof convexTest>, token: string) =>
  t.mutation(api.solve.createSolve, { token, cubeType: "3x3", time: 10, scramble: "R U", dnf: false });

test("sign up then sign in", async () => {
  const t = convexTest(schema, modules);
  await signUp(t);
  const { token, user } = await t.mutation(api.auth.signIn, creds);
  expect(user.email).toBe(creds.email);
  await expect(addSolve(t, token)).resolves.toBeDefined();
});

test("wrong password is rejected", async () => {
  const t = convexTest(schema, modules);
  await signUp(t);
  await expect(t.mutation(api.auth.signIn, { ...creds, password: "nope" })).rejects.toThrow(/Invalid email or password/);
});

test("legacy static-salt row signs in and is rehashed with a per-user salt", async () => {
  const t = convexTest(schema, modules);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(creds.password), { name: "PBKDF2" }, false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: enc.encode("static-salt-change-in-prod"), iterations: 100000 },
    key,
    256,
  );
  const legacyHash = Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, "0")).join("");
  await t.run(async (ctx) => {
    await ctx.db.insert("users", { userId: creds.email, username: "a", email: creds.email, emailVerified: false, lastActivityDate: 0 });
    await ctx.db.insert("passwords", { userId: creds.email, hashedPassword: legacyHash });
  });

  await t.mutation(api.auth.signIn, creds);
  const row = await t.run((ctx) => ctx.db.query("passwords").first());
  expect(row?.salt).toMatch(/^[0-9a-f]{32}$/);
  expect(row?.hashedPassword).not.toBe(legacyHash);
  await expect(t.mutation(api.auth.signIn, creds)).resolves.toBeDefined();
});

test("createSolve and deleteSolve reject an invalid token", async () => {
  const t = convexTest(schema, modules);
  const { token } = await signUp(t);
  const solveId = await addSolve(t, token);
  await expect(addSolve(t, "garbage")).rejects.toThrow(/Invalid token/);
  await expect(addSolve(t, token.slice(0, -1) + (token.endsWith("0") ? "1" : "0"))).rejects.toThrow(/Invalid token/);
  await expect(t.mutation(api.solve.deleteSolve, { token: "garbage", solveId })).rejects.toThrow(/Invalid token/);
});

test("deleteSolve rejects another user's token", async () => {
  const t = convexTest(schema, modules);
  const { token: owner } = await signUp(t);
  const { token: other } = await signUp(t, "b@x.com");
  const solveId = await addSolve(t, owner);
  await expect(t.mutation(api.solve.deleteSolve, { token: other, solveId })).rejects.toThrow(/access denied/);
  await expect(t.mutation(api.solve.deleteSolve, { token: owner, solveId })).resolves.toEqual({ status: "success" });
});

test("expired token is rejected", async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  const t = convexTest(schema, modules);
  const { token } = await signUp(t);
  vi.setSystemTime(Date.now() + 8 * 24 * 60 * 60 * 1000);
  await expect(addSolve(t, token)).rejects.toThrow(/Invalid token/);
});
