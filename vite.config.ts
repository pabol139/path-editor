import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const hosts = process.env.VITE_ALLOWED_HOSTS?.split(",") || [];

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: hosts,
  },
  preview: {
    allowedHosts: hosts,
  },
});
