import { ChangeTracker } from '../../app/change-tracking';
import { SizedObject } from '../../scene';
import { Pool } from '../../util/pool';
import { Batch } from './batch';
import { Batcher } from './batcher';
import {
    BatchEntry,
    BatchEntryChange,
    createBatchEntry,
    resetBatchEntry,
} from './entry';
import { BatchStorage, BatchStorageFactory } from './storage';

/** @category Rendering - Batching */
export interface SizedBatcherOptions<O, S extends BatchStorage<BatchEntry<O>>> {
    maxSize?: number;
    batchStorageFactory: BatchStorageFactory<BatchEntry<O>, S>;
    changeTracker: ChangeTracker;
}

/**
 * Batcher that batches only on a size criterium. The unit of the size can be anything (vertices,
 * line segments, glyphs, ...).
 *
 * @category Rendering - Batching
 */
export class SizedBatcher<
    O extends SizedObject,
    S extends BatchStorage<BatchEntry<O>>,
> extends Batcher<O, BatchEntry<O>, Batch<O, BatchEntry<O>, S>> {
    constructor(options: SizedBatcherOptions<O, S>) {
        const maxSize = options?.maxSize ?? 64_000;

        const entryPool = new Pool({
            create: () => {
                return createBatchEntry<O>({});
            },
            reset: e => {
                resetBatchEntry(e);
            },
        });

        const batchPool = new Pool({
            create: () =>
                new Batch<O, BatchEntry<O>, S>(
                    options.batchStorageFactory(maxSize),
                    entryPool,
                ),
            reset: b => b.clear(),
        });

        super(maxSize, entryPool, batchPool, options.changeTracker);
    }

    /** @inheritdoc */
    add(object: O): this {
        if (this.has(object)) {
            return this;
        }

        const entry = this.entryPool.take();

        entry.object = object;
        entry.size = object.size;
        entry.newSize = object.size;

        this.addEntryQueued(entry);

        return this;
    }

    protected override changeEntry(
        batch: Batch<O> | undefined,
        entry: BatchEntry<O>,
        object: O,
    ): void {
        const sizeChanged = object.size !== entry.size;
        const sizeDiff = object.size - entry.size;

        entry.newSize = object.size;

        if (!batch) {
            return;
        }

        if (sizeChanged) {
            if (sizeDiff > 0 && batch.size + sizeDiff > this.maxSize) {
                batch.change(entry, BatchEntryChange.DELETE);

                this.add(object);
            } else {
                batch.change(entry, BatchEntryChange.SIZE_DECREASE);
            }
        } else {
            batch.change(entry, BatchEntryChange.CONTENT);
        }
    }

    protected override addToBatch(batch: Batch<O>, entry: BatchEntry<O>): void {
        batch.add(entry);
    }

    protected override canBatchInclude(
        batch: Batch<O>,
        entry: BatchEntry<O>,
    ): boolean {
        if (batch.size + entry.size > this.maxSize) {
            return false;
        }

        return true;
    }
}
