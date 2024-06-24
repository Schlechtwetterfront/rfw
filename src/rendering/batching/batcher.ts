import { ChangeTracker } from '../../app/change-tracking';
import { ObjectSet } from '../../collections';
import { Pool } from '../../util/pool';
import { Batch } from './batch';
import { BatchEntry, BatchEntryChange } from './entry';

/**
 * Manages a collection of objects and distributes them into a set of batches, based on batcher-specific
 * criteria (like size, number of textures, ...).
 *
 * @remarks
 * A new batcher derived from {@link Batcher} must:
 *
 * 1. Define an `add` method. There is no default/overridable `add` method because the needs of a
 *    batcher can change it.
 *    This method should ultimately call {@link Batcher.addEntryQueued}.
 * 2. Implement {@link Batcher.changeEntry}.
 *    It is the job of the batcher to find out what actually changed after a consumer calls
 *    {@link Batcher.change}.
 *    Any actual change must then be propagated to the batch and optionally stored in the entry.
 * 3. Implement {@link Batcher.addToBatch}.
 *    Adds an entry to a batch, with any additional data necessary.
 * 4. Implement {@link Batcher.canBatchInclude}.
 *    Returns if a batch can fit the given entry.
 *
 * Implementing these allows for batching on many different criteria.
 *
 * Depending on what is being batched and what the criteria for when a batch is 'full' are, derived
 * versions of {@link Batch} and {@link BatchEntry} may be necessary.
 */
export abstract class Batcher<
    O extends WeakKey,
    E extends BatchEntry<O> = BatchEntry<O>,
    B extends Batch<O, E> = Batch<O, E>,
> implements ObjectSet<O>
{
    protected readonly _batches: B[] = [];

    /** Newly added entries are queued until all changes are applied to a batch. */
    protected readonly queuedAdds: E[] = [];

    /** For faster lookup of object -> batch. */
    protected objectBatches = new WeakMap<O, B>();

    /**
     * Batches. All batches in this collection are at least partially occupied.
     */
    readonly batches: readonly B[] = this._batches;

    /**
     * Create a new instance.
     * @param maxSize - Max size of a batch. Unit depends on batcher.
     * @param entryPool - Object pool for batch entries
     * @param batchPool - Object pool for batches
     * @param changeTracker - Changes to objects will be propagated to the change tracker
     */
    constructor(
        public readonly maxSize: number,
        protected readonly entryPool: Pool<E>,
        protected readonly batchPool: Pool<B>,
        protected readonly changeTracker: ChangeTracker,
    ) {}

    /**
     * Add an object to the batcher.
     * @param object - Object to add
     */
    abstract add(object: O): this;

    /**
     * Queue an entry for adding. Apply with {@link Batcher.finalize}.
     * @param entry - Entry to add
     */
    protected addEntryQueued(entry: E): void {
        this.queuedAdds.push(entry);

        this.changeTracker.registerChange();
    }

    /**
     * Check if `object` is part of this batcher.
     * @param object - Object
     * @returns `true` if batcher contains the object
     */
    has(object: O): boolean {
        const { queuedAdds } = this;

        const batch = this.objectBatches.get(object);
        const entry = batch?.getEntry(object);

        if (entry) {
            return true;
        }

        for (let i = 0; i < queuedAdds.length; i++) {
            const entry = queuedAdds[i]!;

            if (entry.object === object) {
                return true;
            }
        }

        return false;
    }

    /**
     * Mark an object as changed. Changes are queued, apply with {@link Batcher.finalize}.
     * @param object - Changed object
     */
    change(object: O): void {
        const { queuedAdds } = this;

        const batch = this.objectBatches.get(object);

        const entry = batch?.getEntry(object);

        if (entry) {
            this.changeEntry(batch, entry, object);

            this.changeTracker.registerChange();

            return;
        }

        for (let i = 0; i < queuedAdds.length; i++) {
            const entry = queuedAdds[i]!;

            if (entry.object === object) {
                this.changeEntry(undefined, entry, object);

                this.changeTracker.registerChange();

                return;
            }
        }
    }

    /**
     * Delete an object and its entry. Deletes are queued, apply with {@link Batcher.finalize}.
     * @param object - Object to delete
     * @returns `true` if an entry was deleted
     */
    delete(object: O): boolean {
        const { queuedAdds } = this;

        const batch = this.objectBatches.get(object);

        this.objectBatches.delete(object);

        const entry = batch?.getEntry(object);

        if (entry) {
            batch!.change(entry, BatchEntryChange.DELETE);

            this.changeTracker.registerChange();

            return true;
        }

        for (let i = 0; i < queuedAdds.length; i++) {
            const entry = queuedAdds[i]!;

            if (entry.object === object) {
                queuedAdds.splice(i, 1);

                return true;
            }
        }

        return false;
    }

    clear(): void {
        const { _batches } = this;

        this.objectBatches.clear();

        this.queuedAdds.length = 0;

        for (let i = 0; i < _batches.length; i++) {
            const batch = _batches[i]!;

            this.batchPool.return(batch);
        }

        _batches.length = 0;
    }

    /**
     * Finalize batches for this tick by applying all queued changes, adding all queued new entries,
     * and cleaning up unused batches.
     * @returns Finalized batches
     */
    finalize(): readonly B[] {
        const { _batches: batches, queuedAdds } = this;

        for (let i = 0; i < batches.length; i++) {
            batches[i]!.update();
        }

        addEntries: for (let i = 0; i < queuedAdds.length; i++) {
            const entry = queuedAdds[i]!;

            let batchWithSpace: B | undefined;

            for (let j = 0; j < batches.length; j++) {
                const batch = batches[j]!;

                if (!batchWithSpace && this.canBatchInclude(batch, entry)) {
                    batchWithSpace = batch;
                }

                if (batch.hasObject(entry.object!)) {
                    this.entryPool.return(entry);
                    continue addEntries;
                }
            }

            if (!batchWithSpace) {
                batchWithSpace = this.batchPool.take();
                this._batches.push(batchWithSpace);
            }

            this.addToBatch(batchWithSpace, entry);
            this.objectBatches.set(entry.object!, batchWithSpace);
        }

        queuedAdds.length = 0;

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i]!;

            if (batch.entries.length === 0) {
                this.batchPool.return(batch);

                const lastIndex = batches.length - 1;

                // Swap and continue at same index
                if (lastIndex > i) {
                    batches[i] = batches[lastIndex]!;
                    batches.length--;
                    i--;
                }
            }
        }

        return this.batches;
    }

    /**
     * Apply changes of an object to its entry (and possible batch).
     * @param batch - Batch entry belongs to. Can be `undefined` in case entry does not have a batch
     * (e.g., when only queued for an add)
     * @param entry - Entry to change
     * @param object - Associated object
     */
    protected abstract changeEntry(
        batch: B | undefined,
        entry: E,
        object: O,
    ): void;

    /**
     * Add an entry to a batch.
     * @param batch - Batch to add entry to
     * @param entry - Entry to add
     */
    protected abstract addToBatch(batch: B, entry: E): void;

    /**
     * Check if a batch can contain an entry.
     * @param batch - Batch to check
     * @param entry - Entry
     */
    protected abstract canBatchInclude(batch: B, entry: E): boolean;
}
