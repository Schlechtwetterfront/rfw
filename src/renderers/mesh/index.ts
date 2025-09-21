import { ReadonlyLocalTransform2D } from '../../math';
import { Mesh } from '../../rendering/mesh';
import { BYTE_SIZE, FLOAT_SIZE, INT_32_SIZE } from '../../util';
import { Material } from './material';

export * from './material';
export * from './mesh-batch-storage';
export * from './mesh-batcher';
export * from './mesh-batcher-base';

/** @category Rendering - Mesh */
export const BYTES_PER_VERTEX_POSITION = 3 * FLOAT_SIZE;

/** @category Rendering - Mesh */
export const BYTES_PER_VERTEX_VISUAL =
    2 * FLOAT_SIZE + // UVs
    4 * BYTE_SIZE + // Color
    1 * INT_32_SIZE; // Texture index

/** @category Rendering - Mesh */
export const BYTES_PER_VERTEX =
    BYTES_PER_VERTEX_POSITION + BYTES_PER_VERTEX_VISUAL;

/** @category Rendering - Mesh */
export interface MeshLike {
    readonly mesh: Mesh;
    readonly material: Material;
    readonly transform: ReadonlyLocalTransform2D;
}
