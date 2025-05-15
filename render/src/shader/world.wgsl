@group(0) @binding(0) var<uniform> mat: mat4x4<f32>;

struct VSOut {
  @builtin(position) pos: vec4<f32>,
};

@vertex
fn vs_main(@location(0) pos: vec3<f32>) -> VSOut {
  return VSOut(mat * vec4<f32>(pos, 1.0));
}

@fragment
fn fs_main(
  vert: VSOut,
) -> @location(0) vec4<f32> {
  return vec4<f32>(0.0, 1.0, 0.0, 1.0);
}
