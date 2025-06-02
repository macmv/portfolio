import { useState } from "preact/hooks";
import { Header } from "./components/Header";
import "./app.css";
import { Link } from "./components/Link";
import { currentPage, Router } from "./router";
import { Banner } from "./components/Banner";
import { ParseTree } from "./components/ParseTree";

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
  const [code, setCode] = useState("1 + 2 * 3");

  return (
    <div class="content">
      <div
        style={{
          flex: "1",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h2>Parsers</h2>
        <input
          type="text"
          class="code-input"
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
          data-lt-active="false"
          value={code}
          onKeyUp={(e) => {
            setCode((e.target as HTMLTextAreaElement).value);
          }}
          onChange={(e) => {
            setCode((e.target as HTMLTextAreaElement).value);
          }}
        />
      </div>
      <div style={{ flex: "1" }}>
        <ParseTree code={code} />
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
