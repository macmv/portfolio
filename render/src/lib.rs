#![allow(static_mut_refs)]

use std::{cell::RefCell, rc::Rc};

use bytemuck::{Pod, Zeroable};
use nalgebra::{Matrix4, Point3, Vector2, Vector3, vector};
use noise::{BasicMulti, NoiseFn, OpenSimplex};
use rand::{Rng, SeedableRng};
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
  pos:    [f32; 3],
  things: [f32; 4],
}

static mut STATE: Option<GpuState> = None;

#[wasm_bindgen]
pub async fn setup_render(canvas: &wgpu::web_sys::HtmlCanvasElement) {
  std::panic::set_hook(Box::new(console_error_panic_hook::hook));
  let _ = console_log::init_with_level(log::Level::Info);

  let needs_animate = unsafe { STATE.is_none() };

  unsafe {
    // Replace the state if its already set.
    STATE = Some(setup_instance(canvas).await);
  };

  if needs_animate {
    animate(
      move || unsafe {
        if let Some(state) = &mut STATE {
          state.draw();
        }
      },
      120,
    );
  }
}

#[wasm_bindgen]
pub fn resize(width: u32, height: u32) {
  if let Some(state) = unsafe { STATE.as_mut() } {
    state.size = vector![width, height];
    state.configure_surface();
  }
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
  depth_texture:   Option<wgpu::Texture>,

  staging_belt: wgpu::util::StagingBelt,
  mat_buf:      wgpu::Buffer,
  time_buf:     wgpu::Buffer,

  size:        Vector2<u32>,
  view:        Matrix4<f32>,
  perspective: Matrix4<f32>,

  buffer:     wgpu::Buffer,
  buffer_len: u32,

  frames: u32,
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
    entries: &[
      wgpu::BindGroupLayoutEntry {
        binding:    0,
        visibility: wgpu::ShaderStages::VERTEX,
        ty:         wgpu::BindingType::Buffer {
          ty:                 wgpu::BufferBindingType::Uniform,
          has_dynamic_offset: false,
          min_binding_size:   wgpu::BufferSize::new(64),
        },
        count:      None,
      },
      wgpu::BindGroupLayoutEntry {
        binding:    1,
        visibility: wgpu::ShaderStages::VERTEX,
        ty:         wgpu::BindingType::Buffer {
          ty:                 wgpu::BufferBindingType::Uniform,
          has_dynamic_offset: false,
          min_binding_size:   wgpu::BufferSize::new(64),
        },
        count:      None,
      },
    ],
  });

  let buffer = Matrix4::<f32>::identity();
  let mat_buf = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
    label:    None,
    contents: bytemuck::cast_slice(buffer.as_slice()),
    usage:    wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
  });
  let mut bytes = [0; 64];
  bytes[0..4].copy_from_slice(&0.0_f32.to_ne_bytes());
  let time_buf = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
    label:    None,
    contents: &bytes,
    usage:    wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
  });

  let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
    layout:  &bind_group_layout,
    entries: &[
      wgpu::BindGroupEntry { binding: 0, resource: mat_buf.as_entire_binding() },
      wgpu::BindGroupEntry { binding: 1, resource: time_buf.as_entire_binding() },
    ],
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
      // things
      wgpu::VertexAttribute {
        format:          wgpu::VertexFormat::Float32x4,
        offset:          4 * 3,
        shader_location: 1,
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
      targets:             &[Some(wgpu::ColorTargetState {
        format:     swapchain_format,
        blend:      Some(wgpu::BlendState::ALPHA_BLENDING),
        write_mask: wgpu::ColorWrites::ALL,
      })],
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

  let contents = build_terrain();
  let buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
    label:    None,
    contents: bytemuck::cast_slice(&contents),
    usage:    wgpu::BufferUsages::VERTEX,
  });

  let mut state = GpuState {
    surface,
    device,
    queue,
    bind_group,
    swapchain_format,

    render_pipeline,
    depth_texture: None,

    staging_belt: wgpu::util::StagingBelt::new(64),
    mat_buf,
    time_buf,

    size: vector![1000, 500],
    view: Matrix4::identity(),
    perspective: Matrix4::new_perspective(1920.0 / 1080.0, 70.0, 0.1, 10000.0),

    buffer,
    buffer_len: contents.len() as u32,

    frames: 0,
  };
  state.configure_surface();
  state
}

impl GpuState {
  fn configure_surface(&mut self) {
    let surface_config = wgpu::SurfaceConfiguration {
      usage:                         wgpu::TextureUsages::RENDER_ATTACHMENT,
      format:                        self.swapchain_format,
      // Request compatibility with the sRGB-format texture view we're going to create later.
      view_formats:                  vec![self.swapchain_format.add_srgb_suffix()],
      alpha_mode:                    wgpu::CompositeAlphaMode::Auto,
      width:                         self.size.x,
      height:                        self.size.y,
      desired_maximum_frame_latency: 2,
      present_mode:                  wgpu::PresentMode::AutoVsync,
    };
    self.surface.configure(&self.device, &surface_config);
    self.perspective =
      Matrix4::new_perspective(self.size.x as f32 / self.size.y as f32, 70.0, 0.1, 10000.0);

    self.depth_texture = Some(self.device.create_texture(&wgpu::TextureDescriptor {
      label:           Some("depth_texture"),
      size:            wgpu::Extent3d {
        width:                 self.size.x,
        height:                self.size.y,
        depth_or_array_layers: 1,
      },
      mip_level_count: 1,
      sample_count:    1,
      dimension:       wgpu::TextureDimension::D2,
      format:          wgpu::TextureFormat::Depth32Float,
      usage:           wgpu::TextureUsages::RENDER_ATTACHMENT,
      view_formats:    &[],
    }));
  }

  fn draw(&mut self) {
    let surface_texture = self.surface.get_current_texture().unwrap();
    let texture_view = surface_texture.texture.create_view(&wgpu::TextureViewDescriptor {
      // Without add_srgb_suffix() the image we will be working with
      // might not be "gamma correct".
      format: Some(self.swapchain_format.add_srgb_suffix()),
      ..Default::default()
    });

    let depth_view =
      self.depth_texture.as_mut().unwrap().create_view(&wgpu::TextureViewDescriptor::default());

    let mut encoder =
      self.device.create_command_encoder(&wgpu::CommandEncoderDescriptor::default());

    let time = self.frames as f32 / 500.0;

    let yaw = time / 20.0;
    let pos = Point3::new(yaw.cos() * 40.0 + 100.0, 20.0, yaw.sin() * 40.0 + 100.0);
    let target = Point3::new(100.0, 0.0, 100.0);
    self.view = Matrix4::look_at_rh(&pos, &target, &Vector3::y());

    self.frames += 1;

    let mat = self.perspective * self.view;

    let bytes = bytemuck::cast_slice(mat.as_slice());
    self
      .staging_belt
      .write_buffer(
        &mut encoder,
        &self.mat_buf,
        0,
        wgpu::BufferSize::new(bytes.len() as _).unwrap(),
        &self.device,
      )
      .copy_from_slice(&bytes);
    let mut bytes = [0; 64];
    bytes[0..4].copy_from_slice(&time.to_ne_bytes());
    bytes[4..8].copy_from_slice(&(self.size.x as f32 / self.size.y as f32).to_ne_bytes());
    self
      .staging_belt
      .write_buffer(
        &mut encoder,
        &self.time_buf,
        0,
        wgpu::BufferSize::new(bytes.len() as _).unwrap(),
        &self.device,
      )
      .copy_from_slice(&bytes);

    {
      let mut render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
        label:                    None,
        color_attachments:        &[Some(wgpu::RenderPassColorAttachment {
          view:           &texture_view,
          resolve_target: None,
          ops:            wgpu::Operations {
            load:  wgpu::LoadOp::Clear(wgpu::Color { r: 0.8, g: 0.8, b: 0.8, a: 1.0 }),
            store: wgpu::StoreOp::Store,
          },
        })],
        depth_stencil_attachment: Some(wgpu::RenderPassDepthStencilAttachment {
          view:        &depth_view,
          depth_ops:   Some(wgpu::Operations {
            load:  wgpu::LoadOp::Clear(1.0),
            store: wgpu::StoreOp::Discard,
          }),
          stencil_ops: None,
        }),
        timestamp_writes:         None,
        occlusion_query_set:      None,
      });

      render_pass.set_pipeline(&self.render_pipeline);
      render_pass.set_bind_group(0, &self.bind_group, &[]);

      render_pass.set_vertex_buffer(0, self.buffer.slice(..));
      render_pass.draw(0..self.buffer_len, 0..1);
    }

    self.staging_belt.finish();

    self.queue.submit([encoder.finish()]);
    surface_texture.present();

    self.staging_belt.recall();
  }
}

fn build_terrain() -> Vec<Vertex> {
  const WIDTH: usize = 200;
  const HEIGHT: usize = 200;

  let mut points = vec![Point3::new(0.0, 0.0, 0.0); WIDTH * HEIGHT];
  let mut rng = rand::rngs::SmallRng::from_seed([0; 32]);

  // Generation
  generate_terrain(&mut rng, &mut points, WIDTH, HEIGHT);

  let mut out = vec![];

  // Tesselation.
  for x in 0..WIDTH - 1 {
    for y in 0..HEIGHT - 1 {
      /*
      let a = points[x * WIDTH + y];
      let b = points[x * WIDTH + (y + 1)];
      let c = points[(x + 1) * WIDTH + (y + 1)];
      let d = points[(x + 1) * WIDTH + y];

      out.push(Vertex { pos: [a.x, a.y, a.z], things: [1.0, 0.0, 0.0, 1.0] });
      out.push(Vertex { pos: [b.x, b.y, b.z], things: [0.0, 1.0, 0.0, 1.0] });
      out.push(Vertex { pos: [c.x, c.y, c.z], things: [0.0, 0.0, 1.0, 1.0] });

      out.push(Vertex { pos: [a.x, a.y, a.z], things: [1.0, 0.0, 0.0, 1.0] });
      out.push(Vertex { pos: [c.x, c.y, c.z], things: [0.0, 1.0, 0.0, 1.0] });
      out.push(Vertex { pos: [d.x, d.y, d.z], things: [0.0, 0.0, 1.0, 1.0] });
      */
      let p = points[x * WIDTH + y];

      out.push(Vertex { pos: [p.x, p.y, p.z], things: [1.0, 0.0, 0.0, 1.0] });
      out.push(Vertex { pos: [p.x, p.y, p.z], things: [0.0, 1.0, 0.0, 1.0] });
      out.push(Vertex { pos: [p.x, p.y, p.z], things: [1.0, 1.0, 0.0, 1.0] });
    }
  }

  out
}

fn generate_terrain(
  rng: &mut impl Rng,
  points: &mut Vec<Point3<f32>>,
  width: usize,
  height: usize,
) {
  let noise = BasicMulti::<OpenSimplex>::new(rng.next_u32());

  for x in 0..width {
    for z in 0..height {
      let height = noise.get([x as f64 / 50.0, z as f64 / 50.0]) as f32;

      points[x * width + z] = Point3::new(
        x as f32 + rng.random::<f32>() * 0.1,
        (height * 50.0).max(0.0),
        z as f32 + rng.random::<f32>() * 0.1,
      );
    }
  }
}
