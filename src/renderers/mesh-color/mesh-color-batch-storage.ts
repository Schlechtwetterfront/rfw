import { MESH_COLOR_SIZES } from '.';
import { Color } from '../../colors';
import { Vec2 } from '../../math';
import { zToDepth } from '../../rendering';
import { ByteBuffer, ElementByteBufferManager } from '../../rendering/buffers';
import { TextureIndexProvider } from '../../rendering/textures';
import { FLOAT_SIZE } from '../../util';
import { MeshLike } from '../mesh';
import { MeshColorBatchEntry } from './mesh-color-batcher';

/** @category Rendering - Mesh */
export interface MeshColorBatchBuffers {
    readonly buffer: ByteBuffer;
    readonly colorBuffer: ByteBuffer;
}

const TEMP_VEC = Vec2.zero();
const TEMP_COLOR = Color.WHITE;

/** @category Rendering - Mesh */
export class MeshColorBatchStorage<O extends MeshLike> {
    private readonly float32View: Float32Array;
    private readonly int32View: Int32Array;

    readonly buffer: ElementByteBufferManager;

    readonly colorBuffer: ElementByteBufferManager;

    constructor(
        maxElementCount: number,
        private readonly textureIndexProvider: TextureIndexProvider,
    ) {
        this.buffer = new ElementByteBufferManager(
            maxElementCount,
            MESH_COLOR_SIZES.BYTES_PER_VERTEX_MAIN_BUFFER,
        );

        this.float32View = new Float32Array(this.buffer.arrayBuffer);
        this.int32View = new Int32Array(this.buffer.arrayBuffer);

        this.colorBuffer = new ElementByteBufferManager(
            maxElementCount,
            MESH_COLOR_SIZES.BYTES_PER_VERTEX_COLOR_BUFFER,
        );
    }

    update(entry: MeshColorBatchEntry<O>, vertexOffset: number): void {
        const { float32View, int32View, buffer, colorBuffer } = this;

        const colorUint8View = colorBuffer.uint8View;

        const object = entry.object!;

        if (entry.changed) {
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

            buffer.markChanged(
                vertexOffset,
                vertexOffset + triangleVertexCount,
            );

            colorBuffer.markChanged(
                vertexOffset,
                vertexOffset + triangleVertexCount,
            );

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

                let offset32 =
                    ((vertexOffset + i) *
                        MESH_COLOR_SIZES.BYTES_PER_VERTEX_MAIN_BUFFER) /
                    FLOAT_SIZE;

                posVec.copyFrom(position).multiplyMat(world);

                float32View[offset32++] = posVec.x;
                float32View[offset32++] = posVec.y;
                float32View[offset32++] = z;

                float32View[offset32++] = uv.x;
                float32View[offset32++] = uv.y;

                int32View[offset32++] = texIndex;

                TEMP_COLOR.copyToRGBA(
                    colorUint8View,
                    (vertexOffset + i) *
                        MESH_COLOR_SIZES.BYTES_PER_VERTEX_COLOR_BUFFER,
                );
            }
        } else if (entry.colorChanged) {
            const indices = object.mesh.indices;

            const triangleVertexCount = indices.length;

            colorBuffer.markChanged(
                vertexOffset,
                vertexOffset + triangleVertexCount,
            );

            for (let i = 0; i < triangleVertexCount; i++) {
                const index = indices[i]!;
                const { color: vertexColor } = object.mesh.vertices[index]!;

                TEMP_COLOR.copyFrom(vertexColor ?? object.material.color);

                TEMP_COLOR.copyToRGBA(
                    colorUint8View,
                    (vertexOffset + i) *
                        MESH_COLOR_SIZES.BYTES_PER_VERTEX_COLOR_BUFFER,
                );
            }
        }
    }
}
