import { useState } from "preact/hooks";
import { Header } from "./components/Header";
import "./app.css";
import { Link } from "./components/Link";
import { currentPage, Router } from "./router";
import { Banner } from "./components/Banner";
import { ParseTree } from "./components/ParseTree";
import { Terrain } from "./components/Terrain";

export function App() {
  return (
    <div class="wrapper">
      <Router>
        <Header>
          <Link href="/">Home</Link>
          <Link href="/parsers">Parsers</Link>
          <Link href="/about">About</Link>
          <Link href="/sharks">Sharks!</Link>
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
    case "/sharks":
      return <Sharks />;
    case "/contact":
      return <Contact />;
    default:
      return <Home />;
  }
};

const Home = () => {
  return <Terrain title="Neil Macneale" />;
};

const Parsers = () => {
  const [code, setCode] = useState("1 + 2 * 3 + 4");
  const [highlight, setHighlight] = useState<[number, number] | null>(null);

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
          <div>
            {highlight && (
              <div class="highlight">
                <span
                  class="spacer"
                  dangerouslySetInnerHTML={{
                    __html: "&nbsp;".repeat(highlight[0]),
                  }}
                />
                <span
                  class="underline"
                  dangerouslySetInnerHTML={{
                    __html: "&nbsp;".repeat(highlight[1] - highlight[0]),
                  }}
                />
              </div>
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
          </div>
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
const Sharks = () => {
  return (
    <>
      <Banner title="Sharks!" />
      <div>there are many</div>
    </>
  );
};
const Contact = () => {
  return (
    <>
      <Banner title="Contact" />
      <div>Contact me!</div>
    </>
  );
};
