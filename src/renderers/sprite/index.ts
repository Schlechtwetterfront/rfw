import { ReadonlyLocalTransform2D } from '../../math';
import { ReadonlyRect } from '../../math/shapes';
import { BYTE_SIZE, FLOAT_SIZE, INT_32_SIZE } from '../../util';
import { TexturedMaterial } from '../textured-mesh';

export * from './sprite-batch-storage';
export * from './sprite-batcher';
export * from './sprite-batcher-base';

/** @category Rendering - Sprites */
export const SPRITE_SIZES = {
    BYTES_PER_INSTANCE:
        6 * FLOAT_SIZE + // Matrix
        2 * FLOAT_SIZE + // Size
        1 * FLOAT_SIZE + // Z
        4 * FLOAT_SIZE + // Texture region
        4 * BYTE_SIZE + // Color
        1 * INT_32_SIZE, // Texture index
};

/** @category Rendering - Sprites */
export interface SpriteLike {
    readonly material: TexturedMaterial;
    readonly transform: ReadonlyLocalTransform2D;
    readonly textureRegion: ReadonlyRect;
}
