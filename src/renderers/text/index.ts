import { LocalTransform2DLike, Vec2Like } from '../../math';
import { Font, TextLayout, TextStyle } from '../../text';
import { BYTE_SIZE, FLOAT_SIZE, INT_32_SIZE } from '../../util/sizes';
export * from './text-batching';
export * from './text-buffer-manager';

export interface TextLike {
    readonly style: TextStyle;
    readonly font: Font;
    readonly layout: TextLayout;
    readonly anchor: Vec2Like;
    readonly transform: LocalTransform2DLike;
}

export const MAX_GLYPHS_PER_BATCH = 32_000;

export const BYTES_PER_GLYPH_VERTEX =
    FLOAT_SIZE * 3 + // Position
    FLOAT_SIZE * 2 + // UV
    BYTE_SIZE * 4 + // Color
    FLOAT_SIZE + // Screen pixel range
    INT_32_SIZE; // Texture ID

export const BYTES_PER_GLYPH = BYTES_PER_GLYPH_VERTEX * 6;

export interface FontTextureIndexProvider {
    getTextureIndex(font: Font): number | undefined;
}
