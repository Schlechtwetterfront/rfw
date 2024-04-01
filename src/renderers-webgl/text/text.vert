#version 300 es

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec2 a_UV;
layout(location = 2) in vec4 a_color;
layout(location = 3) in float a_distanceFieldRange;
layout(location = 4) in int a_textureIndex;

uniform mat3x2 u_projection;

out vec2 v_UV;
out vec4 v_color;
out float v_distanceFieldRange;
flat out int v_textureIndex;

void main() {
    gl_Position = vec4((u_projection * vec3(a_position.xy, 1.0)).xy, a_position.z, 1.0);

    v_UV = a_UV;
    v_color = a_color;
    v_distanceFieldRange = a_distanceFieldRange;
    v_textureIndex = a_textureIndex;
}