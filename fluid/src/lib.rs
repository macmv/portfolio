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
pub fn kernel_poly6(distance: f32, radius: f32) -> f32 { fl_sim::kernel_poly6(distance, radius) }
#[wasm_bindgen]
pub fn kernel_spiky_gradient(dx: f32, dy: f32, radius: f32) -> Point {
  let p = fl_sim::kernel_spiky_gradient(nalgebra::vector![dx, dy], radius);
  Point { x: p.x, y: p.y }
}
#[wasm_bindgen]
pub fn tensile_correction(distance: f32, radius: f32) -> f32 {
  fl_sim::tensile_correction(distance, radius)
}

#[wasm_bindgen]
impl Sim {
  #[wasm_bindgen(constructor)]
  pub fn new(descent: bool, naive_lambda: bool, no_tensile: bool) -> Self {
    let mut sim = Simulation::new(nalgebra::vector![8.0, 8.0]);
    sim.feature_descent = descent;
    sim.feature_naive_lambda = naive_lambda;
    sim.feature_no_tensile = no_tensile;

    let mut sim = Sim { sim };
    sim.restart();
    sim
  }

  pub fn restart(&mut self) {
    let mut i = 0;
    for y in 4..4 + 8 {
      for x in 4..4 + 16 {
        self.sim.set_particle(i, nalgebra::point![x as f32 / 4.0, y as f32 / 4.0]);
        i += 1;
      }
    }
  }

  pub fn apply_repulsion(&mut self, x: f32, y: f32, radius: f32, force: f32) {
    self.sim.apply_repulsion(nalgebra::point![x, y], radius, force);
  }

  pub fn tick(&mut self) { self.sim.tick(); }

  pub fn points(&self) -> Vec<Point> {
    self.sim.particles().map(|p| Point { x: p.position.x, y: p.position.y }).collect()
  }
}
