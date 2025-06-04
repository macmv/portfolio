import { Banner } from "../components/Banner";
import { SkillsSimulation } from "../components/SkillsSimulation";

export const Contact = () => {
  return (
    <>
      <Banner title="Contact" />
      <div>Contact me!</div>

      <span class="skills-intro">And, for fun:</span>

      <SkillsSimulation />
    </>
  );
};
