import { useCallback, useEffect, useState } from "preact/hooks";
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
      parentHover: boolean = false,
    ): { element: any; x: number; width: number } => {
      const node = tree[idx];
      const [localHover, setHover] = useState(false);
      const hover = parentHover || localHover;

      const onHover = useCallback(
        (hover: boolean) => {
          if (hover) {
            setHover(true);
            props.setHighlight([node.start, node.end]);
          } else {
            setHover(false);
            props.setHighlight(null);
          }
        },
        [node],
      );

      if (node.type === "binary") {
        const left = renderNode(node.left, hover);
        const right = renderNode(node.right, hover);

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
                  backgroundColor: hover ? "#0a3" : "#888",
                }}
              />
              <Node hover={hover} onHover={onHover} margin={offset}>
                {node.operator}
              </Node>
              <span
                class="line"
                style={{
                  marginLeft: `${x}px`,
                  marginTop: `${height / 2}px`,
                  transform: `rotate(-${angle}rad)`,
                  height: length,
                  backgroundColor: hover ? "#0a3" : "#888",
                }}
              />
              <span class="child">{right.element}</span>
            </span>
          ),
        };
      } else if (node.type === "literal") {
        return {
          element: (
            <Node hover={hover} onHover={onHover}>
              {node.value}
            </Node>
          ),
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

const Node = (props: {
  hover: boolean;
  onHover: (h: boolean) => void;
  children: string;
  margin?: number;
}) => {
  return (
    <span
      class="node"
      onMouseOver={() => props.onHover(true)}
      onMouseOut={() => props.onHover(false)}
      style={{
        borderColor: props.hover ? "#0a3" : "#888",
        ...(props.margin
          ? { marginLeft: props.margin, marginRight: -props.margin }
          : {}),
      }}
    >
      {props.children}
    </span>
  );
};
