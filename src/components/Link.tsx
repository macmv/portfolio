import { useContext, useState } from "preact/hooks";
import "./Link.css";
import { ComponentChildren, createContext } from "preact";

const PageContext = createContext<{
  currentPage: string;
  setCurrentPage: (path: string) => void;
}>({ currentPage: window.location.pathname, setCurrentPage: () => {} });

/**
 * Returns the current path.
 */
export const currentPage = (): string => {
  return useContext(PageContext).currentPage;
};

/**
 * Proves the `CurrentPage` context.
 */
export const Router = (props: { children: ComponentChildren }) => {
  const [currentPage, setCurrentPage] = useState(window.location.pathname);

  return (
    <PageContext.Provider value={{ currentPage, setCurrentPage }}>
      {props.children}
    </PageContext.Provider>
  );
};

/**
 * Creates an `a` tag, which won't reload the page when clicked. Instead, it
 * will just update the state of `currentPage()`.
 */
export const Link = (props: { href: string; children: string }) => {
  const { setCurrentPage } = useContext(PageContext);

  return (
    // `link-content` gets an underline on hover, and `link-wrapper` has some
    // padding so the link is easier to click.
    <a
      class="link-wrapper"
      href={props.href}
      onClick={(ev) => {
        window.history.replaceState({}, "", props.href);
        setCurrentPage(window.location.pathname);
        ev.preventDefault();
        ev.stopPropagation();
      }}
    >
      <div class="link-content">{props.children}</div>
    </a>
  );
};
