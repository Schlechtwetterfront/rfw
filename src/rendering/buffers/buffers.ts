/**
 * Generic buffer with change tracking.
 *
 * @category Rendering - Buffers
 */
export interface ChangeTrackedBuffer {
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
 * A buffer-like with change tracking.
 *
 * @category Rendering - Buffers
 */
export interface WriteBuffer extends ChangeTrackedBuffer {
    /** Actual buffer. */
    readonly buffer: ArrayBuffer;
}
