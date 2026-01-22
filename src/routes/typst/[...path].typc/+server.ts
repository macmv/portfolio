import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { compileTypc } from "$lib/typst/typst-compiler.server";

export const GET: RequestHandler = async ({ params }) => {
  if (!params.path) {
    throw error(404, "Missing typst path.");
  }
  const res = await compileTypc(`${params.path}.typ`);
  if (res.html) {
    return new Response(res.html, {
      status: 200,
      headers: {
        "content-type": "text/plain",
        "cache-control": "no-store",
      },
    });
  } else {
    return Response.json(res.error, {
      status: 400,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    });
  }
};
