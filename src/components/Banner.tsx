import "./Banner.css";
import init, { setup_render, resize } from "../../render/pkg";
import { useRef } from "preact/hooks";
import { RefObject } from "preact";

export const Banner = (props: { title: () => string }) => {
  const canvas = useRef<HTMLCanvasElement>(null);

  setupCanvas(canvas);

  return (
    <div class="banner">
      <canvas ref={canvas} style="position: fixed; z-index: -1" />
      <h1>{props.title()}</h1>
    </div>
  );
};

const setupCanvas = (canvas: RefObject<HTMLCanvasElement>) => {
  init().then(() => {
    if (canvas.current) {
      setup_render(canvas.current).then(() => {
        const rect = canvas.current!.parentElement!.getBoundingClientRect();
        resize(rect.width, rect.height);
      });
    } else {
      setupCanvas(canvas);
    }
  });
};
