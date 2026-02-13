import { dev } from "$app/environment";
import { compileTypc } from "$lib/typst/typst-compiler.server";

export const csr = dev;
export const load = async ({
  params,
}: {
  params: Record<string, string | undefined>;
}) => {
  const value = params["slug"];
  if (!value) {
    return {
      typstHtml: "",
      typstError: `Missing route param`,
      typstSource: "",
    };
  }

  const relativePath = `${value}.typ`;
  const res = await compileTypc(relativePath);
  return {
    html: res.html ?? "",
    error: res.error ?? "",
    source: relativePath,
  };
};
