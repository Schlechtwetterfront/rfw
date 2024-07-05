/**
 * Generic storage with change tracking.
 *
 * @category Rendering - Buffers
 */
export interface ChangeTrackedStorage {
    /** Clear any changes. */
    clearChange(): void;

    /**
     * Set the range that has changed.
     * @param start - Starting offset of change
     * @param end - Changed range end
     */
    setChanged(start: number, end: number): void;

    /**
     * Mark a range that has changed. Will combine with existing marked ranges.
     * @param start - Starting offset of change
     * @param end - Changed range end
     */
    markChanged(start: number, end: number): void;
}

/**
 * Change tracked object storage.
 *
 * @category Rendering - Buffers
 */
export interface ObjectStorage<O> extends ChangeTrackedStorage {
    /**
     * Store/update an object at the given offset.
     * @param object - Object to write
     * @param offset - Object element offset
     */
    update(object: O, offset: number): void;

    /**
     * Copy a range of the storage within itself.
     * @param target - Element offset to copy the range to
     * @param start - Element offset to copy the range from
     * @param end - Element offset end
     */
    copyWithin(target: number, start: number, end: number): void;
}
