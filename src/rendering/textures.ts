import { ResourceOptions } from '.';
import { Vec2, Vec2Like } from '../math';
import { TextureParams } from '../rendering-webgl/textures';

/** @category Rendering */
export class TextureHandle {
    public readonly dimensions: Vec2;

    constructor(
        dimensions: Vec2Like,
        public readonly label?: string,
    ) {
        this.dimensions = Vec2.from(dimensions);
    }
}

export type TextureOptions = ResourceOptions & TextureParams;

/** @category Rendering */
export interface DriverTextures {
    readonly white: TextureHandle;

    readonly initialized: Promise<void>;

    addEmpty(
        dimensions: Vec2Like,
        options?: TextureOptions,
    ): Promise<TextureHandle>;

    addFromImageBitmap(
        imageBitmap: ImageBitmap,
        options?: TextureOptions,
    ): Promise<TextureHandle>;

    setFromImageBitmap(
        handle: TextureHandle,
        imageBitmap: ImageBitmap,
        options?: TextureParams,
    ): Promise<void>;
}

/** @category Rendering */
export interface TextureIndexProvider {
    getTextureIndex(tex: TextureHandle): number | undefined;
}

/** @category Rendering */
export function getMaxTextures(batches: readonly { textureCount: number }[]) {
    return batches.reduce(
        (max, b) => (b.textureCount > max ? b.textureCount : max),
        1,
    );
}

/** @category Rendering */
export interface WithTexture {
    readonly texture: TextureHandle;
}
