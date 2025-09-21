import { SPRITE_SIZES, SpriteLike } from '.';
import { Color } from '../../colors';
import { zToDepth } from '../../rendering';
import { ByteBuffer, ElementByteBufferManager } from '../../rendering/buffers';
import { TextureIndexProvider } from '../../rendering/textures';
import { FLOAT_SIZE } from '../../util';
import { MeshBatchEntry } from '../textured-mesh';

/** @category Rendering - Sprites */
export interface SpriteBatchBuffers {
    readonly buffer: ByteBuffer;
}

const TEMP_COLOR = Color.WHITE;

/** @category Rendering - Sprites */
export class SpriteBatchStorage<O extends SpriteLike> {
    private readonly float32View: Float32Array;
    private readonly int32View: Int32Array;

    readonly buffer: ElementByteBufferManager;

    constructor(
        maxElementCount: number,
        private readonly textureIndexProvider: TextureIndexProvider,
    ) {
        this.buffer = new ElementByteBufferManager(
            maxElementCount,
            SPRITE_SIZES.BYTES_PER_INSTANCE,
        );

        this.float32View = new Float32Array(this.buffer.arrayBuffer);
        this.int32View = new Int32Array(this.buffer.arrayBuffer);
    }

    update(entry: MeshBatchEntry<O>, instanceOffset: number): void {
        const {
            float32View,
            int32View,
            buffer,
            buffer: { uint8View },
        } = this;

        const {
            transform: { worldMatrix, z },
            textureRegion,
            material: { texture, color },
        } = entry.object!;

        const texIndex = this.textureIndexProvider?.getTextureIndex(texture);

        if (texIndex === undefined) {
            throw new Error(
                'Mesh texture must be included in texture index provider',
            );
        }

        buffer.markChanged(instanceOffset, instanceOffset + 1);

        const depth = zToDepth(z);

        const texWidth = texture.dimensions.x;
        const texHeight = texture.dimensions.y;

        let offset32 = (instanceOffset * SPRITE_SIZES.BYTES_PER_INSTANCE) / 4;

        float32View[offset32++] = worldMatrix.a;
        float32View[offset32++] = worldMatrix.b;
        float32View[offset32++] = worldMatrix.c;
        float32View[offset32++] = worldMatrix.d;
        float32View[offset32++] = worldMatrix.tx;
        float32View[offset32++] = worldMatrix.ty;
        float32View[offset32++] = textureRegion.width;
        float32View[offset32++] = textureRegion.height;
        float32View[offset32++] = depth;
        float32View[offset32++] = textureRegion.right / texWidth;
        float32View[offset32++] = textureRegion.top / texHeight;
        float32View[offset32++] = textureRegion.x / texWidth;
        float32View[offset32++] = textureRegion.y / texHeight;

        TEMP_COLOR.copyFrom(color);

        TEMP_COLOR.copyToRGBA(uint8View, offset32++ * FLOAT_SIZE);

        int32View[offset32++] = texIndex;
    }
}
