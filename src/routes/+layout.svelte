<script lang="ts">
  import Link from "$lib/link.svelte";
  import "../app.css";

  const { children } = $props();
</script>

<div style="width: 100%">
  <div class="header">
    <Link href="/">Home</Link>
    <Link href="/parsers">Parsers</Link>
    <Link href="/skills">Skills</Link>
    <Link href="/sharks">Sharks!</Link>
  </div>
  {@render children()}
</div>

<style>
  .header {
    position: fixed;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 20px;
    padding: 10px 20px;
  }
</style>
