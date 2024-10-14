import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import pages from 'vite-plugin-react-pages'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import path from "path";

import {nodePolyfills} from "vite-plugin-node-polyfills";
// https://vitejs.dev/config/
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    pages({
      pagesDir: 'src/pages',
    }),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
      // Explicitly enable the process polyfill
      include: ['process']
    }),
    ViteImageOptimizer({
      png: {
        // https://sharp.pixelplumbing.com/api-output#png
        quality: 80,
      },
      jpeg: {
        // https://sharp.pixelplumbing.com/api-output#jpeg
        quality: 80,
      },
      jpg: {
        // https://sharp.pixelplumbing.com/api-output#jpeg
        quality: 80,
      },
      svg: {
        // https://svgo.dev/docs/configuration/
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
                removeTitle: false,
              },
            },
          },
        ],
      },
    }),
  ],
	base: "/",
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			process: 'process/browser',
			stream: 'stream-browserify',
			zlib: 'browserify-zlib',
			util: 'util',
		},
	},
	optimizeDeps: {
		esbuildOptions: {
			define: {
				global: 'globalThis'
			},
			plugins: [
				NodeGlobalsPolyfillPlugin({
					process: true,
					// buffer: true
				}),
				NodeModulesPolyfillPlugin()
			]
		}
	},
	build: {
		rollupOptions: {
			plugins: [
				rollupNodePolyFill()
			]
    },
    outDir: 'dist',
	},
	define: {
		'global': 'globalThis',
		'process.env': {},
		'process.browser': true,
	},
});
