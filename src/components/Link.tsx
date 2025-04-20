import "./Link.css";
import { useSetCurrentPage } from "../router";

/**
 * Creates an `a` tag, which won't reload the page when clicked. Instead, it
 * will just update the state of `currentPage()`.
 */
export const Link = (props: { href: string; children: string }) => {
  const setCurrentPage = useSetCurrentPage();

  return (
    // `link-content` gets an underline on hover, and `link-wrapper` has some
    // padding so the link is easier to click.
    <a
      class="link-wrapper"
      href={props.href}
      onClick={(ev) => {
        setCurrentPage(props.href);
        ev.preventDefault();
        ev.stopPropagation();
      }}
    >
      <div class="link-content">{props.children}</div>
    </a>
  );
};
