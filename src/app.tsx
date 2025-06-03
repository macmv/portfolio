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
          <Link href="/parsers">Parsers</Link>
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
    case "/parsers":
      return <Parsers />;
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
  return (
    <>
      <Banner title="Neil Macneale" />
      <div class="content"></div>
    </>
  );
};

const Parsers = () => {
  const [code, setCode] = useState("1 + 2 * 3");
  const [highlight, setHighlight] = useState<[number, number] | null>([0, 1]);

  return (
    <>
      <Banner title="Parsers" />
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
          {highlight && (
            <span
              class="highlight"
              dangerouslySetInnerHTML={{
                __html:
                  "&nbsp;".repeat(highlight[0]) +
                  "_".repeat(highlight[1] - highlight[0]),
              }}
            />
          )}
          <input
            type="text"
            class="code-input"
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
            data-lt-active="false"
            value={code}
            onKeyUp={(e) => setCode((e.target as HTMLTextAreaElement).value)}
            onChange={(e) => setCode((e.target as HTMLTextAreaElement).value)}
          />
          <p style={{ maxWidth: "400px" }}>
            This is a simple recursive descent parser, that builds a parse tree
            for a mathmatical expression. Each operation is represented as a
            node with two children, and each value in the expression is a leaf
            node in the tree.
          </p>
        </div>
        <div style={{ flex: "1" }}>
          <ParseTree code={code} setHighlight={setHighlight} />
        </div>
      </div>
    </>
  );
};

const About = () => {
  return (
    <>
      <Banner title="About" />
      <div>About Me</div>
    </>
  );
};
const Skills = () => {
  return (
    <>
      <Banner title="Skills" />
      <div>Many skills</div>
    </>
  );
};
const Contact = () => {
  return (
    <>
      <Banner title="Skills" />
      <div>Contact me!</div>
    </>
  );
};
