import { ComponentChildren } from "preact";
import "./Header.css";

export const Header = (props: { children: ComponentChildren }) => {
  return <div class="header-wrapper">{props.children}</div>;
};
