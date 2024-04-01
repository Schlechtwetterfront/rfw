import { TextureHandle } from '../../rendering/textures';
import { WGLTextures } from '../textures';

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
