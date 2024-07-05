/** @category Rendering - WebGL */
export interface CombinedFilterParams {
    filter: 'linear' | 'nearest';
}

const FILTER = 'filter' satisfies keyof CombinedFilterParams;

/** @category Rendering - WebGL */
export interface MinMagFilterParams {
    minFilter:
        | 'linear'
        | 'nearest'
        | 'nearestMipmapNearest'
        | 'nearestMipmapLinear'
        | 'linearMipmapNearest'
        | 'linearMipmapLinear';
    magFilter: 'linear' | 'nearest';
}

const MIN_FILTER = 'minFilter' satisfies keyof MinMagFilterParams;
const MAG_FILTER = 'magFilter' satisfies keyof MinMagFilterParams;

/** @category Rendering - WebGL */
export function getMinFilter(
    gl: WebGL2RenderingContext,
    filter: MinMagFilterParams['minFilter'],
) {
    switch (filter) {
        case 'linear':
            return gl.LINEAR;

        case 'nearest':
            return gl.NEAREST;

        case 'nearestMipmapNearest':
            return gl.NEAREST_MIPMAP_NEAREST;

        case 'nearestMipmapLinear':
            return gl.NEAREST_MIPMAP_LINEAR;

        case 'linearMipmapLinear':
            return gl.LINEAR_MIPMAP_LINEAR;

        case 'linearMipmapNearest':
            return gl.LINEAR_MIPMAP_NEAREST;

        default:
            throw new Error(`Invalid min filter ${filter}`);
    }
}

/** @category Rendering - WebGL */
export function getMagFilter(
    gl: WebGL2RenderingContext,
    filter: MinMagFilterParams['magFilter'],
) {
    switch (filter) {
        case 'linear':
            return gl.LINEAR;

        case 'nearest':
            return gl.NEAREST;

        default:
            throw new Error(`Invalid mag filter ${filter}`);
    }
}

/** @category Rendering - WebGL */
export type FilterParams = CombinedFilterParams | MinMagFilterParams;

/** @category Rendering - WebGL */
export interface CombinedWrapParams {
    wrap: 'repeat' | 'mirroredRepeat' | 'clamp';
}

const WRAP = 'wrap' satisfies keyof CombinedWrapParams;

/** @category Rendering - WebGL */
export interface STWrapParams {
    wrapS: 'repeat' | 'mirroredRepeat' | 'clamp';
    wrapT: 'repeat' | 'mirroredRepeat' | 'clamp';
}

const WRAP_S = 'wrapS' satisfies keyof STWrapParams;
const WRAP_T = 'wrapT' satisfies keyof STWrapParams;

function getWrap(
    gl: WebGL2RenderingContext,
    wrap: 'repeat' | 'mirroredRepeat' | 'clamp',
) {
    switch (wrap) {
        case 'repeat':
            return gl.REPEAT;

        case 'mirroredRepeat':
            return gl.MIRRORED_REPEAT;

        case 'clamp':
            return gl.CLAMP_TO_EDGE;

        default:
            throw new Error(`Invalid wrap mode ${wrap}`);
    }
}

/** @category Rendering - WebGL */
export type WrapParams = CombinedWrapParams | STWrapParams;

/** @category Rendering - WebGL */
export interface LevelParams {
    baseLevel: number;
    maxLevel: number;
}

/** @category Rendering - WebGL */
export interface LODParams {
    minLOD: number;
    maxLOD: number;
}

/** @category Rendering - WebGL */
export type TextureParams = Partial<FilterParams> &
    Partial<WrapParams> &
    Partial<LevelParams> &
    Partial<LODParams>;

/**
 * Set texture parameters for the currently bound texture.
 * @param gl - GL
 * @param params - Parameters
 *
 * @category Rendering - WebGL
 */
export function setTextureParameters(
    gl: WebGL2RenderingContext,
    params: TextureParams,
): void {
    if (MIN_FILTER in params && params.minFilter) {
        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_MIN_FILTER,
            getMinFilter(gl, params.minFilter),
        );
    }

    if (MAG_FILTER in params && params.magFilter) {
        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_MAG_FILTER,
            getMagFilter(gl, params.magFilter),
        );
    }

    if (FILTER in params && params.filter) {
        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_MIN_FILTER,
            getMagFilter(gl, params.filter),
        );
        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_MAG_FILTER,
            getMagFilter(gl, params.filter),
        );
    }

    if (WRAP_S in params && params.wrapS) {
        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_WRAP_S,
            getWrap(gl, params.wrapS),
        );
    }

    if (WRAP_T in params && params.wrapT) {
        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_WRAP_T,
            getWrap(gl, params.wrapT),
        );
    }

    if (WRAP in params && params.wrap) {
        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_WRAP_S,
            getWrap(gl, params.wrap),
        );
        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_WRAP_T,
            getWrap(gl, params.wrap),
        );
    }

    if (params.baseLevel != undefined) {
        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_BASE_LEVEL,
            params.baseLevel,
        );
    }

    if (params.maxLevel != undefined) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, params.maxLevel);
    }

    if (params.minLOD != undefined) {
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_LOD, params.minLOD);
    }

    if (params.maxLOD != undefined) {
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAX_LOD, params.maxLOD);
    }
}

/** @category Rendering - WebGL */
export type SamplerParams = Partial<FilterParams> &
    Partial<WrapParams> &
    Partial<LODParams>;

/**
 * Set sampler parameters for the given sampler.
 * @param gl - GL
 * @param sampler - Sampler
 * @param params - Params
 *
 * @category Rendering - WebGL
 */
export function setSamplerParameters(
    gl: WebGL2RenderingContext,
    sampler: WebGLSampler,
    params: SamplerParams,
): void {
    if (MIN_FILTER in params && params.minFilter) {
        gl.samplerParameteri(
            sampler,
            gl.TEXTURE_MIN_FILTER,
            getMinFilter(gl, params.minFilter),
        );
    }

    if (MAG_FILTER in params && params.magFilter) {
        gl.samplerParameteri(
            sampler,
            gl.TEXTURE_MAG_FILTER,
            getMagFilter(gl, params.magFilter),
        );
    }

    if (FILTER in params && params.filter) {
        gl.samplerParameteri(
            sampler,
            gl.TEXTURE_MIN_FILTER,
            getMagFilter(gl, params.filter),
        );
        gl.samplerParameteri(
            sampler,
            gl.TEXTURE_MAG_FILTER,
            getMagFilter(gl, params.filter),
        );
    }

    if (WRAP_S in params && params.wrapS) {
        gl.samplerParameteri(
            sampler,
            gl.TEXTURE_WRAP_S,
            getWrap(gl, params.wrapS),
        );
    }

    if (WRAP_T in params && params.wrapT) {
        gl.samplerParameteri(
            sampler,
            gl.TEXTURE_WRAP_T,
            getWrap(gl, params.wrapT),
        );
    }

    if (WRAP in params && params.wrap) {
        gl.samplerParameteri(
            sampler,
            gl.TEXTURE_WRAP_S,
            getWrap(gl, params.wrap),
        );
        gl.samplerParameteri(
            sampler,
            gl.TEXTURE_WRAP_T,
            getWrap(gl, params.wrap),
        );
    }

    if (params.minLOD != undefined) {
        gl.samplerParameterf(sampler, gl.TEXTURE_MIN_LOD, params.minLOD);
    }

    if (params.maxLOD != undefined) {
        gl.samplerParameterf(sampler, gl.TEXTURE_MAX_LOD, params.maxLOD);
    }
}
