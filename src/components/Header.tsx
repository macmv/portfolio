import "./Header.css";
import { Link } from "./Link";

export const Header = () => {
  return (
    <div class="header-wrapper">
      <Link href="./about">About</Link>
      <Link href="./skills">Skills</Link>
      <Link href="./contact">Contact</Link>
    </div>
  );
};
