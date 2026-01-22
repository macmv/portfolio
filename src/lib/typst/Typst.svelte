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
      const render = await typst.getRenderer();

      await render.runWithSession(
        {
          artifactContent: new Uint8Array(await res.arrayBuffer()),
          format: "vector",
        },
        async (session) => {
          await render.renderToCanvas({
            renderSession: session,
            container: container,
            backgroundColor: "#eeeeee",
          });

          const el = container.querySelector("svg");
          if (el) {
            el.setAttribute("width", "calc(min(80%, 1200px))");
            el.setAttribute("height", "0%");
          }
        },
      );
    } else {
      if (container) {
        const errors: string = await res.json();

        container.innerHTML = errors;
      }
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

<div bind:this={container}></div>

<style>
  div {
    margin-top: 40pt;
  }
</style>
