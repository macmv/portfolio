import { Banner } from "../components/Banner";
import { Physics } from "../components/Physics";
import "./Contact.css";

export const Contact = () => {
  return (
    <>
      <Banner title="Contact" />

      <div class="contact-outer">
        <div class="contact-wrapper">
          <span>
            I'm reachable by email at:{" "}
            <a href="mailto:neil.macneale.v@gmail.com" target="_blank">
              neil.macneale.v@gmail.com
            </a>
            .
            <br />
            My Github is:{" "}
            <a href="https://github.com/macmv" target="_blank">
              https://github.com/macmv
            </a>
            .
            <br />
            And my LinkedIn is:{" "}
            <a href="https://www.linkedin.com/in/neilmacnealev" target="_blank">
              https://www.linkedin.com/in/neilmacnealev
            </a>
            .
          </span>

          <span class="intro">And, for fun:</span>

          <Physics />
        </div>
      </div>
    </>
  );
};
