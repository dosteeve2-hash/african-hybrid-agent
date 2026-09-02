import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextCoreVitals,
  ...nextTypeScript,
  {
    rules: {
      // 41 `any` subsistent dans les couches RAG et agent ; la règle reste en
      // warning le temps de les typer, pour que la CI puisse déjà bloquer sur
      // tout le reste.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    // Scripts Node lancés à la main (embeddings, test de charge) : ils ne
    // passent pas par le bundle Next, `require()` y est la bonne syntaxe.
    files: ["scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "node_modules/**", "next-env.d.ts"]),
]);
