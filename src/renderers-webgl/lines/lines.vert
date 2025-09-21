#version 300 es

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_beforeStart;
layout(location = 2) in vec2 a_start;
layout(location = 3) in vec2 a_end;
layout(location = 4) in vec2 a_afterEnd;
layout(location = 5) in float a_z;
layout(location = 6) in float a_thickness;
layout(location = 7) in float a_alignment;
layout(location = 8) in float a_dashSize;
layout(location = 9) in float a_gapSize;
layout(location = 10) in float a_distanceStart;
layout(location = 11) in float a_distanceEnd;
layout(location = 12) in vec4 a_color;

uniform mat3x2 u_projection;
uniform float u_cameraScale;

out vec2 v_start;
out vec2 v_end;
out vec2 v_pos;
out float v_distanceStart;
out float v_dashSize;
out float v_gapSize;
out vec4 v_color;

void main() {
    // Use the fact that aVertexPosition.x is either 0 or 1 to calculate relevant points for miter
    vec2 pointA = a_beforeStart * (1.0 - a_position.x) + a_start * a_position.x;
    vec2 pointB = a_start * (1.0 - a_position.x) + a_end * a_position.x;
    vec2 pointC = a_end * (1.0 - a_position.x) + a_afterEnd * a_position.x;

    // Tangent of first line segment
    vec2 ba = normalize(pointB - pointA);
    vec2 baNormal = normalize(vec2(-ba.y, ba.x));

    // Tangent/miter normal for the center point
    vec2 tangent = normalize(normalize(pointC - pointB) + ba);
    vec2 miterNormal = vec2(-tangent.y, tangent.x);

    // Ratio for thickness based on alignment (0 is inside, .5 center, 1 outside)
    float alignmentRatio;

    if (a_position.y < 0.0) {
        alignmentRatio = (1.0 - a_alignment) * 2.0;
    } else {
        alignmentRatio = a_alignment * 2.0;
    }

    // Point adjusted for miter join
    vec2 miter = miterNormal * a_thickness * alignmentRatio / dot(miterNormal, baNormal);

    vec2 pos = pointB + miter * a_position.y * u_cameraScale;

    gl_Position = vec4((u_projection * vec3(pos, 1.0)).xy, a_z, 1.0);

    v_start = a_start;
    v_end = a_end;
    v_pos = pos;
    v_distanceStart = a_distanceStart / u_cameraScale;
    v_dashSize = a_dashSize;
    v_gapSize = a_gapSize;
    v_color = a_color;
}