<script lang="ts">
  import tigershark from "$lib/assets/tigershark.png";
</script>

<div class="hero">
  <img src={tigershark} alt="Tiger Shark" class="shark" />
  <h1>Sharks!</h1>
</div>

<style>
  .hero {
    position: fixed;
    inset: 0;
    display: grid;
    place-content: center;
    text-align: center;
    overflow: hidden;
  }

  .shark {
    position: absolute;
    inset: 0;
    z-index: 0;
    display: block;
    width: 100vw;
    height: 100vh;
    object-fit: cover;
  }

  h1 {
    position: relative;
    z-index: 1;
    background: #0000;
    color: #fff;
    font-size: min(120px, 10vw);
    font-weight: bold;
    text-shadow: 0 12px 24px rgb(0 0 0 / 0.6);
  }
</style>
