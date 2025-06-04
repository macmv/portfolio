import "./Terrain.css";
import init, { setup_render, resize } from "../../render/pkg";
import { useEffect, useRef } from "preact/hooks";
import { RefObject } from "preact";

export const Terrain = () => {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setupCanvas(canvas);
  }, [canvas.current]);

  window.onresize = () => {
    performResize(canvas.current!);
  };

  return <canvas ref={canvas} style="position: fixed; z-index: -1" />;
};

const setupCanvas = async (canvas: RefObject<HTMLCanvasElement>) => {
  await init();

  if (canvas.current) {
    await setup_render(canvas.current);
    performResize(canvas.current);
  } else {
    await setupCanvas(canvas);
  }
};

const performResize = (canvas: HTMLCanvasElement) => {
  const rect = canvas.parentElement!.getBoundingClientRect();
  resize(
    rect.width * window.devicePixelRatio,
    rect.height * window.devicePixelRatio,
  );
};
