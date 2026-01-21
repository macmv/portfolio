export type Tree = Array<Node>;
export type Node = BinaryNode | LiteralNode;

export type BinaryNode = {
  start: number;
  end: number;
  type: "binary";
  left: number;
  right: number;
  operator: string;
};

export type LiteralNode = {
  start: number;
  end: number;
  type: "literal";
  value: string;
};

const width = 50;
const height = 50;
const gap = 30;

const createLine = (x: number, y: number, angle: number, length: number) => {
  const elem = document.createElement("span");

  elem.classList.add("line");

  elem.style.marginLeft = `${x}px`;
  elem.style.marginTop = `${y}px`;
  elem.style.transform = `rotate(${angle}rad)`;
  elem.style.height = `${length}px`;

  return elem;
};

const createLiteralNode = (text: string) => {
  const elem = document.createElement("span");

  elem.classList.add("node");

  elem.innerText = text;

  return elem;
};

export const renderTree = (
  tree: Tree,
  root: Element,
  onHover: (highlight: [number, number] | null) => void,
) => {
  let nodes = [];

  const renderNode = (idx: number) => {
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

      const elem = document.createElement("span");
      elem.classList.add("binary");

      left.element.classList.add("child");
      elem.appendChild(left.element);
      elem.appendChild(createLine(x, height / 2, angle, length));
      const op = createLiteralNode(node.operator);
      op.classList.add("operator");
      op.style.marginLeft = `${offset}px`;
      op.style.marginRight = `${-offset}px`;
      op.onmouseover = () => onHover([node.start, node.end]);
      op.onmouseout = () => onHover(null);
      nodes.push({ element: op, range: [node.start, node.end] });
      elem.appendChild(op);
      elem.appendChild(createLine(x, height / 2, -angle, length));
      right.element.classList.add("child");
      elem.appendChild(right.element);

      return {
        element: elem,
        x,
        width: left.width + right.width + width,
      };
    } else if (node.type === "literal") {
      const elem = createLiteralNode(node.value);
      elem.onmouseover = () => onHover([node.start, node.end]);
      elem.onmouseout = () => onHover(null);
      const n = {
        element: elem,
        range: [node.start, node.end],
        x: width / 2,
        width: width,
      };
      nodes.push(n);
      return n;
    } else {
      return { element: null, x: 0, width: 0 };
    }
  };

  root.replaceChildren(renderNode(tree.length - 1).element);

  return nodes;
};
