<script lang="ts">
  import { page } from "$app/state";
  import Link from "$lib/link.svelte";
  import "../app.css";

  const { children } = $props();
</script>

<div style="width: 100%">
  <div class={"header" + (page.url.pathname == "/" ? " header-fixed" : "")}>
    <Link href="/">Home</Link>
    <Link href="/parsers">Parsers</Link>
    <Link href="/blog/foo">Blog</Link>
    <Link href="/sharks">Sharks!</Link>
  </div>
  {@render children()}
</div>

<style>
  .header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 20px;
    padding: 10px 20px;
  }

  .header-fixed {
    position: fixed;
  }

  :global(a) {
    color: var(--light-blue);
    text-decoration: none;
  }

  :global(a:hover) {
    text-decoration: underline;
    text-decoration-thickness: 2px;
  }
</style>
