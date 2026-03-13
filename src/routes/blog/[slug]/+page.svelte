<script lang="ts">
  import { onMount } from "svelte";
  import init, { setup, tick, points, Point } from "../../../../fluid/pkg";
  import * as d3 from "d3";
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
  };

  if (dev) {
    onMount(async () => {
      await render();

      if (import.meta.hot) {
        import.meta.hot.on("typst:update", (d: { path?: string }) => {
          if (!d?.path) return render();
          if (d.path === data.source) render();
        });
      }
    });
  }

  let chart;
  let svg;

  const width = 500;
  const height = 400;
  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 30;
  const marginLeft = 40;

  const x = d3
    .scaleLinear()
    .domain([0, 8])
    .range([marginLeft, width - marginRight]);

  const y = d3
    .scaleLinear()
    .domain([0, 8])
    .range([height - marginBottom, marginTop]);

  let clicked = false;
  let pointer_x = 0;
  let pointer_y = 0;

  onMount(() => {
    svg = d3.create("svg").attr("width", width).attr("height", height);

    const drag = d3
      .drag()
      .on("start", (e) => {
        const [px, py] = d3.pointer(e, svg.node());
        clicked = true;
        pointer_x = x.invert(px);
        pointer_y = y.invert(py);
      })
      .on("drag", (e) => {
        const [px, py] = d3.pointer(e, svg.node());
        pointer_x = x.invert(px);
        pointer_y = y.invert(py);
      })
      .on("end", (e) => {
        clicked = false;
      });

    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#fff")
      .style("pointer-events", "all")
      .call(drag);

    // Add the x-axis.
    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x));

    // Add the y-axis.
    svg
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y));

    // Add a circle for each point
    renderChart([]);

    chart.appendChild(svg.node());
  });

  const renderChart = (points: Point[]) => {
    svg
      .selectAll("circle")
      .data(points.map((p, i) => ({ id: i, x: p.x, y: p.y })))
      .join("circle")
      .attr("cx", (d) => x(d.x))
      .attr("cy", (d) => y(d.y))
      .attr("r", 4)
      .style("fill", "#918ccd");
  };

  onMount(() => {
    let animated = true;
    init().then(() => {
      setup();
      renderChart(points());

      const frame = () => {
        tick(clicked, pointer_x, pointer_y);
        renderChart(points());
        if (animated) {
          requestAnimationFrame(frame);
        }
      };

      requestAnimationFrame(frame);
    });

    () => (animated = false);
  });
</script>

<div class="chart" bind:this={chart}></div>

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
</style>
