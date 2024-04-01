#version 300 es

precision highp float;

in vec2 v_UV;
in vec4 v_color;
in float v_distanceFieldRange;
flat in int v_textureIndex;

${uniforms}

out vec4 outColor;

float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

void main() {
    vec4 texel;
    ivec2 texDimensions;

${samplingAndSize}

    float dist = median(texel.r, texel.g, texel.b);

    vec2 unitRange = vec2(v_distanceFieldRange) / vec2(texDimensions);
    vec2 screenTexSize = vec2(1.0) / fwidth(v_UV);

    float screenPixelRange = max(0.5 * dot(unitRange, screenTexSize), 1.0);
    float screenPixelDistance = screenPixelRange * (dist - 0.5);
    float opacity = clamp(screenPixelDistance + 0.5, 0.0, 1.0);

    if (opacity < 0.001) {
        discard;
    }

    outColor = vec4(v_color.rgb, v_color.a * opacity);
}