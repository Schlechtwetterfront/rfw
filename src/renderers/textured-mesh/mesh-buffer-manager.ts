import { BYTES_PER_VERTEX, TexturedMeshLike } from '.';
import { Color } from '../../colors';
import { Vec2 } from '../../math';
import { MAX_Z } from '../../rendering';
import {
    ElementByteBufferManager,
    ElementByteBuffersManager,
} from '../../rendering/buffers';
import { FLOAT_SIZE } from '../../util/sizes';

import { TextureIndexProvider } from '../../rendering/textures';
import { MeshBatchEntry, MeshBatchStorageFactory } from './mesh-batching';

export const buildMeshBatchStorage: MeshBatchStorageFactory<
    TexturedMeshLike
> = maxSize => new MeshBufferManager(maxSize);

const TEMP_VEC = Vec2.ZERO;
const TEMP_COLOR = Color.WHITE;

export class MeshBufferManager<
    O extends TexturedMeshLike,
> extends ElementByteBuffersManager<MeshBatchEntry<O>> {
    private buffer: ElementByteBufferManager;

    private readonly f32View: Float32Array;
    private readonly i32View: Int32Array;

    textureIndexProvider?: TextureIndexProvider;

    constructor(maxSize: number) {
        const buffer = new ElementByteBufferManager(maxSize, BYTES_PER_VERTEX);

        super([buffer]);

        this.buffer = buffer;

        this.f32View = new Float32Array(buffer.arrayBuffer);
        this.i32View = new Int32Array(buffer.arrayBuffer);
    }

    update(entry: MeshBatchEntry<O>, vertexOffset: number): void {
        const {
            f32View,
            i32View,
            buffer,
            buffer: { u8View },
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

        buffer.markChanged(vertexOffset, triangleVertexCount);

        const posVec = TEMP_VEC;
        const z = object.transform.z / MAX_Z;

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

            f32View[offset32++] = posVec.x;
            f32View[offset32++] = posVec.y;
            f32View[offset32++] = z;

            f32View[offset32++] = uv.x;
            f32View[offset32++] = uv.y;

            TEMP_COLOR.copyToRGBA(u8View, offset32++ * FLOAT_SIZE);

            i32View[offset32++] = texIndex;
        }
    }
}
