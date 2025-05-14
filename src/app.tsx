import { useState } from "preact/hooks";
import { Header } from "./components/Header";
import "./app.css";
import { Link } from "./components/Link";
import { currentPage, Router } from "./router";
import { Banner } from "./components/Banner";

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
        <Banner title={currentTitle} />
        <Content />
      </Router>
    </div>
  );
}

const currentTitle = () => {
  switch (currentPage()) {
    case "/about":
      return "About";
    case "/skills":
      return "Skills";
    case "/contact":
      return "Contact";
    default:
      return "Neil Macneale";
  }
};

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
  const [count, setCount] = useState(0);

  return (
    <div class="content">
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

const About = () => {
  return <div>About Me</div>;
};
const Skills = () => {
  return <div>Many skills</div>;
};
const Contact = () => {
  return <div>Contact me!</div>;
};
