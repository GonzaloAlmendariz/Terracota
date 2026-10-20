import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En GitHub Pages el showroom vive en /<repo>/showroom/; en local, en /showroom/.
export default defineConfig({
  base: process.env.SHOWROOM_BASE ?? "/showroom/",
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: { manualChunks: { three: ["three", "@react-three/fiber", "@react-three/drei"] } },
    },
  },
});
