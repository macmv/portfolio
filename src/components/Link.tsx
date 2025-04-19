import "./Link.css";

export const Link = (props: { href: string; children: string }) => {
  // `link-content` gets an underline on hover, and `link-wrapper` has some
  // padding so the link is easier to click.
  return (
    <a
      class="link-wrapper"
      href={props.href}
      onClick={(ev) => {
        window.history.replaceState({}, "", props.href);
        ev.preventDefault();
        ev.stopPropagation();
      }}
    >
      <div class="link-content">{props.children}</div>
    </a>
  );
};
