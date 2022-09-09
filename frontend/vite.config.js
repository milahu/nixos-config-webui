import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
//import treeSitterPlugin from "vite-plugin-tree-sitter";

export default defineConfig({
  plugins: [
    //treeSitterPlugin(['tree-sitter-nix']),
    solidPlugin(),
  ],
  build: {
    target: "esnext",
    polyfillDynamicImport: false,
  },
});
