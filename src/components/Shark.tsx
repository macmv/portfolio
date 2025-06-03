import { useEffect, useRef, useState } from "preact/hooks";
import "./Shark.css";

type Shark = {
  x: number;
  offset: number;
};

export const Shark = () => {
  const [sharks, setSharks] = useState<Shark[]>([]);

  const animation = useRef<number | null>(null);
  const speed = 3.0; // pixels per frame

  const frame = () => {
    setSharks((s) => {
      return s
        .map((s) => ({ ...s, x: s.x + speed }))
        .filter((s) => s.x < window.innerWidth + 100);
    });

    if (sharks.length > 0) {
      animation.current = requestAnimationFrame(frame);
    }
  };

  useEffect(() => {
    if (animation.current === null) {
      animation.current = requestAnimationFrame(frame);
    }

    return () => {
      if (animation.current !== null) {
        cancelAnimationFrame(animation.current);
        animation.current = null;
      }
    };
  }, [sharks.length]);

  return (
    <>
      <span
        class="shark-button"
        onClick={() => {
          setSharks((s) => [{ x: 0, offset: Math.random() }, ...s]);
        }}
      >
        Shark!
      </span>
      {sharks.map((s) => {
        const t = s.x / 100 + s.offset * 2 * Math.PI;
        const angle = -Math.cos(t) / 2;
        const height = Math.sin(t) * 80;

        return (
          <span
            class="shark"
            style={{
              marginLeft: s.x,
              bottom: height,
            }}
          >
            <img
              src="/assets/tigershark.gif"
              alt="Shark"
              width="150"
              style={{ transform: `rotate(${angle}rad)` }}
            />
          </span>
        );
      })}
    </>
  );
};
