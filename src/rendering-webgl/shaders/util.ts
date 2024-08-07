import { TextureHandle } from '../../rendering/textures';
import { WGLTextures } from '../textures/textures';

/** @category Rendering - WebGL */
export function bindMultiTextureOneSampler(
    gl: WebGL2RenderingContext,
    textures: WGLTextures,
    textureCount: number,
    textureHandles: readonly TextureHandle[],
    sampler: WebGLSampler,
) {
    for (let i = 0; i < textureCount; i++) {
        gl.activeTexture(gl.TEXTURE0 + i);

        const handle = textureHandles[i]!;
        const tex = handle && textures.get(handle);

        if (tex) {
            gl.bindTexture(gl.TEXTURE_2D, tex);
        }

        gl.bindSampler(i, sampler);
    }
}

/** @category Rendering - WebGL */
export function bindMultiTexture(
    gl: WebGL2RenderingContext,
    textures: WGLTextures,
    textureCount: number,
    textureHandles: readonly TextureHandle[],
) {
    for (let i = 0; i < textureCount; i++) {
        gl.activeTexture(gl.TEXTURE0 + i);

        gl.bindSampler(i, null);

        const handle = textureHandles[i]!;
        const tex = handle && textures.get(handle);

        if (tex) {
            gl.bindTexture(gl.TEXTURE_2D, tex);
        }
    }
}

/** @category Rendering - WebGL */
export type UniformLocationsQuery = {
    [k: string]: string;
};

/** @category Rendering - WebGL */
export type UniformLocations<Q> = {
    [K in keyof Q]: WebGLUniformLocation;
};

/** @category Rendering - WebGL */
export function getUniformLocations<Q extends UniformLocationsQuery>(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    uniforms: Q,
): UniformLocations<Q> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = {} as UniformLocations<any>;

    for (const k of Object.getOwnPropertyNames(uniforms)) {
        const location = gl.getUniformLocation(program, uniforms[k]!);

        if (!location) {
            throw new Error(`Uniform ${uniforms[k]} does not exist`);
        }

        results[k] = location;
    }

    return results;
}
