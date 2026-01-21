<script>
  import Banner from "$lib/banner.svelte";

  let code = $state("");
</script>

<main>
  <Banner>Parsers</Banner>
  <div class="mx-auto flex w-full max-w-4xl flex-row place-content-center">
    <div class="flex-1 flex flex-col gap-4">
      <input value={code} oninput={(e) => (code = e.target.value)} />
      <p class="max-w-[400px]">
        This is a simple recursive descent parser, that builds a parse tree for
        a mathmatical expression. Each operation is represented as a node with
        two children, and each value in the expression is a leaf node in the
        tree.
      </p>
    </div>
    <div class="flex-1">Tree</div>
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

  .highlight > .underline {
    position: relative;
  }

  .highlight > .underline::after {
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
</style>
