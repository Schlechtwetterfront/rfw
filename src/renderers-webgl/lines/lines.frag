#version 300 es

precision highp float;

in float v_distanceAlongLine;
in float v_dashSize;
in float v_gapSize;
in vec4 v_color;

out vec4 outColor;

void main() {
    if (fract(v_distanceAlongLine / (v_dashSize + v_gapSize)) > v_dashSize / (v_dashSize + v_gapSize))
        discard;

    outColor = v_color;
}