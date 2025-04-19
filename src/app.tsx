import { useState } from "preact/hooks";
import { Header } from "./components/Header";
import "./app.css";

export function App() {
  return (
    <div class="wrapper">
      <Header />
      <Content />
    </div>
  );
}

const Content = () => {
  const [count, setCount] = useState(0);

  return (
    <div class="content">
      <h1>Neil Macneale</h1>
      <div>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/app.tsx</code> and save to test HMR
        </p>
      </div>
    </div>
  );
};
