import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const mediapipeWasmSrc = path.resolve(
    __dirname,
    'node_modules/@mediapipe/tasks-vision/wasm'
  );

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Serves MediaPipe Tasks Vision WASM assets locally in dev and copies
      // them to dist/ on build so hand tracking matches the installed SDK version.
      {
        name: 'serve-mediapipe-wasm',
        configureServer(server) {
          server.middlewares.use('/mediapipe-wasm', (req, res, next) => {
            const urlPath = (req.url || '').split('?')[0].replace(/^\/+/, '');
            if (!urlPath || urlPath.includes('..')) {
              next();
              return;
            }
            const filePath = path.join(mediapipeWasmSrc, urlPath);
            if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
              next();
              return;
            }
            if (filePath.endsWith('.wasm')) {
              res.setHeader('Content-Type', 'application/wasm');
            } else if (filePath.endsWith('.js')) {
              res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            }
            fs.createReadStream(filePath).pipe(res);
          });
        },
        closeBundle(error?: Error): void {
          if (error) return;
          const distDir = path.resolve(__dirname, 'dist');
          const distWasm = path.resolve(distDir, 'mediapipe-wasm');
          if (fs.existsSync(distDir) && fs.existsSync(mediapipeWasmSrc)) {
            fs.cpSync(mediapipeWasmSrc, distWasm, {recursive: true, force: true});
          }
        },
      },
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
