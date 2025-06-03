import { useEffect, useState } from "preact/hooks";
import init, { parse } from "../../render/pkg";

import "./ParseTree.css";

type Tree = Array<Node>;
type Node =
  | {
      start: number;
      end: number;
      type: "binary";
      left: number;
      right: number;
      operator: string;
    }
  | { start: number; end: number; type: "literal"; value: string };

export const ParseTree = (props: {
  code: string;
  setHighlight: (highlight: [number, number] | null) => void;
}) => {
  const [tree, setTree] = useState<Tree | string | null>(null);

  // NB: Keep up to date with CSS
  const width = 50;
  const height = 50;
  const gap = 30;

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
    const renderNode = (
      idx: number,
    ): { element: any; x: number; width: number } => {
      const node = tree[idx];

      if (node.type === "binary") {
        const left = renderNode(node.left);
        const right = renderNode(node.right);

        const leftX = left.x;
        const rightX = left.width + width + right.x;
        const x = (leftX + rightX) / 2;
        const offset = x - left.width - width / 2;

        const angle = Math.PI / 2 - Math.atan2(height + gap, x - leftX);
        const length = Math.sqrt((x - leftX) ** 2 + (height + gap) ** 2);

        return {
          x,
          width: left.width + right.width + width,
          element: (
            <span class="binary">
              <span class="child">{left.element}</span>
              <span
                class="line"
                style={{
                  marginLeft: `${x}px`,
                  marginTop: `${height / 2}px`,
                  transform: `rotate(${angle}rad)`,
                  height: length,
                }}
              />
              <span
                class="node"
                onMouseOver={() => props.setHighlight([node.start, node.end])}
                onMouseOut={() => props.setHighlight(null)}
                style={{ marginLeft: offset, marginRight: -offset }}
              >
                {node.operator}
              </span>
              <span
                class="line"
                style={{
                  marginLeft: `${x}px`,
                  marginTop: `${height / 2}px`,
                  transform: `rotate(-${angle}rad)`,
                  height: length,
                }}
              />
              <span class="child">{right.element}</span>
            </span>
          ),
        };
      } else if (node.type === "literal") {
        return {
          element: <span class="node">{node.value}</span>,
          x: width / 2,
          width: width,
        };
      } else {
        return { element: <></>, x: 0, width: 0 };
      }
    };

    return <div class="parse-tree">{renderNode(tree.length - 1).element}</div>;
  }
};
