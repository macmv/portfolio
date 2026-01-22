<script lang="ts">
  import { onMount } from "svelte";
  import init, { setup_render, resize } from "../../render/pkg";

  let canvas: HTMLCanvasElement;

  const setupCanvas = async () => {
    await init();

    if (canvas) {
      await setup_render(canvas);
      performResize();
    }
  };

  const performResize = () => {
    const rect = canvas.parentElement!.getBoundingClientRect();
    resize(
      rect.width * window.devicePixelRatio,
      rect.height * window.devicePixelRatio,
    );
  };

  onMount(() => setupCanvas());
</script>

<svelte:window on:resize={performResize} />

<main class="h-screen grid place-content-center text-center gap-8">
  <canvas bind:this={canvas}></canvas>
  <h1>Neil Macneale</h1>
  <h2>Full Stack Developer and Student</h2>
</main>

<style>
  canvas {
    position: fixed;
    z-index: -1;
    height: 100vh;
  }

  h1,
  h2 {
    background: #0000;
    font-weight: bold;

    color: var(--text);
    text-shadow: 0 10px 20px #fff;
  }

  h2 {
    font-size: min(40px, 3.5vw);
  }

  h1 {
    font-size: min(120px, 10vw);
  }
</style>
