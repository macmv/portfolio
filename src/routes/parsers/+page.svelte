<script lang="ts">
  import Banner from "$lib/banner.svelte";
  import init, { parse } from "../../../render/pkg";
  import { type Tree, renderTree } from "./tree";

  let code = $state("1 + 2 * 3 + 4");
  let highlight = $state([2, 4]);
  let tree = $state<Tree | null>(null);
  let tree_element: Element;

  $effect(() => {
    init().then(() => {
      tree = parse(code);
      renderTree(tree, tree_element);
    });
  });
</script>

<main>
  <Banner>Parsers</Banner>
  <div class="mx-auto flex w-full max-w-4xl flex-row place-content-center">
    <div class="flex-1 flex flex-col gap-4">
      {#if highlight}
        <div class="highlight">
          <span class="highlight-spacer">
            {"\u00a0".repeat(highlight[0])}
          </span>
          <span class="highlight-underline">
            {"\u00a0".repeat(highlight[1] - highlight[0])}
          </span>
        </div>
      {/if}
      <input
        value={code}
        oninput={(e) => (code = (e.target as HTMLInputElement).value)}
      />
      <p class="max-w-[400px]">
        This is a simple recursive descent parser, that builds a parse tree for
        a mathmatical expression. Each operation is represented as a node with
        two children, and each value in the expression is a leaf node in the
        tree.
      </p>
    </div>
    <div class="flex-1 parse-tree" bind:this={tree_element}></div>
  </div>
</main>

<style>
  input {
    font-family: "Martian Mono", monospace;
    font-size: 32px;
    width: 400px;

    padding: 4px 8px;
    border: 3px solid var(--light-gray);
    border-radius: 10px;

    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  input:focus {
    outline: none;
    border-color: var(--blue);
  }

  .highlight {
    color: var(--green);
    position: absolute;
    width: 400px;
    padding: 5px 11px;
    margin-top: -2px;

    display: flex;
    pointer-events: none;
  }

  .highlight > span {
    font-family: "Martian Mono", monospace;
    font-size: 32px;
  }

  .highlight-underline {
    position: relative;
  }

  .highlight-underline::after {
    box-sizing: border-box;
    content: "";
    position: absolute;
    width: 100%;
    border: 2px solid var(--green);
    background-color: var(--green);
    border-radius: 5px;
    bottom: -5px;
    left: 0px;

    animation: slide-in 200ms 1;
  }

  @keyframes slide-in {
    0% {
      width: 0;
    }
    100% {
      width: 100%;
    }
  }

  .parse-tree {
    display: flex;
    justify-content: center;
  }

  :global(.parse-tree .node) {
    display: inline-block;
    width: 50px;
    height: 50px;

    padding: 5px;
    text-align: center;

    border: 3px solid var(--light-gray);
    border-radius: 25px;
    background-color: #fff;

    cursor: pointer;

    font-family: "Martian Mono", monospace;
    font-size: 24px;

    transition: all 100ms;
  }

  :global(.parse-tree .node.hover) {
    border-color: var(--green);

    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }

  :global(.parse-tree .binary) {
    display: flex;
    flex-direction: row;
  }

  :global(.parse-tree .child) {
    margin-top: 80px;
  }

  :global(.parse-tree .line) {
    position: absolute;
    width: 3px;
    z-index: -1;
    background-color: var(--light-gray);

    transform-origin: top;

    transition: all 100ms;
  }

  :global(.parse-tree .line.hover) {
    background-color: var(--green);

    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  }
</style>
