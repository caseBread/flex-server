import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const OFF = "off";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),

  // ✅ 모든 규칙 끄기(Next/TS가 켠 것들 전부 덮어씀)
  {
    files: ["**/*.*"],
    rules: {
      // eslint core
      "no-unused-vars": OFF,
      "no-undef": OFF,
      "no-console": OFF,
      "no-debugger": OFF,
      "no-empty": OFF,
      "no-extra-semi": OFF,

      // Next.js / React
      "@next/next/no-html-link-for-pages": OFF,
      "@next/next/no-img-element": OFF,
      "@next/next/no-head-element": OFF,
      "@next/next/no-sync-scripts": OFF,
      "@next/next/no-css-tags": OFF,

      "react/jsx-key": OFF,
      "react/react-in-jsx-scope": OFF,
      "react/jsx-uses-react": OFF,
      "react-hooks/rules-of-hooks": OFF,
      "react-hooks/exhaustive-deps": OFF,

      // TypeScript rules (typescript-eslint)
      "@typescript-eslint/no-unused-vars": OFF,
      "@typescript-eslint/no-explicit-any": OFF,
      "@typescript-eslint/ban-ts-comment": OFF,
      "@typescript-eslint/consistent-type-imports": OFF,
      "@typescript-eslint/no-non-null-assertion": OFF,
    },
  },
]);

export default eslintConfig;
