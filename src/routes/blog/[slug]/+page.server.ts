import { compileTypc } from "$lib/typst/typst-compiler.server";
import type { PageServerLoad } from "./$types";
import fs from "node:fs/promises";
import path from "node:path";

export const prerender = true;

export const entries = async () => {
  const dir = path.resolve("src/typ");
  const files = await fs.readdir(dir, { withFileTypes: true });
  return files
    .filter((d) => d.isFile() && d.name.endsWith(".typ"))
    .map((d) => ({ slug: d.name.slice(0, -".typ".length) }));
};

export const load: PageServerLoad = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return {
      html: "",
      error: "Missing route param: slug",
      source: "",
    };
  }

  const relativePath = `${slug}.typ`;
  const res = await compileTypc(relativePath);
  return {
    html: res.html ?? "",
    error: res.error ?? "",
    source: relativePath,
  };
};
