import { useEffect, useState } from "preact/hooks";
import init, { parse } from "../../render/pkg";

import "./ParseTree.css";

type Tree = Array<Node>;
type Node =
  | { type: "binary"; left: number; right: number; operator: string }
  | { type: "literal"; value: string };

export const ParseTree = (props: { code: string }) => {
  const [tree, setTree] = useState<Tree | string | null>(null);

  useEffect(() => {
    init().then(() => {
      setTree(parse(props.code));
    });
  }, [props.code]);

  if (tree === null) {
    return <></>;
  } else if (typeof tree === "string") {
    return <div class="parse-error">{tree}</div>;
  } else {
    const renderNode = (idx: number) => {
      const node = tree[idx];

      if (node.type === "binary") {
        const left = renderNode(node.left);
        const right = renderNode(node.right);

        return (
          <span class="binary">
            <span class="child">{left}</span>
            <span class="node">{node.operator}</span>
            <span class="child">{right}</span>
          </span>
        );
      } else if (node.type === "literal") {
        return <span class="node">{node.value}</span>;
      } else {
        return <></>;
      }
    };

    return <div class="parse-tree">{renderNode(tree.length - 1)}</div>;
  }
};
