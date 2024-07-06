#version 300 es

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec2 a_UV;
layout(location = 2) in vec4 a_color;
layout(location = 3) in float a_distanceFieldRange;
layout(location = 4) in int a_textureIndex;

uniform mat3x2 u_projection;
uniform mat3x2 u_cameraProjection;

out vec2 v_UV;
out vec4 v_color;
out float v_distanceFieldRange;
flat out int v_textureIndex;

void main() {
    vec2 pixelPosition = u_cameraProjection * a_position;

    vec2 snapped = vec2(floor(pixelPosition.x + 0.5), floor(pixelPosition.y + 0.5));

    gl_Position = vec4((u_projection * vec3(snapped.xy, 1.0)).xy, a_position.z, 1.0);

    v_UV = a_UV;
    v_color = a_color;
    v_distanceFieldRange = a_distanceFieldRange;
    v_textureIndex = a_textureIndex;
}