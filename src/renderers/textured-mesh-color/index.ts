import { BYTE_SIZE, FLOAT_SIZE, INT_32_SIZE } from '../../util';

export * from './mesh-color-batch-storage';
export * from './mesh-color-batcher';

/** @category Rendering - Textured Mesh */
export const MESH_COLOR_SIZES = {
    BYTES_PER_VERTEX_MAIN_BUFFER:
        3 * FLOAT_SIZE + // Position
        2 * FLOAT_SIZE + // UVs
        1 * INT_32_SIZE, // Texture index
    BYTES_PER_VERTEX_COLOR_BUFFER: 4 * BYTE_SIZE,
};
