use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
  fn alert(s: &str);

  #[wasm_bindgen(js_namespace = console)]
  fn log(s: &str);
}

#[wasm_bindgen]
pub async fn setup_render(canvas: &wgpu::web_sys::HtmlCanvasElement) {
  std::panic::set_hook(Box::new(console_error_panic_hook::hook));
  let _ = console_log::init_with_level(log::Level::Trace);

  setup_instance(canvas).await;

  alert(&format!("Hello, world!"));
}

async fn setup_instance(canvas: &wgpu::web_sys::HtmlCanvasElement) {
  let instance = wgpu::Instance::new(&wgpu::InstanceDescriptor {
    backends: wgpu::Backends::GL,
    ..Default::default()
  });

  let surface = instance.create_surface(wgpu::SurfaceTarget::Canvas(canvas.clone())).unwrap();

  let adapter = instance
    .request_adapter(&wgpu::RequestAdapterOptions {
      compatible_surface:     Some(&surface),
      power_preference:       wgpu::PowerPreference::default(),
      force_fallback_adapter: false,
    })
    .await
    .unwrap();

  let device = adapter
    .request_device(&wgpu::DeviceDescriptor {
      required_limits: wgpu::Limits::downlevel_webgl2_defaults(),
      ..Default::default()
    })
    .await
    .unwrap();
}
