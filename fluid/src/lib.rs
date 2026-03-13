use fl_sim::Simulation;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Sim {
  sim: Simulation<128>,
}

#[wasm_bindgen]
pub struct Point {
  pub x: f32,
  pub y: f32,
}

#[wasm_bindgen]
impl Sim {
  #[wasm_bindgen(constructor)]
  pub fn new() -> Self {
    let mut sim = Simulation::new(nalgebra::vector![8.0, 8.0]);

    let mut i = 0;
    for y in 4..4 + 8 {
      for x in 4..4 + 16 {
        sim.set_particle(i, nalgebra::point![x as f32 / 4.0, y as f32 / 4.0]);
        i += 1;
      }
    }

    Sim { sim }
  }

  pub fn apply_repulsion(&mut self, x: f32, y: f32, radius: f32, force: f32) {
    self.sim.apply_repulsion(nalgebra::point![x, y], radius, force);
  }

  pub fn tick(&mut self) { self.sim.tick(); }

  pub fn points(&self) -> Vec<Point> {
    self.sim.particles().map(|p| Point { x: p.position.x, y: p.position.y }).collect()
  }
}
