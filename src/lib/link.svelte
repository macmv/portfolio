<script lang="ts">
  const { href, children } = $props();
</script>

<a class="link-wrapper" {href}>
  <div class="link-content">
    {@render children()}
  </div>
</a>

<style>
  .link-wrapper {
    padding: 10px;

    text-decoration: none !important;
    color: var(--text);
    font-weight: 600;
  }

  .link-content {
    position: relative;
  }

  .link-content::after {
    content: "";
    position: absolute;
    width: 0;
    left: -2px;
    bottom: -2px;

    border: 2px solid var(--blue);
    border-radius: 2px;
    border-left-width: 0px;
    border-right-width: 0px;

    transition:
      border-width 100ms,
      width 100ms;
  }

  .link-wrapper:hover > .link-content::after {
    border-left-width: 2px;
    border-right-width: 2px;
    width: 100%;
  }
</style>
