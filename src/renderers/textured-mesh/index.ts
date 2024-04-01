import { LocalTransform2DLike } from '../../math';
import { Mesh } from '../../rendering/mesh';
import { BYTE_SIZE, FLOAT_SIZE, INT_32_SIZE } from '../../util/sizes';
import { TexturedMaterial } from './textured-material';
export * from './mesh-batching';
export * from './mesh-buffer-manager';
export * from './textured-material';

export const BYTES_PER_VERTEX_POSITION = 3 * FLOAT_SIZE;
export const BYTES_PER_VERTEX_VISUAL =
    2 * FLOAT_SIZE + // UVs
    4 * BYTE_SIZE + // Color
    1 * INT_32_SIZE; // Texture index;

export const BYTES_PER_VERTEX =
    BYTES_PER_VERTEX_POSITION + BYTES_PER_VERTEX_VISUAL;

export interface TexturedMeshLike {
    readonly mesh: Mesh;
    readonly material: TexturedMaterial;
    readonly transform: LocalTransform2DLike;
}
