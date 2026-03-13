<script lang="ts">
  import { onMount } from "svelte";
  import init from "../../../../fluid/pkg";
  import { buildFluid, drawGradientGraph, drawPoly6Graph } from "./fluid";
  const dev = import.meta.env.DEV;

  const { data } = $props<{
    data: { html: string; error: string; source: string };
  }>();

  let container: HTMLElement;

  const render = async () => {
    const res = await fetch(`/typst/${data.source.replace(".typ", ".typc")}`, {
      cache: "no-store",
    });

    if (res.status == 200) {
      container.innerHTML = await res.text();
    } else {
      const errors: string = await res.json();

      container.innerHTML = `<pre>${errors}</pre>`;
    }

    addSims();
  };

  let sims = [];

  const addSims = () => {
    sims.push(
      buildFluid(document.getElementById("simulation-gravity"), {
        features: {
          descent: false,
          tensile: false,
        },
      }),
    );
    sims.push(
      buildFluid(document.getElementById("simulation-verlet"), {
        features: {
          descent: true,
          tensile: true,
        },
      }),
    );

    drawPoly6Graph(document.getElementById("graph-poly6"));
    drawGradientGraph(document.getElementById("graph-gradient"));
  };

  if (dev) {
    onMount(async () => {
      await init();
      await render();

      if (import.meta.hot) {
        import.meta.hot.on("typst:update", (d: { path?: string }) => {
          if (!d?.path) return render();
          if (d.path === data.source) render();
        });
      }

      () => {
        for (const sim of sims) {
          sim.stop();
        }
      };
    });
  } else {
    onMount(async () => {
      await init();
      addSims();

      () => {
        for (const sim of sims) {
          sim.stop();
        }
      };
    });
  }
</script>

<div id="simulation-foo"></div>
<div id="simulation-bar"></div>

<div class="typst" bind:this={container}>
  {#if !dev}
    {@html data.html}
  {:else if data.error}
    <pre>{data.error}</pre>
  {/if}
</div>

<style>
  div {
    margin: 20pt 20%;
    display: flex;
    justify-content: center;
  }

  .typst :global(*) {
    font-family: "Liberation Serif";
  }

  .typst :global(pre *) {
    font-family: "Liberation Mono", monospace;
  }

  .typst :global(pre) {
    margin: 1em;
  }
  .typst :global(pre .line) {
    counter-increment: line;
    display: block;
  }
  .typst :global(pre .line::before) {
    content: counter(line);
    display: inline-block;
    text-align: right;
    width: 3ch;
    padding-right: 0.5em;
    color: #333;
    border-right: 1px solid #aaa;
    margin-right: 0.5em;
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

  .typst :global(p) {
    text-align: justify;
    text-indent: 2em;
  }

  .typst :global(ul) {
    padding-left: 2em;
    list-style-type: disc;
  }

  .typst :global(.simulation) {
    display: flex;
    justify-content: center;
  }
</style>
