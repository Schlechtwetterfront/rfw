import {
    BYTES_PER_GLYPH,
    BYTES_PER_GLYPH_VERTEX,
    FontTextureIndexProvider,
} from '.';
import { Vec2 } from '../../math';
import { zToDepth } from '../../rendering';
import { ByteBuffer, ElementByteBufferManager } from '../../rendering/buffers';
import { FLOAT_SIZE } from '../../util';
import { TextBatchEntry } from './text-batcher';

const TEMP_VEC = Vec2.zero();
const TEMP_VEC2 = Vec2.zero();

/** @category Rendering - Text */
export interface TextBatchBuffers {
    readonly buffer: ByteBuffer;
}

/** @category Rendering - Text */
export class TextBatchStorage {
    private readonly float32View: Float32Array;
    private readonly int32View: Int32Array;

    readonly buffer: ElementByteBufferManager;

    constructor(
        maxElementCount: number,
        private readonly textureIndexProvider: FontTextureIndexProvider,
    ) {
        this.buffer = new ElementByteBufferManager(
            maxElementCount,
            BYTES_PER_GLYPH_VERTEX,
        );

        this.float32View = new Float32Array(this.buffer.arrayBuffer);
        this.int32View = new Int32Array(this.buffer.arrayBuffer);
    }

    update(entry: TextBatchEntry, glyphOffset: number): void {
        const {
            float32View,
            buffer,
            buffer: { uint8View: u8View },
            int32View,
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

                    float32View[offset32++] = posVec.x;
                    float32View[offset32++] = posVec.y;
                    float32View[offset32++] = z;

                    float32View[offset32++] = uvLeft;
                    float32View[offset32++] = uvBottom;

                    color.copyToRGBA(u8View, offset32++ * FLOAT_SIZE);

                    float32View[offset32++] = distanceFieldRange;
                    int32View[offset32++] = glyph.page + pageOffset;
                }

                // 3
                {
                    posVec.x = glyphX;
                    posVec.y = glyphY + scaledHeight;
                    posVec.multiplyMat(world);

                    float32View[offset32++] = posVec.x;
                    float32View[offset32++] = posVec.y;
                    float32View[offset32++] = z;

                    float32View[offset32++] = uvLeft;
                    float32View[offset32++] = uvTop;

                    color.copyToRGBA(u8View, offset32++ * FLOAT_SIZE);

                    float32View[offset32++] = distanceFieldRange;
                    int32View[offset32++] = glyph.page + pageOffset;
                }

                // 1
                {
                    posVec.x = glyphX + scaledWidth;
                    posVec.y = glyphY;
                    posVec.multiplyMat(world);

                    float32View[offset32++] = posVec.x;
                    float32View[offset32++] = posVec.y;
                    float32View[offset32++] = z;

                    float32View[offset32++] = uvRight;
                    float32View[offset32++] = uvBottom;

                    color.copyToRGBA(u8View, offset32++ * FLOAT_SIZE);

                    float32View[offset32++] = distanceFieldRange;
                    int32View[offset32++] = glyph.page + pageOffset;
                }

                // 3
                {
                    posVec.x = glyphX;
                    posVec.y = glyphY + scaledHeight;
                    posVec.multiplyMat(world);

                    float32View[offset32++] = posVec.x;
                    float32View[offset32++] = posVec.y;
                    float32View[offset32++] = z;

                    float32View[offset32++] = uvLeft;
                    float32View[offset32++] = uvTop;

                    color.copyToRGBA(u8View, offset32++ * FLOAT_SIZE);

                    float32View[offset32++] = distanceFieldRange;
                    int32View[offset32++] = glyph.page + pageOffset;
                }

                // 1
                {
                    posVec.x = glyphX + scaledWidth;
                    posVec.y = glyphY;
                    posVec.multiplyMat(world);

                    float32View[offset32++] = posVec.x;
                    float32View[offset32++] = posVec.y;
                    float32View[offset32++] = z;

                    float32View[offset32++] = uvRight;
                    float32View[offset32++] = uvBottom;

                    color.copyToRGBA(u8View, offset32++ * FLOAT_SIZE);

                    float32View[offset32++] = distanceFieldRange;
                    int32View[offset32++] = glyph.page + pageOffset;
                }

                // 2
                {
                    posVec.x = glyphX + scaledWidth;
                    posVec.y = glyphY + scaledHeight;
                    posVec.multiplyMat(world);

                    float32View[offset32++] = posVec.x;
                    float32View[offset32++] = posVec.y;
                    float32View[offset32++] = z;

                    float32View[offset32++] = uvRight;
                    float32View[offset32++] = uvTop;

                    color.copyToRGBA(u8View, offset32++ * FLOAT_SIZE);

                    float32View[offset32++] = distanceFieldRange;
                    int32View[offset32++] = glyph.page + pageOffset;
                }

                x += glyph.xAdvance * fontScale;
                processedGlyphs++;
            }
        }
    }
}
