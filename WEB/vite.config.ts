import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En GitHub Pages la web vive en /<repo>/ (WEB_BASE la fija el build del sitio).
export default defineConfig({
  base: process.env.WEB_BASE ?? "/",
  plugins: [react()],
});
