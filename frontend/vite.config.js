import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
//import treeSitterPlugin from "vite-plugin-tree-sitter";

//import { visualizer } from "rollup-plugin-visualizer";

//import sizes from 'rollup-plugin-sizes';

//import compiler from '@ampproject/rollup-plugin-closure-compiler';

const assetsDir = 'assets/';
//const assetsDir = '';

const outputDefaults = {
  format: 'iife',

  // error: UMD and IIFE output formats are not supported for code-splitting builds.
  //manualChunks: { 'monaco-editor': ['monaco-editor'], },

  // remove hashes from filenames
  // https://github.com/vitejs/vite/issues/378#issuecomment-789366197
  // https://github.com/vitejs/vite/issues/2944
  // https://github.com/vitejs/vite/issues/4354
  // https://github.com/vitejs/vite/issues/7613 # web workers
  // https://github.com/vitejs/vite/issues/9732
  // https://github.com/vitejs/vite/issues/9877
  entryFileNames: `${assetsDir}[name].js`,
  chunkFileNames: `${assetsDir}[name].js`,
  assetFileNames: `${assetsDir}[name].[ext]`,
}

export default defineConfig({
  plugins: [
    //treeSitterPlugin(['tree-sitter-nix']),
    solidPlugin(),
    //compiler(),
    //sizes(), // show file size per module
    // detailed file sizes
    // https://github.com/harmony-development/tempest/blob/main/vite.config.ts
		/*
    {
      // generate stats.html on "npm run build"
			...visualizer({
				//template: "sunburst",
				brotliSize: true,
			}),
			enforce: "post",
			apply: "build",
		},
    */
  ],
  build: {
    target: "esnext",
    polyfillDynamicImport: false,
    //sourcemap: true,

    minify: false, // boolean | 'terser' | 'esbuild'
    // false: 5396.78 KiB // smaller git diffs
    // 'esbuild': 2027.36 KiB // default
    // 'terser': 2002.37 KiB

    rollupOptions: {
      output: {
        ...outputDefaults,
      }
    },
  },
  worker: {
    rollupOptions: {
      output: {
        ...outputDefaults,
      }
    },
  },
/*
  optimizeDeps: {
    include: (() => {
      const prefix = `monaco-editor/esm/vs`
      return [
        `${prefix}/language/json/json.worker`,
        `${prefix}/language/css/css.worker`,
        `${prefix}/language/html/html.worker`,
        `${prefix}/language/typescript/ts.worker`,
        //`${prefix}/editor/editor.worker`,
      ];
    })
  },
*/
});
