<script lang="ts">
  import Link from "$lib/link.svelte";
  import "../app.css";

  const { children } = $props();
</script>

<main>
  <div class="flex flex-row gap-4 justify-center">
    <Link href="/">Home</Link>
    <Link href="/parsers">Parsers</Link>
    <Link href="/skills">Skills</Link>
    <Link href="/sharks">Sharks!</Link>
    <Link href="/contact">Contact</Link>
  </div>
  {@render children()}
</main>
