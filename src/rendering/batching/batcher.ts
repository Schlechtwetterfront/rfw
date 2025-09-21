import { ChangeTracker } from '../../app';
import { swapDeleteAt } from '../../util';
import { Batch } from './batch';
import { BatchEntry } from './entry';

/**
 * @category Rendering - Batching
 */
export type EntryFn<O, E extends BatchEntry<O>, B extends Batch<O, E>> = (
    entry: E,
    batch: B | undefined,
) => void;

/**
 * Get entry of a batcher.
 *
 * @category Rendering - Batching
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EntryOf<Br> = Br extends Batcher<any, infer E, any> ? E : never;

/**
 * Manages a collection of objects and distributes them into a set of batches, based on batcher-specific
 * criteria (like size, number of textures, ...).
 *
 * @remarks
 * A new batcher derived from {@link Batcher} should:
 *
 * 1. Implement abstract methods.
 * 2. Provide a storage (some type of buffer that can then be used in rendering).
 * 3. Possibly override {@link Batcher#applyBatchChanges} to reset any marked changes in storage.
 * 4. Override {@link Batcher#applyEntryChange} to apply change to storage.
 *
 * Depending on what is being batched and what the criteria for when a batch is 'full' are, derived
 * versions of {@link Batch} and {@link BatchEntry} may be necessary.
 *
 * @category Rendering - Batching
 */
export abstract class Batcher<
    O,
    E extends BatchEntry<O>,
    B extends Batch<O, E>,
> {
    /** Batches. All batches in this collection are at least partially occupied. */
    protected readonly batches: B[] = [];

    /** New entries are queued until all changes are applied to a batch. */
    protected readonly queuedEntries: E[] = [];

    /** Entries across all batches. Does not respect queued adds/deletes. */
    get size() {
        const { batches } = this;

        let size = 0;

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i]!;

            size += batch.entries.length;
        }

        return size;
    }

    /**
     * Create a new instance.
     * @param changeTracker - Changes to objects will be propagated to the change tracker
     */
    constructor(protected readonly changeTracker: ChangeTracker) {}

    /**
     * Add an object to the batcher. Additions are queued, apply with {@link Batcher#finalize}.
     * @param object - Object to add
     * @returns Created entry
     * @remarks
     * If called more than once with the same object, more than one entry will be created.
     */
    add(object: O): E {
        const entry = this.createEntry(object);

        this.queueEntry(entry);

        return entry;
    }

    /**
     * Find an entry for `object` by doing a linear search through all batches and entries.
     * @param object - Object to find entry for
     * @returns First entry, if present
     * @remarks
     * If {@link Batcher#add} was called multiple times with the same object, multiple entries can
     * exist for the same object. In this case this method returns only the first entry it finds.
     *
     * Generally, the returned entry from {@link Batcher#add} should be stored to then reuse it for
     * {@link Batcher#change} and {@link Batcher#change} calls.
     */
    getEntry(object: O): E | undefined {
        const { batches } = this;
        const batchCount = batches.length;

        for (let batchIndex = 0; batchIndex < batchCount; batchIndex++) {
            const batch = batches[batchIndex]!;

            const entries = batch.entries;
            const entryCount = entries.length;

            for (let entryIndex = 0; entryIndex < entryCount; entryIndex++) {
                const entry = entries[entryIndex]!;

                if (entry.object === object) {
                    return entry;
                }
            }
        }

        const { queuedEntries } = this;
        const entryCount = queuedEntries.length;

        for (let i = 0; i < entryCount; i++) {
            const queuedEntry = queuedEntries[i]!;

            if (queuedEntry.object === object) {
                return queuedEntry;
            }
        }

        return undefined;
    }

    /**
     * Mark an entry as changed. Changes are queued, apply with {@link Batcher#finalize}.
     * @param entry - Changed entry
     * @returns `true` if the entry was present
     * @remarks
     * Change handling code for the given entry will only be called once, even if this method is
     * called multiple times with the same entry.
     */
    change(entry: E): boolean {
        const batch =
            entry.batchIndex >= 0 ? this.batches[entry.batchIndex] : undefined;

        if (batch) {
            this.changeEntry(entry, batch);
            this.queueEntryChange(entry, batch);

            return true;
        }

        const { queuedEntries } = this;
        const entryCount = queuedEntries.length;

        for (let i = 0; i < entryCount; i++) {
            const queuedEntry = queuedEntries[i]!;

            if (queuedEntry === entry) {
                this.changeEntry(queuedEntry, undefined);

                return true;
            }
        }

        return false;
    }

    /**
     * Delete an entry. Deletes are queued unless the entry is itself queued for add, apply with
     * {@link Batcher#finalize}.
     * @param entry - Entry
     * @returns `true` if an entry was deleted/queued
     * @remarks
     * Deletion be done once, even if this method is called multiple times with the same entry.
     */
    delete(entry: E): boolean {
        const batch =
            entry.batchIndex >= 0 ? this.batches[entry.batchIndex] : undefined;

        if (batch) {
            entry.delete = true;

            this.queueEntryChange(entry, batch);

            return true;
        }

        const { queuedEntries } = this;
        const entryCount = queuedEntries.length;

        for (let i = 0; i < entryCount; i++) {
            const queuedEntry = queuedEntries[i]!;

            if (queuedEntry === entry) {
                swapDeleteAt(queuedEntries, i);

                return true;
            }
        }

        return false;
    }

    /**
     * Clear batcher of all batches and entries.
     */
    clear(): void {
        const { batches } = this;

        this.queuedEntries.length = 0;

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i]!;

            this.discardBatch(batch);
        }

        batches.length = 0;

        this.changeTracker.registerChange();
    }

    /**
     * Applies all queued additions, changes, and deletions.
     * @returns Finalized batches
     */
    finalize(): readonly B[] {
        this.applyQueuedChanges();

        this.applyQueuedEntries();

        this.discardBatches();

        return this.batches;
    }

    /**
     * Apply all queued changes.
     */
    protected applyQueuedChanges(): void {
        const { batches } = this;

        const batchCount = batches.length;

        let batchIndex = 0;

        while (batchIndex < batchCount) {
            const batch = batches[batchIndex]!;

            this.updateBatch(batch);

            batchIndex++;
        }
    }

    /**
     * Update batch. Should call either {@link Batcher#rebuildBatch} or
     * {@link Batcher#applyBatchChanges}.
     * @param batch - Batch
     */
    protected updateBatch(batch: B): void {
        if (this.shouldRebuildBatch(batch)) {
            this.rebuildBatch(batch);
        } else {
            this.applyBatchChanges(batch);
        }
    }

    /**
     * Completely rebuild batch, going through all entries.
     * @param batch - Batch
     */
    protected rebuildBatch(batch: B): void {
        const { entries, sizes } = batch;

        sizes.clear();

        let entryCount = entries.length;

        let offset = 0;

        for (let i = 0; i < entryCount; i++) {
            const entry = entries[i]!;

            entry.index = i;

            if (entry.delete) {
                swapDeleteAt(entries, i);

                this.onDeleteEntry(entry, batch);

                // Process swapped entry next iteration.
                i--;
                entryCount--;
            } else {
                this.applyEntryChange(entry, batch, offset);

                sizes.add(i, entry.size);

                offset += entry.size;
            }
        }

        batch.size = offset;
        batch.queuedChanges.length = 0;
    }

    /**
     * Apply only entries with queued changes. Entries in between will may be moved if gaps occur or
     * space is needed.
     * @param batch - Batch
     */
    protected applyBatchChanges(batch: B): void {
        const queuedChanges = batch.queuedChanges;
        const changeCount = batch.queuedChanges.length;

        queuedChanges.sort((a, b) => a.index - b.index);

        let changeIndex = 0;
        let entryIndex = -1;
        let sameIndex = false;

        while (changeIndex < changeCount) {
            const entry = queuedChanges[changeIndex]!;

            // An entry can appear twice in the change list if:
            // - we swapped in an entry during deletion,
            // - or the entry was marked as changed more than once.
            // As the change array is sorted by index, we can compare to the last iteration's index
            // and ignore.
            // Sometimes the same index will be reused (e.g. when swapping during deletion), this is
            // marked via `sameIndex`.
            if (entryIndex >= entry.index && !sameIndex) {
                changeIndex++;

                continue;
            }

            entryIndex = entry.index;
            sameIndex = false;

            const offset = batch.sizes.sumToIncluding(entryIndex) - entry.size;

            // Delete
            if (entry.delete) {
                const swappedEntry = swapDeleteAt(batch.entries, entryIndex);

                batch.sizes.set(batch.entries.length, 0);

                // If undefined, we're at the last element.
                if (swappedEntry) {
                    // Swapped entry now has index of deleted entry, so it must also be processed
                    // at this point.
                    queuedChanges[changeIndex] = swappedEntry;
                    swappedEntry.index = entryIndex;
                    sameIndex = true;

                    batch.size -= swappedEntry.newSize - swappedEntry.size;

                    if (!swappedEntry.delete) {
                        if (entry.size !== swappedEntry.newSize) {
                            // Move all data to the right of this entry so it's adjacent to the
                            // swapped entry's boundary.
                            this.copyWithinStorage(
                                batch,
                                offset + swappedEntry.newSize,
                                offset + entry.size,
                                // No need to copy the data at the end that previously belonged to
                                // the swapped entry.
                                batch.size - swappedEntry.size,
                            );
                        }

                        // Data was already moved around to have exactly newSize space.
                        swappedEntry.size = swappedEntry.newSize;

                        batch.sizes.set(entryIndex, swappedEntry.size);
                    }
                }

                batch.size -= entry.size;

                this.onDeleteEntry(entry, batch);

                // Continue with same change index because swapped entry is now at this index.
                if (swappedEntry) {
                    continue;
                }
            }
            // Only contents changed.
            else if (entry.newSize === entry.size) {
                // If entry now exceeds capacity, delete it from this batch and queue for addition,
                if (entry.checkCapacity && !this.canAddToBatch(entry, batch)) {
                    entry.delete = true;

                    queuedChanges[changeIndex] = entry;
                    sameIndex = true;

                    this.queueEntry(this.createEntry(entry.object!));

                    continue;
                }

                this.applyEntryChange(entry, batch, offset);
            }
            // Size decreased.
            else if (entry.newSize < entry.size) {
                const sizeDiff = entry.size - entry.newSize;

                // If entry now exceeds capacity, delete it from this batch and queue for addition,
                if (entry.checkCapacity && !this.canAddToBatch(entry, batch)) {
                    entry.delete = true;

                    queuedChanges[changeIndex] = entry;
                    sameIndex = true;

                    this.queueEntry(this.createEntry(entry.object!));

                    continue;
                }

                // Move data from right to fill gap.
                this.copyWithinStorage(
                    batch,
                    offset + entry.newSize,
                    offset + entry.size,
                    batch.size,
                );

                this.applyEntryChange(entry, batch, offset);

                batch.sizes.add(entryIndex, -sizeDiff);

                batch.size -= sizeDiff;
            }
            // Size increased..
            else if (entry.newSize > entry.size) {
                const additionalSize = entry.newSize - entry.size;

                // Size might exceed current batch.
                if (!this.canAddToBatch(entry, batch, additionalSize)) {
                    entry.delete = true;

                    queuedChanges[changeIndex] = entry;
                    sameIndex = true;

                    this.queueEntry(this.createEntry(entry.object!));

                    continue;
                }

                // Move data to right to create space.
                this.copyWithinStorage(
                    batch,
                    offset + entry.newSize,
                    offset + entry.size,
                    batch.size,
                );

                this.applyEntryChange(entry, batch, offset);

                batch.sizes.add(entryIndex, additionalSize);

                batch.size += additionalSize;
            }

            changeIndex++;
        }

        batch.queuedChanges.length = 0;
    }

    /**
     * Distribute queued new entries into batches. May create new batches if needed.
     */
    protected applyQueuedEntries(): void {
        const { queuedEntries, batches } = this;

        for (let i = 0; i < queuedEntries.length; i++) {
            const entry = queuedEntries[i]!;

            if (!entry.object) {
                throw new Error('Trying to add entry without object');
            }

            const batchCount = batches.length;

            let batchWithSpace: B | undefined;
            let batchIndex = 0;

            while (batchCount > 0) {
                const batch = batches[batchIndex]!;

                if (!batchWithSpace && this.canAddToBatch(entry, batch)) {
                    batchWithSpace = batch;

                    break;
                }

                if (batchIndex < batchCount - 1) {
                    batchIndex++;
                } else {
                    break;
                }
            }

            if (!batchWithSpace) {
                batchWithSpace = this.createBatch();
                batchIndex = batches.length;
                batches.push(batchWithSpace);
            }

            const offset = batchWithSpace.size;

            entry.batchIndex = batchIndex;
            this.addToBatch(entry, batchWithSpace);
            this.applyEntryChange(entry, batchWithSpace, offset);
        }

        this.queuedEntries.length = 0;
    }

    /**
     * Discard empty batches.
     */
    protected discardBatches(): void {
        const { batches } = this;

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i]!;

            if (batch.entries.length === 0) {
                this.discardBatch(batch);

                const lastIndex = batches.length - 1;

                // Swap and continue at same index
                if (lastIndex > i) {
                    batches[i] = batches[lastIndex]!;
                    batches.length--;
                    i--;
                }
            }
        }
    }

    /**
     * Create a batch.
     * @remarks
     * If using a batch pool, take from the pool here.
     */
    protected abstract createBatch(): B;

    /**
     * Discard a batch. Should call {@link Batcher#clearBatch}.
     * @param batch - Batch
     * @remarks
     * If using a batch pool, return to the pool here.
     */
    protected abstract discardBatch(batch: B): void;

    /**
     * Clear a batch of all its entries. {@link Batcher#discardEntry} should be called for each entry.
     * @param batch - Batch
     */
    protected clearBatch(batch: B): void {
        const { entries } = batch;

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i]!;

            this.discardEntry(entry);
        }

        batch.clear();
    }

    /**
     * Decide if a batch should be completely rebuilt. Generally this should be true if most/all of
     * the batch's entries must be processed anyways.
     * @param batch - Batch
     * @returns `true` if batch should be rebuilt.
     */
    protected shouldRebuildBatch(batch: B): boolean {
        return batch.queuedChanges.length === batch.entries.length;
    }

    /**
     * Add `entry` to `batch`.
     * @param entry - Entry
     * @param batch - Batch
     */
    protected addToBatch(entry: E, batch: B): void {
        batch.addEntry(entry);
    }

    /**
     * Check if `entry` can be added to `batch`.
     * @param entry - Entry
     * @param batch - Batch
     * @param additionalSize - Optional, if set this is the additional size required
     * @returns `true` if `entry` fits into `batch`
     */
    protected abstract canAddToBatch(
        entry: E,
        batch: B,
        additionalSize?: number,
    ): boolean;

    /**
     * Create an entry for `object`.
     * @param object - Object
     * @returns Created entry
     * @remarks
     * If using an entry pool, take from pool here.
     */
    protected abstract createEntry(object: O): E;

    /**
     * Discard an entry.
     * @param entry - Entry
     * @remarks
     * If using an entry pool, return to pool here.
     */
    protected abstract discardEntry(entry: E): void;

    /**
     * Called when an entry is marked as changed. Should set sizes and any other properties.
     * @param entry - Entry
     * @param batch - Batch containing `entry`
     */
    protected abstract changeEntry(entry: E, batch: B | undefined): void;

    /**
     * Called when an entry change is applied.
     * @param entry - Changed entry
     * @param batch - Batch containing `entry`
     * @param offset - Element offset in batch
     */
    protected applyEntryChange(entry: E, batch: B, offset: number): void {
        entry.delete = false;
        entry.checkCapacity = false;
        entry.size = entry.newSize;
    }

    /**
     * Called when an entry was removed from a batch.
     * @param entry - Deleted entry
     * @param batch - Batch containing `entry`
     */
    protected onDeleteEntry(entry: E, batch: B) {
        batch.onDeleteEntry(entry);

        this.discardEntry(entry);
    }

    /**
     * Queue an entry to be added.
     * @param entry - New entry
     */
    protected queueEntry(entry: E): void {
        this.queuedEntries.push(entry);

        this.changeTracker.registerChange();
    }

    /**
     * Queue an entry change.
     * @param entry - Changed entry
     * @param batch - Batch containing `entry`
     */
    protected queueEntryChange(entry: E, batch: B): void {
        batch.queuedChanges.push(entry);

        this.changeTracker.registerChange();
    }

    /**
     * Move data within a batch. Used if e.g. entries change size and multiple entries must be moved
     * to fill gaps or crate space.
     * @param batch - Affected batch
     * @param target - Target element offset
     * @param start - Start element offset
     * @param end - End element offset
     * @remarks
     * Generally should call `copyWithin` on batch storage or its buffer.
     */
    protected abstract copyWithinStorage(
        batch: B,
        target: number,
        start: number,
        end: number,
    ): void;
}
