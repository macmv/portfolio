<script lang="ts">
  import { onMount } from "svelte";

  const { source } = $props<{ source: string }>();
  let container: HTMLElement;

  const render = async () => {
    const res = await fetch(`/typst/${source.replace(".typ", ".typc")}`, {
      cache: "no-store",
    });

    if (res.status == 200) {
      container.innerHTML = await res.text();

      for (const pre of container.querySelectorAll("pre > code")) {
        let lines = [];
        let line = document.createElement("span");
        line.classList.add("line");
        for (const child of Array.from(pre.childNodes)) {
          line.appendChild(child);
          if (child.nodeName === "BR") {
            lines.push(line);
            line = document.createElement("span");
            line.classList.add("line");
          }
        }
        lines.push(line);
        pre.replaceChildren(...lines);
      }
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
</style>
