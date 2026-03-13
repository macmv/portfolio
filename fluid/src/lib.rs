#![allow(static_mut_refs)]

use fl_sim::Simulation;
use wasm_bindgen::prelude::*;

static mut SIMULATION: Option<Simulation<128>> = None;

#[wasm_bindgen]
pub fn setup() {
  let mut simulation = Simulation::new(nalgebra::vector![8.0, 8.0]);

  let mut i = 0;
  for y in 4..4 + 8 {
    for x in 4..4 + 16 {
      simulation.set_particle(i, nalgebra::point![x as f32 / 4.0, y as f32 / 4.0]);
      i += 1;
    }
  }

  unsafe {
    SIMULATION = Some(simulation);
  }
}

#[wasm_bindgen]
pub fn tick(clicked: bool, x: f32, y: f32) {
  if let Some(sim) = unsafe { &mut SIMULATION } {
    if clicked {
      sim.apply_repulsion(nalgebra::point![x, y], 1.5, 3000.0);
    }

    sim.tick();
  }
}

#[wasm_bindgen]
pub struct Point {
  pub x: f32,
  pub y: f32,
}

#[wasm_bindgen]
pub fn points() -> Vec<Point> {
  if let Some(sim) = unsafe { &mut SIMULATION } {
    sim.particles().map(|p| Point { x: p.position.x, y: p.position.y }).collect()
  } else {
    vec![]
  }
}
