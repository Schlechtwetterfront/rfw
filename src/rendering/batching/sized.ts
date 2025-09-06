import { Pool } from '../..';
import { SizedObject } from '../../scene';
import { Batch } from './batch';
import { Batcher } from './batcher';
import { BatchEntry } from './entry';

/** @category Rendering - Batching */
export abstract class SizedBatcher<O extends SizedObject> extends Batcher<
    O,
    BatchEntry<O>,
    Batch<O, BatchEntry<O>>
> {
    protected readonly entryPool = new Pool({
        create: () => new BatchEntry<O>(),
        reset: e => e.reset(),
    });

    protected maximums?: { maxSize: number };

    get maxSize() {
        return this.maximums?.maxSize;
    }

    setMaximums(maxSize: number): void {
        const hasBatches = this.batches.length > 0;

        if (hasBatches && this.maximums) {
            throw new Error(
                'Batcher already built batches. Clear batches built with previous maximums before changing thresholds.',
            );
        }

        this.maximums = { maxSize };
    }

    protected override canAddToBatch(
        entry: BatchEntry<O>,
        batch: Batch<O, BatchEntry<O>>,
        additionalSize?: number,
    ): boolean {
        if (typeof additionalSize === 'number') {
            return batch.size + additionalSize <= this.maxSize!;
        }

        if (batch.size + entry.size > this.maxSize!) {
            return false;
        }

        return true;
    }

    protected override createEntry(object: O): BatchEntry<O> {
        const entry = this.entryPool.take();

        entry.object = object;
        entry.size = entry.newSize = object.size;

        return entry;
    }

    protected override discardEntry(entry: BatchEntry<O>): void {
        this.entryPool.return(entry);
    }

    protected override changeEntry(
        entry: BatchEntry<O>,
        batch: Batch<O, BatchEntry<O>> | undefined,
    ): void {
        const object = entry.object!;

        entry.newSize = object.size;
    }
}
