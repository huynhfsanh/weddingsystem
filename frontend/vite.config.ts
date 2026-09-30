import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "charts", test: /node_modules[\\/](recharts|d3-)/, priority: 20 },
            { name: "maps", test: /node_modules[\\/]@googlemaps/, priority: 20 },
            { name: "react", test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/, priority: 15 },
            { name: "data", test: /node_modules[\\/](@tanstack|axios)/, priority: 15 },
            { name: "ui", test: /node_modules[\\/](@radix-ui|lucide-react)/, priority: 10 },
            { name: "vendor", test: /node_modules/, priority: 1 },
          ],
        },
      },
    },
  },
  server: { port: 5173 },
  preview: { port: 4173 },
});
