import { higherPowerOfTwo } from '../../math/util';
import { MultiTextureShaderInfo } from '../../rendering/shaders';
import { WGLShaders } from './shaders';

/** @category Rendering - WebGL */
export function buildMultiTextureUniforms(
    textureCount: number,
    samplerName = 'u_sampler',
) {
    if (textureCount < 1) {
        throw new Error('textureCount must be > 0');
    }

    if (textureCount === 1) {
        return `uniform sampler2D ${samplerName};`;
    } else {
        return `uniform sampler2D ${samplerName}[${textureCount}];`;
    }
}

/** @category Rendering - WebGL */
export function buildMultiTextureSampling(
    textureCount: number,
    samplerName = 'u_sampler',
    texelName = 'texel',
    uvName = 'v_UV',
    textureIndexName = 'v_textureIndex',
) {
    if (textureCount === 1) {
        return `    ${texelName} = texture(${samplerName}, ${uvName});`;
    } else {
        const parts = [];

        parts.push(`    switch (${textureIndexName}) {`);

        for (let i = 0; i < textureCount; i++) {
            parts.push(`        case ${i}:`);
            parts.push(
                `            ${texelName} = texture(${samplerName}[${i}], ${uvName});`,
            );
            parts.push(`            break;`);
            parts.push(``);
        }

        parts.push(`    }`);

        return parts.join('\n');
    }
}

/** @category Rendering - WebGL */
export function buildMultiTextureSamplingAndSize(
    textureCount: number,
    samplerName = 'u_sampler',
    texelName = 'texel',
    uvName = 'v_UV',
    textureSizeName = 'texDimensions',
    textureIndexName = 'v_textureIndex',
) {
    if (textureCount === 1) {
        return `    ${texelName} = texture(${samplerName}, ${uvName});
    ${textureSizeName} = textureSize(${samplerName}, 0);`;
    } else {
        const parts = [];

        parts.push(`    switch (${textureIndexName}) {`);

        for (let i = 0; i < textureCount; i++) {
            parts.push(`        case ${i}:`);
            parts.push(
                `            ${texelName} = texture(${samplerName}[${i}], ${uvName});`,
            );
            parts.push(
                `            ${textureSizeName} = textureSize(${samplerName}[${i}], 0);`,
            );
            parts.push(`            break;`);
            parts.push(``);
        }

        parts.push(`    }`);

        return parts.join('\n');
    }
}

/** @category Rendering - WebGL */
export async function buildMultiTextureSamplingAndSizeShaders(
    shaders: WGLShaders,
    label: string,
    vertexSource: string,
    fragmentTemplate: string,
    textureCount: number,
) {
    const textShaders: MultiTextureShaderInfo[] = [];

    let powerOfTwoTextureCount = 1;

    while (powerOfTwoTextureCount <= textureCount) {
        const uniforms = buildMultiTextureUniforms(powerOfTwoTextureCount);
        const samplingAndSize = buildMultiTextureSamplingAndSize(
            powerOfTwoTextureCount,
        );

        const fragmentSource = fragmentTemplate
            .replace('${uniforms}', uniforms)
            .replace('${samplingAndSize}', samplingAndSize);

        const shader = await shaders.load(
            `${label} ${powerOfTwoTextureCount}tex`,
            vertexSource,
            fragmentSource,
        );

        textShaders.push({
            handle: shader,
            textureCount: powerOfTwoTextureCount,
        });

        powerOfTwoTextureCount = higherPowerOfTwo(powerOfTwoTextureCount);
    }

    return textShaders;
}

/** @category Rendering - WebGL */
export async function buildMultiTextureSamplingShaders(
    shaders: WGLShaders,
    label: string,
    vertexSource: string,
    fragmentTemplate: string,
    textureCount: number,
) {
    const textShaders: MultiTextureShaderInfo[] = [];

    let powerOfTwoTextureCount = 1;

    while (powerOfTwoTextureCount <= textureCount) {
        const uniforms = buildMultiTextureUniforms(powerOfTwoTextureCount);
        const sampling = buildMultiTextureSampling(powerOfTwoTextureCount);

        const fragmentSource = fragmentTemplate
            .replace('${uniforms}', uniforms)
            .replace('${sampling}', sampling);

        const shader = await shaders.load(
            `${label} ${powerOfTwoTextureCount}tex`,
            vertexSource,
            fragmentSource,
        );

        textShaders.push({
            handle: shader,
            textureCount: powerOfTwoTextureCount,
        });

        powerOfTwoTextureCount = higherPowerOfTwo(powerOfTwoTextureCount);
    }

    return textShaders;
}
