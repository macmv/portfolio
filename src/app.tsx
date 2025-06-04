import { Header } from "./components/Header";
import "./app.css";
import { Link } from "./components/Link";
import { currentPage, Router } from "./router";
import * as pages from "./pages";
import { Shark } from "./components/Shark";

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
        <Shark />
      </Router>
    </div>
  );
}

const Content = () => {
  switch (currentPage()) {
    case "/parsers":
      return <pages.Parsers />;
    case "/about":
      return <pages.About />;
    case "/sharks":
      return <pages.Sharks />;
    case "/contact":
      return <pages.Contact />;
    default:
      return <pages.Home />;
  }
};
