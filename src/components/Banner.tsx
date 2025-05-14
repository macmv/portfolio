import "./Banner.css";

export const Banner = (props: { title: () => string }) => {
  return (
    <div class="banner">
      <h1>{props.title()}</h1>
    </div>
  );
};
