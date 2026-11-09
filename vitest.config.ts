import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/convex/**/*.test.ts"],
    environment: "edge-runtime",
    server: { deps: { inline: ["convex-test"] } },
    env: { CONVEX_JWT_SECRET: "test-secret" },
  },
});
