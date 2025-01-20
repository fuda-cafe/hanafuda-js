export default {
  entry: ["src/index.ts"],
  format: ["cjs", "esm", "iife"],
  dts: true,
  minify: true,
  clean: true,
  platform: "browser",
  globalName: "hanafudaJS",
  outExtension({ format }) {
    return {
      js: format === "iife" ? ".min.js" : format === "esm" ? ".mjs" : ".js",
    }
  },
  treeshake: true,
  bundle: true,
  sourcemap: true,
}
