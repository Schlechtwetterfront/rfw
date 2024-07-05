import { ResourceOptions } from '.';

/** @category Rendering */
export class TextureHandle {
    constructor(public readonly label?: string) {}
}

/** @category Rendering */
export interface DriverTextures {
    readonly white: TextureHandle;

    readonly initialized: Promise<void>;

    addFromImageBitmapSource(
        source: ImageBitmapSource,
        options?: {
            imageBitmapOptions?: ImageBitmapOptions;
            resourceOptions?: ResourceOptions;
        },
    ): Promise<TextureHandle>;

    addFromImageBitmap(
        imageBitmap: ImageBitmap,
        options?: ResourceOptions,
    ): Promise<TextureHandle>;

    setFromImageBitmap(
        handle: TextureHandle,
        imageBitmap: ImageBitmap,
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
