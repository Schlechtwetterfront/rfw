/** @category Rendering */
export class ShaderHandle {
    constructor(public readonly label: string) {}
}

/** @category Rendering */
export interface Shaders {}

/** @category Rendering */
export interface MultiTextureShaderInfo {
    handle: ShaderHandle;
    textureCount: number;
}
