import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { compileTypc } from "$lib/typst/typst-compiler.server";

export const GET: RequestHandler = async ({ params }) => {
  if (!params.path) {
    throw error(404, "Missing typst path.");
  }
  const typc = await compileTypc(`${params.path}.typ`);
  return new Response(typc, {
    headers: {
      "content-type": "application/octet-stream",
      "cache-control": "no-store",
    },
  });
};
