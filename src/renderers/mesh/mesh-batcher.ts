import { MeshLike } from '.';
import { Pool } from '../../util';
import { MeshBatchStorage } from './mesh-batch-storage';
import {
    MeshBatchBase,
    MeshBatchEntry,
    MeshBatcherBase,
} from './mesh-batcher-base';

/** @category Rendering - Mesh */
export class MeshBatch<
    O extends MeshLike = MeshLike,
    E extends MeshBatchEntry<O> = MeshBatchEntry<O>,
> extends MeshBatchBase<O, E> {
    storage?: MeshBatchStorage<O>;
}

type E<O extends MeshLike> = MeshBatchEntry<O>;
type B<O extends MeshLike> = MeshBatch<O, E<O>>;

/** @category Rendering - Mesh */
export class MeshBatcher<O extends MeshLike = MeshLike> extends MeshBatcherBase<
    O,
    E<O>,
    B<O>
> {
    protected readonly entryPool = new Pool({
        create: () => new MeshBatchEntry<O>(),
        reset: e => e.reset(),
    });

    protected readonly batchPool = new Pool({
        create: () => new MeshBatch<O, E<O>>(),
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

        batch.storage = new MeshBatchStorage(
            this.maximums.maxVertexCount,
            batch,
        );
    }
}
