import { ReadonlyLocalTransform2D, ReadonlyVec2 } from '../../math';
import { Font, TextLayout, TextStyle } from '../../text';
import { BYTE_SIZE, FLOAT_SIZE, INT_32_SIZE } from '../../util/sizes';
export * from './text-batching';
export * from './text-buffer-manager';

/** @category Rendering - Text */
export interface TextLike {
    readonly style: TextStyle;
    readonly font: Font;
    readonly layout: TextLayout;
    readonly anchor: ReadonlyVec2;
    readonly transform: ReadonlyLocalTransform2D;
}

/** @category Rendering - Text */
export const MAX_GLYPHS_PER_BATCH = 32_000;

/** @category Rendering - Text */
export const BYTES_PER_GLYPH_VERTEX =
    FLOAT_SIZE * 3 + // Position
    FLOAT_SIZE * 2 + // UV
    BYTE_SIZE * 4 + // Color
    FLOAT_SIZE + // Screen pixel range
    INT_32_SIZE; // Texture ID

/** @category Rendering - Text */
export const BYTES_PER_GLYPH = BYTES_PER_GLYPH_VERTEX * 6;

/** @category Rendering - Text */
export interface FontTextureIndexProvider {
    getTextureIndex(font: Font): number | undefined;
}
