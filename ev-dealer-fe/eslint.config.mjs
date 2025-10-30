// eslint.config.mjs (hoặc eslint.config.ts)

import next from "eslint-config-next";
import { defineConfig } from "eslint/config";

export default defineConfig([
  ...next,
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // 🔧 Tắt cảnh báo any
      "react-hooks/exhaustive-deps": "warn",       // Cảnh báo thay vì lỗi
      "no-console": "off",                         // Cho phép dùng console
    },
  },
]);
