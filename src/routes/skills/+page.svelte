<script lang="ts">
  import { onMount } from "svelte";
  import rendererWasmUrl from "@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm?url";

  const source = "foo";
  let container: HTMLElement;

  const render = async () => {
    const { $typst: typst } = await import("@myriaddreamin/typst.ts");

    const g = globalThis as { __typst_inited?: boolean };
    if (!g.__typst_inited) {
      typst.setRendererInitOptions({ getModule: () => rendererWasmUrl });
      g.__typst_inited = true;
    }

    const svg = await typst.svg({
      vectorData: new Uint8Array(
        await (
          await fetch(`/typst/${source}.typc`, { cache: "no-store" })
        ).arrayBuffer(),
      ),
    });
    container.innerHTML = svg;
  };

  onMount(async () => {
    render();
    if (import.meta.hot) {
      import.meta.hot.on("typst:update", (data: { path?: string }) => {
        if (!data?.path) return render();
        const expected = source.endsWith(".typ") ? source : `${source}.typ`;
        if (data.path === expected) render();
      });
    }
  });
</script>

<main>
  <div bind:this={container}></div>
</main>
