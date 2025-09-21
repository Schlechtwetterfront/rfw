#version 300 es

precision highp float;

in vec2 v_start;
in vec2 v_end;
in vec2 v_pos;
in float v_distanceStart;
in float v_dashSize;
in float v_gapSize;
in vec4 v_color;

out vec4 outColor;

void main() {
    vec2 lineVec = v_end - v_start;
    vec2 toPoint = v_pos - v_start;
    float t = clamp(dot(toPoint, lineVec) / dot(lineVec, lineVec), 0.0, 1.0);
    float distanceInSegment = length(lineVec) * t;
    
    float totalDistance = v_distanceStart + distanceInSegment;
    
    if (fract(totalDistance / (v_dashSize + v_gapSize)) > v_dashSize / (v_dashSize + v_gapSize))
        discard;

    outColor = v_color;
}