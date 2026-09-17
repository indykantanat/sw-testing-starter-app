import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    tsconfigPaths: true,          // ให้ @/… และ @generated/… ใช้ได้ในเทสต์
  },
  test: {
    environment: "jsdom",         // ค่าเริ่มต้นของทุกไฟล์: มี document/window
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}", "src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", "generated/**", "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/lib/**/*.ts", "src/app/[(]front[)]/components/**/*.tsx"],
      exclude: ["src/lib/prisma.ts", "src/lib/auth.ts", "src/lib/auth-client.ts"],
    },
  },
})