use std::{cell::RefCell, rc::Rc};

use bytemuck::{Pod, Zeroable};
use nalgebra::Matrix4;
use wasm_bindgen::prelude::*;
use wgpu::util::DeviceExt;

#[wasm_bindgen]
extern "C" {
  fn alert(s: &str);

  #[wasm_bindgen(js_namespace = console)]
  fn log(s: &str);
}

#[derive(Clone, Copy, Zeroable, Pod)]
#[repr(C)]
struct Vertex {
  pos: [f32; 3],
}

#[wasm_bindgen]
pub async fn setup_render(canvas: &wgpu::web_sys::HtmlCanvasElement) {
  std::panic::set_hook(Box::new(console_error_panic_hook::hook));
  let _ = console_log::init_with_level(log::Level::Trace);

  let state = setup_instance(canvas).await;
  animate(
    move || {
      state.draw();
    },
    120,
  );
}

fn animate(mut draw_frame: impl FnMut() + 'static, max_fps: i32) {
  let animate_cb = Rc::new(RefCell::new(None));

  let timeout_cb = Rc::new(RefCell::new(None));

  {
    let w = web_sys::window().unwrap();
    let animate_cb = animate_cb.clone();
    *timeout_cb.borrow_mut() = Some(Closure::wrap(Box::new(move || {
      request_frame(&w, animate_cb.borrow().as_ref().unwrap());
    }) as Box<dyn FnMut()>));
  }

  {
    let w = web_sys::window().unwrap();
    *animate_cb.borrow_mut() = Some(Closure::wrap(Box::new(move || {
      draw_frame();

      set_timeout(&w, timeout_cb.borrow().as_ref().unwrap(), 1000 / max_fps);
    }) as Box<dyn FnMut()>));
  }

  let w = web_sys::window().unwrap();
  request_frame(&w, animate_cb.borrow().as_ref().unwrap());
}

fn request_frame(w: &web_sys::Window, f: &Closure<dyn FnMut()>) {
  w.request_animation_frame(f.as_ref().unchecked_ref()).unwrap();
}

fn set_timeout(w: &web_sys::Window, f: &Closure<dyn FnMut()>, timeout_ms: i32) -> i32 {
  w.set_timeout_with_callback_and_timeout_and_arguments_0(f.as_ref().unchecked_ref(), timeout_ms)
    .unwrap()
}

struct GpuState {
  surface:          wgpu::Surface<'static>,
  device:           wgpu::Device,
  queue:            wgpu::Queue,
  bind_group:       wgpu::BindGroup,
  swapchain_format: wgpu::TextureFormat,

  render_pipeline: wgpu::RenderPipeline,

  staging_belt: wgpu::util::StagingBelt,
  uniform_buf:  wgpu::Buffer,

  view:        Matrix4<f32>,
  perspective: Matrix4<f32>,
}

async fn setup_instance(canvas: &wgpu::web_sys::HtmlCanvasElement) -> GpuState {
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

  let (device, queue) = adapter
    .request_device(&wgpu::DeviceDescriptor {
      required_limits: wgpu::Limits::downlevel_webgl2_defaults(),
      ..Default::default()
    })
    .await
    .unwrap();

  let shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
    label:  None,
    source: wgpu::ShaderSource::Wgsl(include_str!("shader/world.wgsl").into()),
  });

  let bind_group_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
    label:   None,
    entries: &[wgpu::BindGroupLayoutEntry {
      binding:    0,
      visibility: wgpu::ShaderStages::VERTEX,
      ty:         wgpu::BindingType::Buffer {
        ty:                 wgpu::BufferBindingType::Uniform,
        has_dynamic_offset: false,
        min_binding_size:   wgpu::BufferSize::new(64),
      },
      count:      None,
    }],
  });

  let buffer = Matrix4::<f32>::identity();
  let uniform_buf = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
    label:    None,
    contents: bytemuck::cast_slice(buffer.as_slice()),
    usage:    wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
  });

  let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
    layout:  &bind_group_layout,
    entries: &[wgpu::BindGroupEntry { binding: 0, resource: uniform_buf.as_entire_binding() }],
    label:   None,
  });

  let swapchain_capabilities = surface.get_capabilities(&adapter);
  let swapchain_format = swapchain_capabilities.formats[0];

  let vertex_buffers = [wgpu::VertexBufferLayout {
    array_stride: std::mem::size_of::<Vertex>() as wgpu::BufferAddress,
    step_mode:    wgpu::VertexStepMode::Vertex,
    attributes:   &[
      // pos
      wgpu::VertexAttribute {
        format:          wgpu::VertexFormat::Float32x3,
        offset:          0,
        shader_location: 0,
      },
    ],
  }];

  let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
    label:                None,
    bind_group_layouts:   &[&bind_group_layout],
    push_constant_ranges: &[],
  });
  let render_pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
    label:         Some("main"),
    layout:        Some(&pipeline_layout),
    vertex:        wgpu::VertexState {
      module:              &shader,
      entry_point:         Some("vs_main"),
      buffers:             &vertex_buffers,
      compilation_options: Default::default(),
    },
    fragment:      Some(wgpu::FragmentState {
      module:              &shader,
      entry_point:         Some("fs_main"),
      compilation_options: Default::default(),
      targets:             &[Some(swapchain_format.into())],
    }),
    primitive:     wgpu::PrimitiveState::default(),
    depth_stencil: Some(wgpu::DepthStencilState {
      format:              wgpu::TextureFormat::Depth32Float,
      depth_write_enabled: true,
      depth_compare:       wgpu::CompareFunction::Less,
      stencil:             wgpu::StencilState::default(),
      bias:                wgpu::DepthBiasState::default(),
    }),
    multisample:   wgpu::MultisampleState::default(),
    multiview:     None,
    cache:         None,
  });

  GpuState {
    surface,
    device,
    queue,
    bind_group,
    swapchain_format,

    render_pipeline,

    staging_belt: wgpu::util::StagingBelt::new(64),
    uniform_buf,

    view: Matrix4::identity(),
    perspective: Matrix4::new_perspective(1920.0 / 1080.0, 70.0, 0.1, 10000.0),
  }
}

impl GpuState {
  fn draw(&self) {}
}
