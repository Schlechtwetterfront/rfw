import { swapDeleteAt } from '../../util';
import { Pool } from '../../util/pool';
import { BatchEntry, BatchEntryChange } from './entry';
import { BatchStorage } from './storage';

/**
 * A generic batch of objects.
 */
export class Batch<
    O,
    E extends BatchEntry<O> = BatchEntry<O>,
    S extends BatchStorage<E> = BatchStorage<E>,
> {
    /**
     * Map from object to entry. For lookup only.
     */
    protected readonly objectEntries = new Map<O, E>();

    /**
     * Array containing an item for each entry in this batch. Allows using entry index to look up
     * it's associated change.
     */
    protected readonly entryChanges: BatchEntryChange[] = [];

    /** Entry index of the first changed entry. Allows skipping unchanged entries before it. */
    protected firstChangedEntryIndex?: number;

    /** Entry index of the last changed entry. Allows stopping change-application early. */
    protected lastChangedEntryIndex?: number;

    protected readonly _entries: E[] = [];

    private _size = 0;

    protected initialized = false;

    /**
     * Size of the batch. The unit depends on how the batch is used in its batcher.
     */
    get size() {
        return this._size;
    }
    protected set size(size: number) {
        this._size = size;
    }

    /**
     * Entries in this batch (in order of storage).
     */
    readonly entries: readonly E[] = this._entries;

    /**
     * @param storage - Batch storage. Entry updates/changes will also be applied to the storage
     * @param entryPool - Object pool to retrieve new entries from
     */
    constructor(
        readonly storage: S,
        private readonly entryPool: Pool<E>,
    ) {}

    /**
     * Add an entry to the batch.
     * @param entry - Entry to add
     */
    add(entry: E): void {
        if (!entry.object) {
            throw new Error('Batch entry has no object');
        }

        if (
            this.firstChangedEntryIndex !== undefined ||
            this.lastChangedEntryIndex !== undefined
        ) {
            throw new Error('Cannot add to batch with pending changes');
        }

        const offset = this.size;
        const index = this._entries.length;

        entry.index = index;
        entry.offset = offset;

        this.size += entry.size;

        this.storage.update(entry, offset);

        this.objectEntries.set(entry.object, entry);
        this._entries.push(entry);
        this.entryChanges.push(BatchEntryChange.NONE);
    }

    /**
     * Get entry for `object`.
     * @param object - Object
     * @returns Entry or undefined
     */
    getEntry(object: O): E | undefined {
        return this.objectEntries.get(object);
    }

    /**
     * Check if this batch has an entry for `object`.
     * @param object - Object
     * @returns `true` if an entry exists
     */
    hasObject(object: O): boolean {
        return this.objectEntries.has(object);
    }

    /**
     * Mark an entry as changed. The change will be queued, to be applied via {@link Batch.update}.
     * @param entry - Entry to mark changed
     * @param change - Type of change
     */
    change(entry: E, change: BatchEntryChange): void {
        this.entryChanges[entry.index] = change;

        if (
            this.firstChangedEntryIndex === undefined ||
            this.firstChangedEntryIndex > entry.index
        ) {
            this.firstChangedEntryIndex = entry.index;
        }

        if (
            this.lastChangedEntryIndex === undefined ||
            this.lastChangedEntryIndex < entry.index
        ) {
            this.lastChangedEntryIndex = entry.index;
        }
    }

    /**
     * Update batch by applying all changes and updating storage.
     */
    update(): void {
        if (!this.initialized) {
            this.rebuild();
            this.initialized = true;
            return;
        }

        // Everything has to be updated anyways
        if (
            this.firstChangedEntryIndex === 0 &&
            this.lastChangedEntryIndex === this._entries.length - 1
        ) {
            this.rebuild();
            return;
        }

        this.applyChanges();
    }

    /**
     * Rebuild batch entry list and storage.
     *
     * @remarks
     * Must apply all changes.
     */
    protected rebuild(): void {
        const { _entries: entries, entryChanges, storage } = this;

        storage.clearChange();

        let entryCount = entries.length;

        if (entryCount !== this.entryChanges.length) {
            throw new Error('Entries and changes out of sync');
        }

        let offset = 0;

        let change = BatchEntryChange.NONE;
        let entry: E;

        // Note: i, entryCount are changed within the loop!
        for (let i = 0; i < entryCount; i++) {
            entry = entries[i]!;
            change = entryChanges[i]!;

            entry.index = i;
            entry.offset = offset;

            if (change & BatchEntryChange.DELETE) {
                swapDeleteAt(entries, i);
                swapDeleteAt(entryChanges, i);

                this.onDelete(entry);

                // Note!
                i--;
                entryCount--;
            } else {
                storage.update(entry, offset);

                offset += entry.newSize;
                entry.size = entry.newSize;
            }
        }

        this.size = offset;

        this.firstChangedEntryIndex = undefined;
        this.lastChangedEntryIndex = undefined;
    }

    /**
     * Apply changes and try to do the least amount of work for it.
     *
     * With a lot of changes per tick this becomes a performance-critical method.
     */
    protected applyChanges(): void {
        const {
            size: initialTotalSize,
            _entries: entries,
            entryChanges,
            firstChangedEntryIndex,
            lastChangedEntryIndex,
            storage,
        } = this;

        storage.clearChange();

        let entryCount = entries.length;

        if (entryCount !== entryChanges.length) {
            throw new Error('Entries and changes out of sync');
        }

        if (
            entryCount === 0 ||
            firstChangedEntryIndex === undefined ||
            lastChangedEntryIndex === undefined
        ) {
            this.firstChangedEntryIndex = this.lastChangedEntryIndex =
                undefined;

            return;
        }

        const changedFrom = entries[firstChangedEntryIndex]!.offset;

        let totalSize = initialTotalSize;
        let offset = changedFrom;

        // Keep track of removed entries (indices must be adjusted)
        let lastChangeAdjustedForRemoved = lastChangedEntryIndex;
        let hasRemovedElements = false;

        // Only compact if all entries are not updated anyways
        const compact = lastChangedEntryIndex < entries.length - 1;

        let change: BatchEntryChange = BatchEntryChange.NONE;
        let entry: E;

        // Note: i, entryCount are changed within the loop!
        for (let i = firstChangedEntryIndex; i < entryCount; i++) {
            entry = entries[i]!;
            change = entryChanges[i]!;

            entry.index = i;
            entry.offset = offset;

            if (change & BatchEntryChange.NONE) {
                offset += entry.size;

                // No entries/elements were removed => indices and offsets do not have to be updated
                if (i > lastChangeAdjustedForRemoved && !hasRemovedElements) {
                    break;
                }

                continue;
            }

            entryChanges[i] = BatchEntryChange.NONE;

            if (change & BatchEntryChange.CONTENT) {
                storage.update(entry, offset);

                offset += entry.size;
            } else if (change & BatchEntryChange.SIZE_DECREASE) {
                const diff = entry.size - entry.newSize;

                if (compact) {
                    // First copy everything to the left by our decreased size...
                    storage.copyWithin(
                        // To: current right end of this entry's section
                        offset + entry.newSize,
                        // Start: _previous_ right end of this entry's section in the buffer
                        offset + entry.size,
                        // End: everything to the right of the entry's section
                        totalSize,
                    );
                }

                totalSize -= diff;

                // ...then update the left, remaining part
                storage.update(entry, offset);

                entry.size = entry.newSize;

                offset += entry.newSize;

                hasRemovedElements = true;
            } else if (change & BatchEntryChange.DELETE) {
                if (compact) {
                    // Copy everything to the right over the now-free space
                    storage.copyWithin(offset, offset + entry.size, totalSize);
                }

                totalSize -= entry.size;

                this._entries.splice(i, 1);
                this.entryChanges.splice(i, 1);

                this.onDelete(entry);

                // Note!
                i--;
                entryCount--;

                lastChangeAdjustedForRemoved--;
                hasRemovedElements = true;
            }
        }

        this.size = totalSize;

        this.firstChangedEntryIndex = undefined;
        this.lastChangedEntryIndex = undefined;
    }

    /**
     * Perform any additional clean up when an entry is deleted.
     * @param entry - Deleted entry
     */
    protected onDelete(entry: E): void {
        this.objectEntries.delete(entry.object!);
        this.entryPool.return(entry);
    }

    /**
     * Clear the batch of entries and any additional data.
     */
    clear(): void {
        this.objectEntries.clear();
        this.entryChanges.length = 0;
        this.firstChangedEntryIndex = undefined;
        this.lastChangedEntryIndex = undefined;
        this.size = 0;
        this.initialized = false;

        const entries = this._entries;

        for (let i = 0; i < entries.length; i++) {
            this.entryPool.return(entries[i]!);
        }

        this._entries.length = 0;
    }
}
