import * as d3 from "d3";
import init, { Sim, Point, kernel_poly6 } from "../../../../fluid/pkg";

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

export type Features = {
  descent: boolean;
  tensile: boolean;
};

export class Simulation {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  running: boolean;
  clicked: boolean;
  pointer_x: number;
  pointer_y: number;
  features: Features;

  constructor(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    features: Features,
  ) {
    this.svg = svg;
    this.running = true;
    this.clicked = false;
    this.pointer_x = 0;
    this.pointer_y = 0;
    this.features = features;
    this.renderLoop();
  }

  renderLoop = () => {
    const sim = new Sim(this.features.descent, this.features.tensile);
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

export const buildFluid = (
  parent: HTMLElement,
  { features }: { features: Features },
) => {
  const svg = d3.create("svg").attr("width", width).attr("height", height);

  const sim = new Simulation(svg, features);

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

export const drawPoly6Graph = (parent: HTMLElement) => {
  const width = 500;
  const height = 400;
  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 40;
  const marginLeft = 50;

  const svg = d3.create("svg").attr("width", width).attr("height", height);
  const radius = 1;
  const sampleCount = 200;
  const points = Array.from({ length: sampleCount + 1 }, (_, i) => {
    const distance = (i / sampleCount) * 2 - 1;
    return [distance, kernel_poly6(distance, radius)] as const;
  });

  const x = d3
    .scaleLinear()
    .domain([-radius, radius])
    .range([marginLeft, width - marginRight]);

  const y = d3
    .scaleLinear()
    .domain([0, 1.4])
    .range([height - marginBottom, marginTop]);

  // Draw faint background grid.
  const grid = svg
    .append("g")
    .attr("stroke", "#000")
    .attr("stroke-opacity", 0.08);

  grid
    .selectAll("line.grid-x")
    .data(x.ticks(10))
    .join("line")
    .attr("class", "grid-x")
    .attr("x1", (d) => x(d))
    .attr("x2", (d) => x(d))
    .attr("y1", marginTop)
    .attr("y2", height - marginBottom);

  grid
    .selectAll("line.grid-y")
    .data(y.ticks(8))
    .join("line")
    .attr("class", "grid-y")
    .attr("x1", marginLeft)
    .attr("x2", width - marginRight)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d));

  // Poly6
  svg
    .append("path")
    .attr("d", d3.line()(points.map(([px, py]) => [x(px), y(py)])))
    .attr("stroke", "#918ccd")
    .attr("stroke-width", 2)
    .attr("fill", "none");

  // X-axis.
  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x));

  // Y-axis.
  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y));

  // Axis titles.
  svg
    .append("text")
    .attr("x", (marginLeft + (width - marginRight)) / 2)
    .attr("y", height - 4)
    .attr("text-anchor", "middle")
    .attr("fill", "#444")
    .text("Distance");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(marginTop + (height - marginBottom)) / 2)
    .attr("y", 14)
    .attr("text-anchor", "middle")
    .attr("fill", "#444")
    .text("Wpoly6");

  parent.appendChild(svg.node());
};
