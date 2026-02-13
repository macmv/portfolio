<script lang="ts">
  import tigershark from "$lib/assets/tigershark.png";
</script>

<div
  class="mx-auto mt-[150px] max-w-[1600px] grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-0"
>
  <span class="section">
    <span class="block max-w-[400px]">
      This shark is modeled after a tigershark that briefly stayed in the
      <a href="https://mauioceancenter.com/">Maui Ocean Center</a>.
    </span>
  </span>
  <span class="section mx-[50px] lg:ml-0 lg:mr-[100px]">
    <img src={tigershark} alt="Tiger Shark" width="800" class="rounded-xl" />
  </span>
</div>

<style>
  .section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
