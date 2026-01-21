<script lang="ts">
  import { onMount } from "svelte";
  import rendererWasmUrl from "@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm?url";
  import compilerWasmUrl from "@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url";

  let element: HTMLElement;

  onMount(async () => {
    const { $typst: typst } = await import("@myriaddreamin/typst.ts");

    const g = globalThis as { __typst_inited?: boolean };
    if (!g.__typst_inited) {
      typst.setRendererInitOptions({ getModule: () => rendererWasmUrl });
      typst.setCompilerInitOptions({ getModule: () => compilerWasmUrl });
      g.__typst_inited = true;
    }

    const svg = await typst.svg({
      mainContent: "Hello, typst!",
    });
    element.innerHTML = svg;
  });
</script>

<main>
  <div bind:this={element}></div>
</main>
