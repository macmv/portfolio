import { useState } from "preact/hooks";
import { Banner } from "../components/Banner";
import { ParseTree } from "../components/ParseTree";

import "./Parsers.css";

export const Parsers = () => {
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
          <CodeInput code={code} setCode={setCode} highlight={highlight} />
          <p style={{ maxWidth: "400px" }}>
            This is a simple{" "}
            <a
              href="https://en.wikipedia.org/wiki/Recursive_descent_parser"
              target="_blank"
            >
              recursive descent parser
            </a>
            , that builds a parse tree for a mathmatical expression. Each
            operation is represented as a node with two children, and each value
            in the expression is a leaf node in the tree.
          </p>
        </div>
        <div style={{ flex: "1" }}>
          <ParseTree code={code} setHighlight={setHighlight} />
        </div>
      </div>
    </>
  );
};

const CodeInput = (props: {
  code: string;
  setCode: (code: string) => void;
  highlight: [number, number] | null;
}) => {
  return (
    <div>
      {props.highlight && (
        <div class="highlight">
          <span
            class="spacer"
            dangerouslySetInnerHTML={{
              __html: "&nbsp;".repeat(props.highlight[0]),
            }}
          />
          <span
            class="underline"
            dangerouslySetInnerHTML={{
              __html: "&nbsp;".repeat(props.highlight[1] - props.highlight[0]),
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
        value={props.code}
        onKeyUp={(e) => props.setCode((e.target as HTMLTextAreaElement).value)}
        onChange={(e) => props.setCode((e.target as HTMLTextAreaElement).value)}
      />
    </div>
  );
};
