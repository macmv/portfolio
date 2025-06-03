import { useEffect, useRef, useState } from "preact/hooks";
import "./Shark.css";

export const Shark = () => {
  const [sharks, setSharks] = useState<number[]>([]);

  const animation = useRef<number | null>(null);
  const speed = 3.0; // pixels per frame

  const frame = () => {
    setSharks((s) => {
      return s.map((x) => x + speed).filter((x) => x < window.innerWidth + 100);
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
          setSharks((s) => [0, ...s]);
        }}
      >
        Shark!
      </span>
      {sharks.map((x, idx) => (
        <span class="shark" style={{ marginLeft: x, bottom: 0 }}>
          Shark {idx + 1}
        </span>
      ))}
    </>
  );
};
