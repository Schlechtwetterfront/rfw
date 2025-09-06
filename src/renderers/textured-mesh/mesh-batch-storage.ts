import { Color } from '../../colors';
import { Vec2 } from '../../math';
import { zToDepth } from '../../rendering';
import { ByteBuffer, ElementByteBufferManager } from '../../rendering/buffers';
import { TextureIndexProvider } from '../../rendering/textures';
import { FLOAT_SIZE } from '../../util';
import { BYTES_PER_VERTEX, TexturedMeshLike } from '../textured-mesh';
import { MeshBatchEntry } from './mesh-batcher-base';

const TEMP_VEC = Vec2.zero();
const TEMP_COLOR = Color.white();

/** @category Rendering - Textured Mesh */
export interface MeshBatchBuffers {
    readonly buffer: ByteBuffer;
}

/** @category Rendering - Textured Mesh */
export class MeshBatchStorage<O extends TexturedMeshLike> {
    private readonly float32View: Float32Array;
    private readonly int32View: Int32Array;

    readonly buffer: ElementByteBufferManager;

    constructor(
        maxElementCount: number,
        private readonly textureIndexProvider: TextureIndexProvider,
    ) {
        this.buffer = new ElementByteBufferManager(
            maxElementCount,
            BYTES_PER_VERTEX,
        );

        this.float32View = new Float32Array(this.buffer.arrayBuffer);
        this.int32View = new Int32Array(this.buffer.arrayBuffer);
    }

    update(entry: MeshBatchEntry<O>, vertexOffset: number): void {
        const {
            float32View,
            int32View,
            buffer,
            buffer: { uint8View },
        } = this;

        const object = entry.object!;

        const world = object.transform.worldMatrix;
        const texIndex = this.textureIndexProvider?.getTextureIndex(
            object.material.texture,
        );

        if (texIndex === undefined) {
            throw new Error(
                'Mesh texture must be included in texture index provider',
            );
        }

        const indices = object.mesh.indices;

        const triangleVertexCount = indices.length;

        buffer.markChanged(vertexOffset, vertexOffset + triangleVertexCount);

        const posVec = TEMP_VEC;
        const z = zToDepth(object.transform.z);

        for (let i = 0; i < triangleVertexCount; i++) {
            const index = indices[i]!;
            const {
                position,
                uv,
                color: vertexColor,
            } = object.mesh.vertices[index]!;

            TEMP_COLOR.copyFrom(vertexColor ?? object.material.color);

            let offset32 = ((vertexOffset + i) * BYTES_PER_VERTEX) / FLOAT_SIZE;

            posVec.copyFrom(position).multiplyMat(world);

            float32View[offset32++] = posVec.x;
            float32View[offset32++] = posVec.y;
            float32View[offset32++] = z;

            float32View[offset32++] = uv.x;
            float32View[offset32++] = uv.y;

            TEMP_COLOR.copyToRGBA(uint8View, offset32++ * FLOAT_SIZE);

            int32View[offset32++] = texIndex;
        }
    }
}
