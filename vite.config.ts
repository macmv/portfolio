import path from "node:path";
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import wasm from "vite-plugin-wasm";
import { compileTypc } from "./src/lib/typst/typst-compiler.server";

// https://vite.dev/config/
export default defineConfig({
  plugins: [sveltekit(), tailwindcss(), wasm(), typstHmr()],
  server: {
    fs: {
      allow: ["render/pkg"],
    },
  },
});

function typstHmr(): Plugin {
  const typstRoot = path.resolve("src/typ");
  return {
    name: "typst-hmr",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/typst/")) return next();

        try {
          const rel = decodeURIComponent(url.slice("/typst/".length));
          if (!rel) {
            res.statusCode = 404;
            res.end("Missing typst path.");
            return;
          }

          const typcPath = rel.split("?")[0];
          const typPath = typcPath.endsWith(".typc")
            ? typcPath.slice(0, -".typc".length) + ".typ"
            : typcPath;

          const result = await compileTypc(typPath);

          if (result.html) {
            res.statusCode = 200;
            res.setHeader("content-type", "text/plain");
            res.setHeader("cache-control", "no-store");
            res.end(result.html);
          } else {
            res.statusCode = 400;
            res.setHeader("content-type", "application/json");
            res.setHeader("cache-control", "no-store");
            res.end(JSON.stringify(result.error ?? "Unknown error"));
          }
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("content-type", "text/plain");
          res.end(String(err));
        }
      });
    },
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
