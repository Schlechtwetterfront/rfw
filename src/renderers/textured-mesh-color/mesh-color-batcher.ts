import { Pool } from '../../util';
import {
    MeshBatchBase,
    MeshBatchEntry,
    MeshBatcherBase,
    TexturedMeshLike,
} from '../textured-mesh';
import { MeshColorBatchStorage } from './mesh-color-batch-storage';

/** @category Rendering - Textured Mesh */
export class MeshColorBatchEntry<
    O extends TexturedMeshLike = TexturedMeshLike,
> extends MeshBatchEntry<O> {
    onlyColorChanged = false;

    override reset(): void {
        super.reset();

        this.onlyColorChanged = false;
    }
}

/** @category Rendering - Textured Mesh */
export class MeshColorBatch<
    O extends TexturedMeshLike = TexturedMeshLike,
    E extends MeshColorBatchEntry<O> = MeshColorBatchEntry<O>,
> extends MeshBatchBase<O, E> {
    storage?: MeshColorBatchStorage<O>;
}

type E<O extends TexturedMeshLike> = MeshColorBatchEntry<O>;
type B<O extends TexturedMeshLike> = MeshColorBatch<O, E<O>>;

/** @category Rendering - Textured Mesh */
export class MeshColorBatcher<
    O extends TexturedMeshLike = TexturedMeshLike,
> extends MeshBatcherBase<O, E<O>, B<O>> {
    protected readonly entryPool = new Pool({
        create: () => new MeshColorBatchEntry<O>(),
        reset: e => e.reset(),
    });

    protected readonly batchPool = new Pool({
        create: () => new MeshColorBatch<O, E<O>>(),
    });

    protected override applyBatchChanges(batch: B<O>): void {
        batch.storage?.buffer.clearChange();

        super.applyBatchChanges(batch);

        batch.textureOrderChanged = false;
    }

    protected override createBatch(): B<O> {
        return this.batchPool.take();
    }

    protected override discardBatch(batch: B<O>): void {
        this.clearBatch(batch);

        this.batchPool.return(batch);
    }

    protected override createEntry(object: O): E<O> {
        const entry = this.entryPool.take();

        entry.object = object;
        entry.size = entry.newSize = object.mesh.triangulatedVertexCount;
        entry.texture = object.material.texture;

        return entry;
    }

    protected override discardEntry(entry: E<O>): void {
        this.entryPool.return(entry);
    }

    protected override applyEntryChange(
        entry: E<O>,
        batch: B<O>,
        offset: number,
    ): void {
        this.ensureBatchStorage(batch);

        batch.storage!.update(entry, offset);

        entry.onlyColorChanged = false;

        super.applyEntryChange(entry, batch, offset);
    }

    protected override copyWithinStorage(
        batch: B<O>,
        target: number,
        start: number,
        end: number,
    ): void {
        this.ensureBatchStorage(batch);

        batch.storage!.buffer.copyWithin(target, start, end);
    }

    private ensureBatchStorage(batch: B<O>) {
        if (batch.storage) {
            return;
        }

        if (!this.maximums) {
            throw new Error('Thresholds must be initialized.');
        }

        batch.storage = new MeshColorBatchStorage(
            this.maximums.maxVertexCount,
            batch,
        );
    }
}
