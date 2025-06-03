import { useState } from "preact/hooks";
import "./Shark.css";

export const Shark = () => {
  const [sharks, setSharks] = useState<number[]>([]);

  return (
    <span
      class="shark-button"
      onClick={() => {
        setSharks((s) => [0, ...s]);
      }}
    >
      Shark!
    </span>
  );
};
