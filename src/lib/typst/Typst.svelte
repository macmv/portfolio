<script lang="ts">
  import { onMount } from "svelte";
  import rendererWasmUrl from "@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm?url";

  const { source } = $props<{ source: string }>();
  let container: HTMLElement;

  const render = async () => {
    const { $typst: typst } = await import("@myriaddreamin/typst.ts");

    const g = globalThis as { __typst_inited?: boolean };
    if (!g.__typst_inited) {
      typst.setRendererInitOptions({ getModule: () => rendererWasmUrl });
      g.__typst_inited = true;
    }

    const res = await fetch(`/typst/${source.replace(".typ", ".typc")}`, {
      cache: "no-store",
    });

    if (res.status == 200) {
      container.innerHTML = await res.text();
    } else {
      const errors: string = await res.json();

      container.innerHTML = `<pre>${errors}</pre>`;
    }
  };

  onMount(async () => {
    render();
    if (import.meta.hot) {
      import.meta.hot.on("typst:update", (data: { path?: string }) => {
        if (!data?.path) return render();
        if (data.path === source) render();
      });
    }
  });
</script>

<div class="typst" bind:this={container}></div>

<style>
  div {
    margin: 40pt 20%;
    display: flex;
    justify-content: center;
  }

  .typst :global(*) {
    font-family: "Liberation Serif";
  }

  .typst :global(pre *) {
    font-family: "Liberation Mono";
  }

  .typst :global(h1) {
    font-size: 32pt;
  }
  .typst :global(h2) {
    font-size: 24pt;
  }
  .typst :global(h3) {
    font-size: 20pt;
  }
</style>
