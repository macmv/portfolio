use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
  fn alert(s: &str);
}

#[wasm_bindgen]
pub fn setup_render(canvas: &str) { alert(&format!("Hello, {}!", canvas)); }
