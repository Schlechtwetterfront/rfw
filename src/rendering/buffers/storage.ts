/**
 * Generic storage with change tracking.
 */
export interface ChangeTrackedStorage {
    /** Clear any changes. */
    clearChange(): void;

    /**
     * Set the range that has changed.
     * @param from - Starting offset of change
     * @param length - Number of elements that have changed
     */
    setChanged(from: number, length: number): void;

    /**
     * Mark a range that has changed. Will combine with existing marked ranges.
     * @param from - Starting offset of change
     * @param length - Number of elements that have changed
     */
    markChanged(from: number, length: number): void;
}

/**
 * Change tracked object storage.
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
     * @param to - Element offset to copy the range to
     * @param from - Element offset to copy the range from
     * @param length - Number of elements to copy
     */
    copyWithin(to: number, from: number, length: number): void;
}
