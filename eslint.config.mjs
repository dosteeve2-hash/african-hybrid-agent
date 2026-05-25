import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextCoreVitals,
  ...nextTypeScript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
  globalIgnores([".next/**", "out/**", "node_modules/**", "next-env.d.ts"]),
]);
