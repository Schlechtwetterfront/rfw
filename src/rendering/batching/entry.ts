/**
 * Defines how a batch entry has changed.
 *
 * Size increase is not part of this enum because it's handled as a delete + an add.
 *
 * @category Rendering - Batching
 */
export enum BatchEntryChange {
    /** No change.*/
    NONE = 1 << 0,
    /** Contents have changed and must be rebuilt, size stayed the same. */
    CONTENT = 1 << 1,
    /**
     * Contents have possible changed, size decreased. Rebuild contents and release the additional
     * space, to be used by the batch.
     */
    SIZE_DECREASE = 1 << 2,
    /** Entry was deleted from batch. */
    DELETE = 1 << 3,
}

/**
 * Batch entry.
 *
 * @category Rendering - Batching
 */
export interface BatchEntry<O> {
    /** Entry object. */
    object?: O;
    /** Entry size. */
    size: number;
    /** Entry size for new tick/after change. */
    newSize: number;
    /** Index of entry in its batch. */
    index: number;
    /** Element (e.g., vertex) offset of entry in its batch. */
    offset: number;
}

/**
 * Initialize an 'empty' batch entry.
 * @param extendedProps - Object defining additional props of a derived entry type
 * @returns Empty entry
 *
 * @category Rendering - Batching
 */
export function createBatchEntry<O, E extends BatchEntry<O> = BatchEntry<O>>(
    extendedProps: Omit<E, keyof BatchEntry<O>>,
): E {
    const entry = extendedProps as E;
    entry.object = undefined;
    entry.index = -1;
    entry.newSize = 0;
    entry.size = 0;
    entry.offset = 0;

    return entry;
}

/**
 * Resets a batch entry to its empty defaults.
 * @param entry - Entry to reset
 *
 * @category Rendering - Batching
 */
export function resetBatchEntry<O, E extends BatchEntry<O> = BatchEntry<O>>(
    entry: E,
): void {
    entry.object = undefined;
    entry.index = -1;
    entry.newSize = 0;
    entry.size = 0;
    entry.offset = 0;
}
