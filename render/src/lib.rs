use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
  fn alert(s: &str);

  #[wasm_bindgen(js_namespace = console)]
  fn log(s: &str);
}

#[wasm_bindgen]
pub fn setup_render(canvas: &wgpu::web_sys::HtmlCanvasElement) {
  setup_instance(canvas);

  alert(&format!("Hello, world!"));
}

fn setup_instance(canvas: &wgpu::web_sys::HtmlCanvasElement) {
  let instance = wgpu::Instance::new(&wgpu::InstanceDescriptor {
    backends: wgpu::Backends::BROWSER_WEBGPU,
    ..Default::default()
  });

  let _surface = instance.create_surface(wgpu::SurfaceTarget::Canvas(canvas.clone()));

  let _adapter = pollster::block_on(instance.request_adapter(&wgpu::RequestAdapterOptions {
    compatible_surface:     None,
    power_preference:       wgpu::PowerPreference::default(),
    force_fallback_adapter: false,
  }))
  .unwrap();
}
