#version 300 es

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_mat1;
layout(location = 2) in vec2 a_mat2;
layout(location = 3) in vec2 a_mat3;
layout(location = 4) in vec2 a_size;
layout(location = 5) in float a_z;
layout(location = 6) in vec4 a_UV;
layout(location = 7) in vec4 a_color;
layout(location = 8) in int a_textureIndex;

uniform mat3x2 u_projection;

out vec2 v_UV;
out vec4 v_color;
flat out int v_textureIndex;

void main() {
    mat3x2 mat = mat3x2(a_mat1, a_mat2, a_mat3);

    vec2 local = a_size * a_position;
    vec2 world = mat * vec3(local, 1.0);

    gl_Position = vec4((u_projection * vec3(world, 1.0)).xy, a_z, 1.0);

    v_UV = mix(a_UV.xy, a_UV.zw, a_position + 0.5);
    v_color = a_color;
    v_textureIndex = a_textureIndex;
}