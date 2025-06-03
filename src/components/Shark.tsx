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
  }, [sharks.length, animation.current]);

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
      {sharks.map((s, idx) => (
        <span
          class="shark"
          style={{
            marginLeft: s.x,
            bottom: Math.sin(s.x / 80 + s.offset * 2 * Math.PI) * 50,
          }}
        >
          Shark {idx + 1}
        </span>
      ))}
    </>
  );
};
