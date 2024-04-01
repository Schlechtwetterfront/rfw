export class ShaderHandle {
    constructor(public readonly label: string) {}
}

export interface Shaders {}

export interface MultiTextureShaderInfo {
    handle: ShaderHandle;
    textureCount: number;
}
