import { BYTES_PER_GLYPH, FontTextureIndexProvider } from '.';
import { Vec2 } from '../../math';
import { zToDepth } from '../../rendering';
import {
    ElementByteBufferManager,
    ElementByteBuffersManager,
} from '../../rendering/buffers';
import { FLOAT_SIZE } from '../../util/sizes';
import { TextBatchEntry, TextBatchStorageFactory } from './text-batching';

/** @category Rendering - Text */
export function getTextBatchStorageFactory(): TextBatchStorageFactory {
    return maxSize => new TextBufferManager(maxSize);
}

const TEMP_VEC = Vec2.zero();
const TEMP_VEC2 = Vec2.zero();

/** @category Rendering - Text */
export class TextBufferManager extends ElementByteBuffersManager<TextBatchEntry> {
    private buffer: ElementByteBufferManager;

    private readonly f32View: Float32Array;
    private readonly i32View: Int32Array;

    textureIndexProvider?: FontTextureIndexProvider;

    constructor(maxSize: number) {
        const buffer = new ElementByteBufferManager(maxSize, BYTES_PER_GLYPH);

        super([buffer]);

        this.buffer = buffer;

        this.f32View = new Float32Array(buffer.arrayBuffer);
        this.i32View = new Int32Array(buffer.arrayBuffer);
    }

    update(entry: TextBatchEntry, glyphOffset: number): void {
        const {
            f32View,
            buffer,
            buffer: { u8View },
            i32View,
        } = this;

        const object = entry.object!;

        const {
            font,
            style,
            layout,
            anchor,
            transform: { worldMatrix: world },
        } = object;
        const lineCount = layout.lines.length;

        const pageOffset = this.textureIndexProvider?.getTextureIndex(font);

        if (pageOffset === undefined) {
            throw new Error(`Missing font ${font.name} of ${object}`);
        }

        buffer.markChanged(glyphOffset, glyphOffset + layout.glyphCount);

        const textStyle = style;

        // Font data
        const color = textStyle.color;

        const fontSize = textStyle.size;
        const fontScale = font.getFontScale(fontSize);

        const scaledLineHeight =
            textStyle.lineHeight.get(font.originalLineHeight) * fontScale;

        const atlasWidth = font.pageDimensions.x;
        const atlasHeight = font.pageDimensions.y;

        const posVec = TEMP_VEC;
        const distanceFieldRange = font.distanceFieldRange;
        const origin = TEMP_VEC2.copyFrom(anchor).multiply(
            -layout.width,
            layout.height,
        );
        const z = zToDepth(object.transform.z);

        let processedGlyphs = 0;

        for (let l = 0; l < lineCount; l++) {
            const line = layout.lines[l]!;

            const lineGlyphCount = line.glyphs.length;

            let x = 0;
            const y = origin.y - l * scaledLineHeight;

            switch (textStyle.align) {
                case 'start':
                    x = origin.x;
                    break;

                case 'center':
                    x = origin.x + (layout.width - line.width) / 2;
                    break;

                case 'end':
                    x = origin.x + (layout.width - line.width);
                    break;
            }

            for (let c = 0; c < lineGlyphCount; c++) {
                const glyph = line.glyphs[c]!;

                const { right, top, width, height } = glyph.rect;

                const left = glyph.rect.x;
                const bottom = glyph.rect.y;

                const scaledWidth = width * fontScale;
                const scaledHeight = height * fontScale;

                const glyphX = x + glyph.offset.x * fontScale;
                const glyphY = y + (glyph.offset.y - height) * fontScale;

                const uvTop = 1 - top / atlasHeight;
                const uvRight = right / atlasWidth;
                const uvBottom = 1 - bottom / atlasHeight;
                const uvLeft = left / atlasWidth;

                let offset32 =
                    ((glyphOffset + processedGlyphs) * BYTES_PER_GLYPH) /
                    FLOAT_SIZE;

                // 3 -- 2
                // |    |
                // 0 -- 1

                // 0
                {
                    posVec.x = glyphX;
                    posVec.y = glyphY;
                    posVec.multiplyMat(world);

                    f32View[offset32++] = posVec.x;
                    f32View[offset32++] = posVec.y;
                    f32View[offset32++] = z;

                    f32View[offset32++] = uvLeft;
                    f32View[offset32++] = uvBottom;

                    color.copyToRGBA(u8View, offset32++ * FLOAT_SIZE);

                    f32View[offset32++] = distanceFieldRange;
                    i32View[offset32++] = glyph.page + pageOffset;
                }

                // 3
                {
                    posVec.x = glyphX;
                    posVec.y = glyphY + scaledHeight;
                    posVec.multiplyMat(world);

                    f32View[offset32++] = posVec.x;
                    f32View[offset32++] = posVec.y;
                    f32View[offset32++] = z;

                    f32View[offset32++] = uvLeft;
                    f32View[offset32++] = uvTop;

                    color.copyToRGBA(u8View, offset32++ * FLOAT_SIZE);

                    f32View[offset32++] = distanceFieldRange;
                    i32View[offset32++] = glyph.page + pageOffset;
                }

                // 1
                {
                    posVec.x = glyphX + scaledWidth;
                    posVec.y = glyphY;
                    posVec.multiplyMat(world);

                    f32View[offset32++] = posVec.x;
                    f32View[offset32++] = posVec.y;
                    f32View[offset32++] = z;

                    f32View[offset32++] = uvRight;
                    f32View[offset32++] = uvBottom;

                    color.copyToRGBA(u8View, offset32++ * FLOAT_SIZE);

                    f32View[offset32++] = distanceFieldRange;
                    i32View[offset32++] = glyph.page + pageOffset;
                }

                // 3
                {
                    posVec.x = glyphX;
                    posVec.y = glyphY + scaledHeight;
                    posVec.multiplyMat(world);

                    f32View[offset32++] = posVec.x;
                    f32View[offset32++] = posVec.y;
                    f32View[offset32++] = z;

                    f32View[offset32++] = uvLeft;
                    f32View[offset32++] = uvTop;

                    color.copyToRGBA(u8View, offset32++ * FLOAT_SIZE);

                    f32View[offset32++] = distanceFieldRange;
                    i32View[offset32++] = glyph.page + pageOffset;
                }

                // 1
                {
                    posVec.x = glyphX + scaledWidth;
                    posVec.y = glyphY;
                    posVec.multiplyMat(world);

                    f32View[offset32++] = posVec.x;
                    f32View[offset32++] = posVec.y;
                    f32View[offset32++] = z;

                    f32View[offset32++] = uvRight;
                    f32View[offset32++] = uvBottom;

                    color.copyToRGBA(u8View, offset32++ * FLOAT_SIZE);

                    f32View[offset32++] = distanceFieldRange;
                    i32View[offset32++] = glyph.page + pageOffset;
                }

                // 2
                {
                    posVec.x = glyphX + scaledWidth;
                    posVec.y = glyphY + scaledHeight;
                    posVec.multiplyMat(world);

                    f32View[offset32++] = posVec.x;
                    f32View[offset32++] = posVec.y;
                    f32View[offset32++] = z;

                    f32View[offset32++] = uvRight;
                    f32View[offset32++] = uvTop;

                    color.copyToRGBA(u8View, offset32++ * FLOAT_SIZE);

                    f32View[offset32++] = distanceFieldRange;
                    i32View[offset32++] = glyph.page + pageOffset;
                }

                x += glyph.xAdvance * fontScale;
                processedGlyphs++;
            }
        }
    }
}
