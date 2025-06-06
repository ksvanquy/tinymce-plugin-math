import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/plugin.ts",
  output: {
    file: "tinymce/plugins/math/plugin.min.js",
    format: "iife",
    name: "plugin",
    globals: {
      tinymce: "tinymce",
    },
  },
  external: ["tinymce"],
  plugins: [resolve(), typescript(), terser()],
};
