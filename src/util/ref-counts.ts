import { ArrayMap } from './array-map';

/**
 * Manually reference-count a collection of objects. Will not keep references to objects with a
 * ref-count of 0.
 */
export class RefCounts<O> {
    private readonly _refs = new ArrayMap<O, number>();

    /**
     * Number of reference-counted objects.
     */
    get size() {
        return this._refs.size;
    }

    /**
     * Iterator over the reference-counted objects.
     */
    get [Symbol.iterator]() {
        return this._refs.keys;
    }

    /** Read-only array of the reference-counted objects. */
    get refs(): readonly O[] {
        return this._refs.keys;
    }

    /**
     * Check if `o` exists (has a ref-count > 0).
     * @param o - Object
     * @returns `true` if ref-count > 0
     */
    has(o: O): boolean {
        return this.count(o) > 0;
    }

    /**
     * Get the ref-count of `o`
     * @param o - Object
     * @returns Ref-count, 0 also if the
     */
    count(o: O): number {
        return this._refs.get(o) ?? 0;
    }

    /**
     * Add a reference to `o`.
     * @param o - Object
     * @returns New ref-count for `o`
     */
    add(o: O): number {
        const existing = this._refs.get(o) ?? 0;

        this._refs.set(o, existing + 1);

        return existing + 1;
    }

    /**
     * Delete a reference to `o`.
     * @param o - Object
     * @param toZero - Optional, if `true`, deletes all references to `o`
     * @returns New ref-count for `o`
     */
    delete(o: O, toZero = false): number {
        if (toZero) {
            this._refs.delete(o);

            return 0;
        }

        const existing = this._refs.get(o);

        switch (existing) {
            case undefined:
                return 0;

            case 1:
                this._refs.delete(o);
                return 0;

            default:
                this._refs.set(o, existing - 1);
                return existing - 1;
        }
    }

    /**
     * Copy ref-counts from `other`.
     * @param other - Other instance of `RefCounts`
     */
    copyFrom(other: RefCounts<O>): void {
        this._refs.clear();

        for (let i = 0; i < other.size; i++) {
            this._refs.set(other._refs.keys[i]!, other._refs.values[i]!);
        }
    }

    /**
     * Clear all references.
     */
    clear(): void {
        this._refs.clear();
    }
}
