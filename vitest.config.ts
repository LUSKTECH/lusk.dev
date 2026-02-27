import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: [
      "__tests__/**/*.test.ts",
      "__tests__/**/*.test.tsx",
      "__tests__/**/*.property.test.ts",
      "__tests__/**/*.property.test.tsx",
    ],
    coverage: {
      provider: "istanbul",
      reporter: ["lcov", "text"],
    },
  },
});
