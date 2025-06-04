import { Banner } from "../components/Banner";
import { Physics } from "../components/Physics";
import "./Contact.css";

export const Contact = () => {
  return (
    <>
      <Banner title="Contact" />

      <div class="contact-outer">
        <div class="contact-wrapper">
          <div>Contact me!</div>

          <span class="intro">And, for fun:</span>

          <Physics />
        </div>
      </div>
    </>
  );
};
