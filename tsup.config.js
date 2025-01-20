export default {
  entry: ["src/index.ts"],
  format: ["cjs", "esm", "iife"],
  dts: true,
  minify: true,
  name: "hanafudaJS",
  clean: true,
  outExtension({ format }) {
    return {
      js: format === "iife" ? ".min.js" : format === "esm" ? ".mjs" : ".js",
    }
  },
}
