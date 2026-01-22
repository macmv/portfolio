<script lang="ts">
  const { children } = $props();
</script>

<h1>{@render children()}</h1>

<style>
  h1 {
    padding-top: 50px;
    height: 300px;
    background: #0000;
    font-weight: bold;

    display: flex;
    align-items: center;
    justify-content: center;

    color: var(--text);
    font-size: 64px;
  }
</style>
