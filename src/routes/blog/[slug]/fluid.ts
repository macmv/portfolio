import * as d3 from "d3";
import {
  createElement as createLucide,
  Check,
  Pause,
  RotateCw,
  Play,
  RotateCcw,
  StepForward,
} from "lucide";
import init, {
  Sim,
  Point,
  kernel_poly6,
  kernel_spiky_gradient,
} from "../../../../fluid/pkg";
import { mount } from "svelte";

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
  naive_lambda: boolean;
  no_tensile: boolean;
};

export class Simulation {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  paused: boolean;
  running: boolean;
  clicked: boolean;
  pointer_x: number;
  pointer_y: number;
  sim: Sim;
  features: Features;

  constructor(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    features: Features,
  ) {
    this.svg = svg;
    this.paused = false;
    this.running = true;
    this.clicked = false;
    this.pointer_x = 0;
    this.pointer_y = 0;
    this.features = features;
    this.sim = new Sim(
      this.features.descent,
      this.features.naive_lambda,
      this.features.no_tensile,
    );
    this.renderLoop();
  }

  renderLoop = () => {
    this.renderChart();

    const frame = () => {
      if (this.clicked) {
        this.sim.apply_repulsion(this.pointer_x, this.pointer_y, 1.5, 3000);
      }
      if (!this.paused) {
        this.sim.tick();
      }
      this.renderChart();

      if (this.running) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);
  };

  stop = () => {
    this.running = false;
  };

  renderChart = () => {
    this.svg
      .selectAll("circle")
      .data(this.sim.points().map((p, i) => ({ id: i, x: p.x, y: p.y })))
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
  if (parent == null) {
    return;
  }

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

  let controls = document.createElement("div");
  controls.className = "controls";

  const restart = document.createElement("a");
  restart.className = "button";
  restart.appendChild(createLucide(RotateCcw));
  restart.onclick = () => {
    sim.sim.restart();
  };
  controls.appendChild(restart);

  const step = document.createElement("a");
  step.className = "button";
  step.appendChild(createLucide(StepForward));
  step.onclick = () => {
    if (!sim.paused) {
      sim.paused = true;
    }
    sim.sim.tick();
  };
  controls.appendChild(step);

  const pause = document.createElement("a");
  pause.className = "button";
  let pauseIcon = createLucide(Pause);
  let playIcon = createLucide(Play);
  pause.appendChild(pauseIcon);
  pause.onclick = () => {
    sim.paused = !sim.paused;
    if (sim.paused) {
      pause.removeChild(pauseIcon);
      pause.appendChild(playIcon);
    } else {
      pause.removeChild(playIcon);
      pause.appendChild(pauseIcon);
    }
  };
  controls.appendChild(pause);

  parent.appendChild(controls);
  parent.appendChild(svg.node());
  return sim;
};

export const draw2dGraph = (
  parent: HTMLElement,
  x_bounds: [number, number],
  x_title: string,
  y_bounds: [number, number],
  y_title: string,
  func: (x: number) => number,
) => {
  const width = 500;
  const height = 400;
  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 40;
  const marginLeft = 50;

  const svg = d3.create("svg").attr("width", width).attr("height", height);
  const sampleCount = 200;
  const points = Array.from({ length: sampleCount + 1 }, (_, i) => {
    const x = (i / sampleCount) * (x_bounds[1] - x_bounds[0]) + x_bounds[0];
    return [x, func(x)] as const;
  });

  const x = d3
    .scaleLinear()
    .domain(x_bounds)
    .range([marginLeft, width - marginRight]);

  const y = d3
    .scaleLinear()
    .domain(y_bounds)
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
    .text(x_title);

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(marginTop + (height - marginBottom)) / 2)
    .attr("y", 14)
    .attr("text-anchor", "middle")
    .attr("fill", "#444")
    .text(y_title);

  parent.appendChild(svg.node());
};

export const drawGradientGraph = (parent: HTMLElement) => {
  const width = 400;
  const height = 400;
  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 40;
  const marginLeft = 50;

  const svg = d3.create("svg").attr("width", width).attr("height", height);
  const sampleCount = 20;
  const divisor = 120;
  const points = Array.from({ length: sampleCount + 1 }, (_, ix) =>
    Array.from({ length: sampleCount + 1 }, (_, iy) => {
      const px = (ix / sampleCount) * 2 - 1;
      const py = (iy / sampleCount) * 2 - 1;
      const grad = kernel_spiky_gradient(px, py, 1.0);
      const mag = Math.hypot(grad.x, grad.y);
      if (mag === 0) return [px, py, 0, 0] as const;
      return [
        px,
        py,
        (grad.x / mag) * 0.03 + grad.x / divisor,
        (grad.y / mag) * 0.03 + grad.y / divisor,
      ] as const;
    }),
  ).flat();

  const x = d3
    .scaleLinear()
    .domain([-1, 1])
    .range([marginLeft, width - marginRight]);

  const y = d3
    .scaleLinear()
    .domain([-1, 1])
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
    .data(y.ticks(10))
    .join("line")
    .attr("class", "grid-y")
    .attr("x1", marginLeft)
    .attr("x2", width - marginRight)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d));

  svg
    .append("defs")
    .append("marker")
    .attr("id", "gradient-arrowhead")
    .attr("viewBox", "0 -3 6 6")
    .attr("refX", 5)
    .attr("refY", 0)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-3L6,0L0,3")
    .attr("fill", "#918ccd");

  svg
    .append("g")
    .attr("stroke", "#918ccd")
    .attr("stroke-width", 1.2)
    .selectAll("line")
    .data(points.filter((d) => d[2] !== 0 || d[3] !== 0))
    .join("line")
    .attr("x1", (d) => x(d[0]))
    .attr("y1", (d) => y(d[1]))
    .attr("x2", (d) => x(d[0] + d[2]))
    .attr("y2", (d) => y(d[1] + d[3]))
    .attr("marker-end", "url(#gradient-arrowhead)");

  svg
    .append("g")
    .attr("fill", "#918ccd")
    .selectAll("circle")
    .data(points.filter((d) => d[2] === 0 && d[3] === 0))
    .join("circle")
    .attr("cx", (d) => x(d[0]))
    .attr("cy", (d) => y(d[1]))
    .attr("r", 2);

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
    .text("X");

  svg
    .append("text")
    .attr("x", 14)
    .attr("y", (marginTop + (height - marginBottom)) / 2)
    .attr("text-anchor", "middle")
    .attr("fill", "#444")
    .text("Y");

  parent.appendChild(svg.node());
};
