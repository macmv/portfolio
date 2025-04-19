import { useState } from "preact/hooks";
import { Header } from "./components/Header";
import "./app.css";
import { currentPage, Router } from "./components/Link";

export function App() {
  return (
    <div class="wrapper">
      <Router>
        <Header />
        <Content />
      </Router>
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
        Current page is: {currentPage()}
      </div>
    </div>
  );
};
