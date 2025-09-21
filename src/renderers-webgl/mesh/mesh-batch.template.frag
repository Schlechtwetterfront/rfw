#version 300 es

precision highp float;

in vec2 v_UV;
in vec4 v_color;
flat in int v_textureIndex;

${uniforms}

out vec4 outColor;

void main() {
    vec4 texel;

${sampling}

    outColor = v_color * texel;
}