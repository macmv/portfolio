import "./Banner.css";
import init, { setup_render, resize } from "../../render/pkg";
import { useRef } from "preact/hooks";
import { RefObject } from "preact";

export const Banner = (props: { title: () => string }) => {
  const canvas = useRef<HTMLCanvasElement>(null);

  setupCanvas(canvas);

  window.onresize = () => {
    const rect = canvas.current!.parentElement!.getBoundingClientRect();
    resize(rect.width, rect.height);
  };

  return (
    <div class="banner">
      <canvas ref={canvas} style="position: fixed; z-index: -1" />
      <h1>{props.title()}</h1>
    </div>
  );
};

const setupCanvas = async (canvas: RefObject<HTMLCanvasElement>) => {
  await init();

  if (canvas.current) {
    await setup_render(canvas.current);
    const rect = canvas.current!.parentElement!.getBoundingClientRect();
    resize(rect.width, rect.height);
  } else {
    await setupCanvas(canvas);
  }
};
