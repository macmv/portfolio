import path from "node:path";
import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import wasm from "vite-plugin-wasm";

// https://vite.dev/config/
export default defineConfig({
  plugins: [sveltekit(), tailwindcss(), wasm(), typstHmr()],
  server: {
    fs: {
      allow: ["render/pkg"],
    },
  },
});

function typstHmr() {
  const typstRoot = path.resolve("src/typ");
  return {
    name: "typst-hmr",
    handleHotUpdate({ file, server }) {
      if (!file.endsWith(".typ")) return;
      if (!file.startsWith(typstRoot + path.sep)) return;
      const rel = path.relative(typstRoot, file).replace(/\\/g, "/");
      server.ws.send({
        type: "custom",
        event: "typst:update",
        data: { path: rel },
      });
    },
  };
}
