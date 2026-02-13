import fs from "node:fs";
import path from "node:path";
import { NodeCompiler } from "@myriaddreamin/typst-ts-node-compiler";
import * as cheerio from "cheerio";

const TYPST_ROOT = path.resolve("src/typ");
let compiler = NodeCompiler.create({
  workspace: TYPST_ROOT,
});

function resolveTypstPath(relativePath: string): string {
  const target = path.resolve(TYPST_ROOT, relativePath);
  if (!target.startsWith(TYPST_ROOT + path.sep)) {
    throw new Error("Typst path must stay within src/typ.");
  }
  return target;
}

export async function compileTypc(
  relativePath: string,
): Promise<{ html?: string; error?: string }> {
  const absPath = resolveTypstPath(relativePath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`Missing Typst file: ${absPath}`);
  }

  compiler.evictCache(30); // we're a watch server

  const result = compiler.compileHtml({
    mainFilePath: absPath,
  });

  const warnings = result.takeWarnings();
  if (warnings) {
    for (const warn of warnings.shortDiagnostics) {
      console.warn(warn);
    }
  }

  if (!result.result) {
    const diagnostics = compiler.fetchDiagnostics(result.takeDiagnostics());
    return {
      error: diagnostics
        .map((d) => `${d.path ?? "unknown"}: ${d.message ?? "unknown error"}`)
        .join("\n"),
    };
  }

  const html = compiler.tryHtml(result.result).result!.body();
  return { html: postProcess(html) };
}

const postProcess = (html: string): string => {
  const $ = cheerio.load(html);
  $("pre > code").each((_, el) => {
    const nodes = $(el).contents().toArray();
    let lines: string[] = [];
    let current: string[] = [];

    for (const node of nodes) {
      if (node.type === "tag" && node.name === "br") {
        lines.push(`<span class="line">${current.join("")}</span>`);
        current = [];
      } else {
        current.push($.html(node));
      }
    }

    lines.push(`<span class="line">${current.join("")}</span>`);
    $(el).html(lines.join(""));
  });

  return $("body").html();
};
