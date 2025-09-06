import { BatchEntry, Batcher } from '../../rendering/batching';
import { TextureHandle } from '../../rendering/textures';
import { TexturedBatch, TexturedBatchEntry } from '../textured';
import { TexturedMeshLike } from '../textured-mesh';

/** @category Rendering - Textured Mesh */
export class MeshBatchEntry<O = TexturedMeshLike>
    extends BatchEntry<O>
    implements TexturedBatchEntry<O>
{
    texture?: TextureHandle;

    override reset(): void {
        super.reset();

        this.texture = undefined;
    }
}

/** @category Rendering - Textured Mesh */
export abstract class MeshBatchBase<
    O extends TexturedMeshLike = TexturedMeshLike,
    E extends MeshBatchEntry<O> = MeshBatchEntry<O>,
> extends TexturedBatch<O, E> {
    get vertexCount() {
        return this.size;
    }
}

/** @category Rendering */
export const DEFAULT_MAX_VERTEX_COUNT = 64_000;

/** @category Rendering */
export abstract class MeshBatcherBase<
    O extends TexturedMeshLike = TexturedMeshLike,
    E extends MeshBatchEntry<O> = MeshBatchEntry<O>,
    B extends MeshBatchBase<O, E> = MeshBatchBase<O, E>,
> extends Batcher<O, E, B> {
    protected maximums?: { maxTextureCount: number; maxVertexCount: number };

    get maxTextureCount() {
        return this.maximums?.maxTextureCount;
    }

    get maxVertexCount() {
        return this.maximums?.maxVertexCount;
    }

    setMaximums(maxTextureCount: number, maxVertexCount?: number): void {
        maxVertexCount ??= DEFAULT_MAX_VERTEX_COUNT;

        const hasBatches = this.batches.length > 0;

        if (hasBatches && this.maximums) {
            throw new Error(
                'Batcher already built batches. Clear batches built with previous maximums before changing thresholds.',
            );
        }

        this.maximums = { maxTextureCount, maxVertexCount };
    }

    protected override shouldRebuildBatch(batch: B): boolean {
        if (super.shouldRebuildBatch(batch)) {
            return true;
        }

        return batch.textureOrderChanged;
    }

    protected override canAddToBatch(
        entry: E,
        batch: B,
        additionalSize?: number,
    ): boolean {
        if (
            batch.textureCount >= this.maxTextureCount! &&
            !batch.hasTexture(entry.texture!)
        ) {
            return false;
        }

        if (typeof additionalSize === 'number') {
            return batch.vertexCount + additionalSize <= this.maxVertexCount!;
        }

        if (batch.vertexCount + entry.size > this.maxVertexCount!) {
            return false;
        }

        return true;
    }

    protected override changeEntry(entry: E, batch: B | undefined): void {
        const object = entry.object!;

        const texChanged = object.material.texture !== entry.texture;

        entry.texture = object.material.texture;
        entry.newSize = object.mesh.triangulatedVertexCount;

        if (!batch) {
            return;
        }

        if (texChanged && !batch.hasTexture(entry.texture)) {
            entry.checkCapacity = true;
        }
    }
}
