import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          // Use env var or IPv4 loopback to avoid macOS AirTunes/AirPlay collisions
          target: env.VITE_API_TARGET || "http://127.0.0.1:5001",
          changeOrigin: true,
        },
      },
    },
  };
});
