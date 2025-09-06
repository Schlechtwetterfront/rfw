import { FenwickTree } from '../../util/fenwick-tree';
import { BatchEntry } from './entry';

/**
 * A generic batch of objects.
 *
 * @category Rendering - Batching
 */
export class Batch<O, E extends BatchEntry<O> = BatchEntry<O>> {
    /**
     * Entries in this batch.
     *
     * Changes to this array must be done through the associated batcher ({@link Batcher#add},
     * {@link Batcher#change}, {@link Batcher#delete}).
     */
    readonly entries: E[] = [];

    /** Ordered array of entries that have a change queued. */
    readonly queuedChanges: E[] = [];

    /** Acceleration structure to speed up offset lookups when applying changes non-sequentially. */
    readonly sizes = new FenwickTree();

    /** Batch size. Unit depends on how the batch is used in its batcher. */
    size = 0;

    /**
     * Add an entry to the batch.
     * @param entry - Entry to add
     * @returns Self
     */
    addEntry(entry: E): this {
        if (!entry.object) {
            throw new Error('Batch entry has no object');
        }

        entry.index = this.entries.length;

        this.sizes.add(this.entries.length, entry.newSize);
        this.entries.push(entry);

        this.size += entry.newSize;

        return this;
    }

    /**
     * Called when an entry is removed from the batch.
     * @param entry - Deleted entry
     */
    onDeleteEntry(entry: E): void {
        entry.batchIndex = -1;
        entry.index = -1;
    }

    /**
     * Clear all data from this batch.
     */
    clear(): void {
        this.size = 0;
        this.sizes.clear();
        this.entries.length = 0;
        this.queuedChanges.length = 0;
    }
}
