import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import packageJson from './package.json';
import { VitePWA } from 'vite-plugin-pwa';
// @ts-ignore
import fs from 'fs';
// @ts-ignore
import path from 'path';


export default defineConfig({
  plugins: [
    solidPlugin(),
    VitePWA({
      srcDir: "/",
      filename: "imageCacheWorker.js",
      strategies: "injectManifest",
      injectRegister: false,
      manifest: false,
      injectManifest: {
        injectionPoint: undefined,
      },
      devOptions: {
        enabled: true,
        type: 'module',
        /* other options */
      }
    }),
    {
      name: 'copy-favicon',
      apply: 'build',
      closeBundle() {
        const src = path.resolve('src/assets/favicon.ico');
        const dest = path.resolve('dist/favicon.ico');

        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      },
    },
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    manifest: true,
  },
  envPrefix: 'PRIMAL_',
  define: {
    'import.meta.env.PRIMAL_VERSION': JSON.stringify(packageJson.version),
  },
  esbuild: {
    keepNames: true,
  },
});
