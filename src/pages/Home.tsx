import { Terrain } from "../components/Terrain";
import "./Home.css";

export const Home = () => {
  return (
    <div class="home">
      <Terrain />
      <h1>Neil Macneale</h1>
      <h2>
        <a href="https://github.com/macmv" target="_blank">
          Full Stack Developer
        </a>{" "}
        and Student
      </h2>
    </div>
  );
};
