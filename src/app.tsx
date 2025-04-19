import { useState } from "preact/hooks";
import { Header } from "./components/Header";
import "./app.css";
import { currentPage, Link, Router } from "./components/Link";

export function App() {
  return (
    <div class="wrapper">
      <Router>
        <Header>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/skills">Skills</Link>
          <Link href="/contact">Contact</Link>
        </Header>
        <Content />
      </Router>
    </div>
  );
}

const Content = () => {
  switch (currentPage()) {
    case "/about":
      return <About />;
    case "/skills":
      return <Skills />;
    case "/contact":
      return <Contact />;
    default:
      return <Home />;
  }
};

const Home = () => {
  return <div>Home</div>;
};

const About = () => {
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

const Skills = () => {
  return <div>Many skills</div>;
};
const Contact = () => {
  return <div>Contact me!</div>;
};
