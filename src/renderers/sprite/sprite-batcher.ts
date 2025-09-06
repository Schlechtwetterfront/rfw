import { SpriteLike } from '.';
import { Pool } from '../../util';
import { SpriteBatchStorage } from './sprite-batch-storage';
import {
    SpriteBatchBase,
    SpriteBatchEntry,
    SpriteBatcherBase,
} from './sprite-batcher-base';

/** @category Rendering - Sprites */
export class SpriteBatch<
    O extends SpriteLike = SpriteLike,
    E extends SpriteBatchEntry<O> = SpriteBatchEntry<O>,
> extends SpriteBatchBase<O, E> {
    storage?: SpriteBatchStorage<O>;
}

type E<O extends SpriteLike> = SpriteBatchEntry<O>;
type B<O extends SpriteLike> = SpriteBatch<O, E<O>>;

/** @category Rendering - Sprites */
export class SpriteBatcher<
    O extends SpriteLike = SpriteLike,
> extends SpriteBatcherBase<O, E<O>, B<O>> {
    protected readonly entryPool = new Pool({
        create: () => new SpriteBatchEntry<O>(),
        reset: e => e.reset(),
    });

    protected readonly batchPool = new Pool({
        create: () => new SpriteBatch<O, E<O>>(),
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
        entry.size = entry.newSize = 1;
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

        batch.storage = new SpriteBatchStorage(
            this.maximums.maxSpriteCount,
            batch,
        );
    }
}
