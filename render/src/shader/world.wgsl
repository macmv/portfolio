@group(0) @binding(0) var<uniform> mat: mat4x4<f32>;
@group(0) @binding(1) var<uniform> time_mat: mat4x4<f32>; // we're only using m00

struct VSOut {
  @builtin(position) pos: vec4<f32>,
  @location(0) things: vec4<f32>,
};

@vertex
fn vs_main(
  @location(0) pos: vec3<f32>,
  @location(1) things: vec4<f32>,
) -> VSOut {
  let time = time_mat[0][0];
  let identity = pos.x * 100.0 + pos.z * 10.0;

  var moved = pos;
  moved.y += sin(time + identity) * 0.5;

  return VSOut(mat * vec4<f32>(moved, 1.0), things);
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
