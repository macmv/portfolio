import * as d3 from "d3";
import init, { Sim, Point } from "../../../../fluid/pkg";

const width = 500;
const height = 400;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 30;
const marginLeft = 40;

const x = d3
  .scaleLinear()
  .domain([0, 8])
  .range([marginLeft, width - marginRight]);

const y = d3
  .scaleLinear()
  .domain([0, 8])
  .range([height - marginBottom, marginTop]);

let initialized = false;

export class Simulation {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  running: boolean;
  clicked: boolean;
  pointer_x: number;
  pointer_y: number;

  constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    this.svg = svg;
    this.running = true;
    this.clicked = false;
    this.pointer_x = 0;
    this.pointer_y = 0;
    this.renderLoop();
  }

  renderLoop = () => {
    const sim = new Sim();
    this.renderChart(sim.points());

    const frame = () => {
      if (this.clicked) {
        sim.apply_repulsion(this.pointer_x, this.pointer_y, 1.5, 3000);
      }
      sim.tick();
      this.renderChart(sim.points());
      if (this.running) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);
  };

  stop = () => {
    this.running = false;
  };

  renderChart = (points: Point[]) => {
    this.svg
      .selectAll("circle")
      .data(points.map((p, i) => ({ id: i, x: p.x, y: p.y })))
      .join("circle")
      .attr("cx", (d) => x(d.x))
      .attr("cy", (d) => y(d.y))
      .attr("r", 4)
      .style("fill", "#918ccd");
  };
}

export const buildFluid = (parent: HTMLElement) => {
  const svg = d3.create("svg").attr("width", width).attr("height", height);

  const sim = new Simulation(svg);

  const drag = d3
    .drag()
    .on("start", (e) => {
      const [px, py] = d3.pointer(e, svg.node());
      sim.clicked = true;
      sim.pointer_x = x.invert(px);
      sim.pointer_y = y.invert(py);
    })
    .on("drag", (e) => {
      const [px, py] = d3.pointer(e, svg.node());
      sim.pointer_x = x.invert(px);
      sim.pointer_y = y.invert(py);
    })
    .on("end", (e) => {
      sim.clicked = false;
    });

  svg
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "transparent")
    .style("pointer-events", "all")
    .call(drag);

  // Add the x-axis.
  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x));

  // Add the y-axis.
  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y));

  parent.appendChild(svg.node());
  return sim;
};
