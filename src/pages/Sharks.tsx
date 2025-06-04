import { Banner } from "../components/Banner";
import "./Sharks.css";
import tigershark from "../../assets/tigershark.png";

export const Sharks = () => {
  return (
    <>
      <Banner title="Sharks!" />
      <div class="shark-container">
        <span class="section">
          <span class="text-column">
            This shark is modeled after a tigershark that briefly stayed in the{" "}
            <a href="https://mauioceancenter.com/">Maui Ocean Center</a>. Her
            name is Kanaio. I used Blender to model and animate her.
          </span>
        </span>
        <span class="section">
          <img src={tigershark} alt="Tiger Shark" width="800" />
        </span>
      </div>
    </>
  );
};
