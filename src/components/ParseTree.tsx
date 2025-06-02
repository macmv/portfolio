import { useState } from "preact/hooks";
import init, { parse } from "../../render/pkg";

export const ParseTree = (props: { code: string }) => {
  const [tree, setTree] = useState("");

  init().then(() => {
    setTree(parse(props.code));
  });

  return <p>{tree}</p>;
};
