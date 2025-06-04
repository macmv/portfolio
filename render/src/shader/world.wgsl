@group(0) @binding(0) var<uniform> mat: mat4x4<f32>;

// m00: the time
// m01: aspect ratio
@group(0) @binding(1) var<uniform> info: mat4x4<f32>;

const POINT_SIZE: f32 = 0.4;
const BACKGROUND: vec4<f32> = vec4<f32>(0.8, 0.8, 0.8, 1.0);

struct VSOut {
  @builtin(position) pos: vec4<f32>,
  @location(0) logical_space: vec2<f32>,
  @location(1) original: vec2<f32>,
};

@vertex
fn vs_main(
  @location(0) pos: vec3<f32>,
  @location(1) things: vec4<f32>,
) -> VSOut {
  let time = info[0][0];
  let aspect = info[0][1];

  let identity = pos.x * 100.0 + pos.z * 10.0;

  var moved = pos;
  moved.y += sin(time + identity) * 0.5;

  var screen_space = mat * vec4<f32>(moved, 1.0);
  var logical_space = screen_space.xy;
  let original = logical_space - vec2(0.05, 0.05);
  screen_space.x += (things.x * 4.0 - 3.0) * POINT_SIZE / aspect;
  screen_space.y += (things.y * 4.0 - 3.0) * POINT_SIZE;
  logical_space.x += (things.x * 4.0 - 3.0) * POINT_SIZE;
  logical_space.y += (things.y * 4.0 - 3.0) * POINT_SIZE;

  return VSOut(screen_space, logical_space, original);
}

@fragment
fn fs_main(
  vert: VSOut,
) -> @location(0) vec4<f32> {
  let diff = vert.logical_space - vert.original;
  let dist = sqrt(diff.x * diff.x + diff.y * diff.y);

  if dist > POINT_SIZE + 0.05 {
    return vec4<f32>(0.4, 0.4, 0.4, 0.0);
  } else if dist > POINT_SIZE {
    let alpha = 1.0 - (dist - POINT_SIZE) / 0.05;
    return vec4<f32>(0.4, 0.4, 0.4, alpha);
  } else {
    return vec4<f32>(0.4, 0.4, 0.4, 1.0);
  }
}

fn lerp(
  a: vec4<f32>,
  b: vec4<f32>,
  t: f32,
) -> vec4<f32> {
  return a + (b - a) * t;
}
