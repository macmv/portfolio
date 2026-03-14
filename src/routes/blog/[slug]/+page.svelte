<script lang="ts">
  import { onMount } from "svelte";
  import init, {
    kernel_poly6,
    kernel_spiky_gradient,
    tensile_correction,
  } from "../../../../fluid/pkg";
  import { buildFluid, draw2dGraph, drawGradientGraph } from "./fluid";
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
    for (const sim of sims) {
      sim.stop();
    }
    sims = [];

    sims.push(
      buildFluid(document.getElementById("simulation-demo"), {
        features: {
          descent: true,
          naive_lambda: false,
          no_tensile: false,
        },
      }),
    );

    sims.push(
      buildFluid(document.getElementById("simulation-gravity"), {
        features: {
          descent: false,
          naive_lambda: false,
          no_tensile: false,
        },
      }),
    );
    sims.push(
      buildFluid(document.getElementById("simulation-naive-lambda"), {
        features: {
          descent: true,
          naive_lambda: true,
          no_tensile: true,
        },
      }),
    );
    sims.push(
      buildFluid(document.getElementById("simulation-no-tensile"), {
        features: {
          descent: true,
          naive_lambda: false,
          no_tensile: true,
        },
      }),
    );
    sims.push(
      buildFluid(document.getElementById("simulation-with-tensile"), {
        features: {
          descent: true,
          naive_lambda: false,
          no_tensile: false,
        },
      }),
    );

    draw2dGraph(
      document.getElementById("graph-poly6"),
      [-1, 1],
      "Distance",
      [0, 1.4],
      "Wpoly6",
      (x) => kernel_poly6(x, 1),
    );
    drawGradientGraph(document.getElementById("graph-gradient"));
    draw2dGraph(
      document.getElementById("graph-gradient-slice"),
      [-1, 1],
      "X",
      [0, 10],
      "Gradient",
      (x) => Math.abs(kernel_spiky_gradient(x, 0, 1).x),
    );
    draw2dGraph(
      document.getElementById("graph-tensile"),
      [-1, 1],
      "Distance",
      [-0.05, 0],
      "Tensile Correction",
      (x) => tensile_correction(x, 1),
    );
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

  .typst :global(pre *),
  .typst :global(code) {
    font-size: 10pt;
    font-family: "Liberation Mono", monospace;
  }

  .typst :global(code:not(pre code)) {
    border: 0px solid #aaa;
    background: #d8d8d8;
    padding: 0pt 3pt;
    border-radius: 2pt;
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
    flex-direction: column;
    width: fit-content;
    max-width: 100%;
    margin: 0 auto;
  }

  .typst :global(.simulation-stage > .controls) {
    display: flex;
    width: 100%;
    gap: 10pt;
    justify-content: end;
  }

  .typst :global(.simulation-stage) {
    position: relative;
  }

  .typst :global(.simulation-overlay) {
    position: absolute;
    inset: 0;
    background: color-mix(in srgb, white 78%, transparent);
    backdrop-filter: blur(2px);
  }

  .typst :global(.button) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 5pt;
    padding: 5pt 10pt;
    transition: background-color 0.2s ease-in;
  }
  .typst :global(.button):hover {
    background-color: #fff;
  }
</style>
