/**
 * Batch entry.
 *
 * @category Rendering - Batching
 */
export class BatchEntry<O> {
    /** Pending deletion change. */
    delete = false;
    /** Pending change affects if this entry fits into its current batch. */
    checkCapacity = false;

    /** Index within batch. */
    index = -1;

    /** Current batch. */
    batchIndex = -1;

    /** Object. */
    object?: O;

    /** Last/current size. */
    size = 0;
    /** New size. */
    newSize = 0;

    /** Reset all data in this entry. */
    reset(): void {
        this.delete = false;
        this.checkCapacity = false;

        this.index = -1;
        this.batchIndex = -1;

        this.object = undefined;

        this.size = 0;
        this.newSize = 0;
    }
}
