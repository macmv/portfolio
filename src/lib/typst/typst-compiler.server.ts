import fs from "node:fs";
import path from "node:path";
import { NodeCompiler } from "@myriaddreamin/typst-ts-node-compiler";

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
): Promise<{ typc?: Uint8Array; error?: string }> {
  const absPath = resolveTypstPath(relativePath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`Missing Typst file: ${absPath}`);
  }

  const result = compiler.compile({
    mainFilePath: absPath,
  });

  if (!result.result) {
    const diagnostics = compiler.fetchDiagnostics(result.takeDiagnostics());
    return {
      error: diagnostics
        .map((d) => `${d.path ?? "unknown"}: ${d.message ?? "unknown error"}`)
        .join("\n"),
    };
  }

  return { typc: compiler.vector(result.result) };
}
