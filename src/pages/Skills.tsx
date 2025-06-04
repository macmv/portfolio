import { Banner } from "../components/Banner";
import "./Skills.css";

export const Skills = () => {
  return (
    <>
      <Banner title="Skills" />

      <div class="skills-outer">
        <div class="skills-wrapper">
          <span class="skills-intro">
            I'm experienced with a number of developer tools and programming
            languages. To summarize, here's a list:
          </span>

          <table class="skills">
            <tr>
              <td class="category">Languages</td>
              <td>
                Rust, C/C++, Java/Scala, Python, Go, Ruby, Bash,
                Typescript/Javascript
              </td>
            </tr>
            <tr>
              <td class="category">Tooling</td>
              <td>
                gRPC/Protobuf, Datadog, React, Vite, PagerDuty, Firestore,
                Fauna, Snowflake
              </td>
            </tr>
            <tr>
              <td class="category">Infrastructure</td>
              <td>AWS, GCloud</td>
            </tr>
            <tr>
              <td class="category">Dev Tooling</td>
              <td>
                Git, IntelliJ, VsCode, Jira, Concourse CI, Circle CI,
                GitHub/GitHub Actions
              </td>
            </tr>
            <tr>
              <td class="category">Vim or Emacs?</td>
              <td>Vim, for life.</td>
            </tr>
          </table>
        </div>
      </div>
    </>
  );
};
