@group(0) @binding(0) var<uniform> mat: mat4x4<f32>;

// m00: the time
// m01: aspect ratio
@group(0) @binding(1) var<uniform> info: mat4x4<f32>;

struct VSOut {
  @builtin(position) pos: vec4<f32>,
  @location(0) things: vec4<f32>,
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
  screen_space.x += things.x * 0.1;
  screen_space.y += things.y * 0.1 * aspect;

  return VSOut(screen_space, things);
}

@fragment
fn fs_main(
  vert: VSOut,
) -> @location(0) vec4<f32> {
  if vert.things.x < 0.1 || vert.things.y < 0.1 || vert.things.z < 0.1 {
    return vec4<f32>(0.2, 0.2, 0.2, 1.0);
  }

  return vec4<f32>(0.4, 0.4, 0.4, 1.0);
}
