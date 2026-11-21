/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

async function setup() {
  const t = convexTest(schema, modules);
  const { token } = await t.mutation(api.auth.signUp, { email: "a@x.com", password: "hunter22", username: "a" });
  return { t, token };
}

const add = (t: ReturnType<typeof convexTest>, token: string, time: number, dnf = false) =>
  t.mutation(api.solve.createSolve, { token, cubeType: "3x3", time, scramble: "R U", dnf });

test("buckets aggregate solves by day", async () => {
  const { t, token } = await setup();
  await add(t, token, 10);
  await add(t, token, 20);
  await add(t, token, 99, true);
  const [day, ...rest] = await t.query(api.solve.getSolveBuckets, { token });
  expect(rest).toEqual([]);
  expect(day).toMatchObject({ count: 2, dnfs: 1, mean: 15, best: 10 });
});

test("delete and penalty changes rebuild the day bucket", async () => {
  const { t, token } = await setup();
  const a = await add(t, token, 10);
  const b = await add(t, token, 20);
  await t.mutation(api.solve.setPenalty, { token, solveId: a, penalty: "plus2" });
  expect((await t.query(api.solve.getSolveBuckets, { token }))[0]).toMatchObject({ count: 2, mean: 16, best: 12 });
  await t.mutation(api.solve.deleteSolve, { token, solveId: b });
  expect((await t.query(api.solve.getSolveBuckets, { token }))[0]).toMatchObject({ count: 1, mean: 12 });
  await t.mutation(api.solve.deleteSolve, { token, solveId: a });
  expect(await t.query(api.solve.getSolveBuckets, { token })).toEqual([]);
});

test("a user without buckets is read from solves, then backfilled on the next solve", async () => {
  const { t, token } = await setup();
  const userId = "a@x.com";
  await t.run(async (ctx) => {
    for (const time of [10, 30]) await ctx.db.insert("solves", { userId, cubeType: "3x3", time, scramble: "", dnf: false });
  });
  expect(await t.query(api.solve.getSolveBuckets, { token })).toMatchObject([{ count: 2, mean: 20 }]);
  expect(await t.run((ctx) => ctx.db.query("solveBuckets").collect())).toEqual([]);

  await add(t, token, 20);
  expect(await t.query(api.solve.getSolveBuckets, { token })).toMatchObject([{ count: 3, mean: 20, best: 10 }]);
  expect(await t.run((ctx) => ctx.db.query("solveBuckets").collect())).toHaveLength(1);
});

test("getSolvesSince and getRecentSolves are bounded and ordered", async () => {
  const { t, token } = await setup();
  for (const time of [1, 2, 3]) await add(t, token, time);
  expect((await t.query(api.solve.getSolvesSince, { token, since: 0 })).map((s) => s.time)).toEqual([1, 2, 3]);
  expect((await t.query(api.solve.getSolvesSince, { token, since: Date.now() + 1e9 }))).toEqual([]);
  expect((await t.query(api.solve.getRecentSolves, { token, limit: 2 })).map((s) => s.time)).toEqual([3, 2]);
});

test("times are truncated to centiseconds, not rounded", async () => {
  const { t, token } = await setup();
  await add(t, token, 22.993);
  await add(t, token, 22.999);
  await add(t, token, 1.15);
  await t.mutation(api.solve.importSolves, {
    token,
    solves: [{ cubeType: "3x3", time: 9.996, scramble: "", dnf: false }],
  });
  const times = (await t.query(api.solve.getRecentSolves, { token, limit: 10 })).map((s) => s.time);
  expect(times).toEqual([9.99, 1.15, 22.99, 22.99]);
  expect(await t.query(api.solve.getStats, { token })).toMatchObject({ best_time: 1.15 });
});
