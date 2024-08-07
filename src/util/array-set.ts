/**
 * Array-backed set. Trades memory for iteration speed
 *
 * @category Utility
 */
export class ArraySet<V> {
    private readonly indices: Map<V, number>;
    private readonly _values: V[];

    /** Number of entries in the set. */
    get size() {
        return this._values.length;
    }

    /** Read-only array of values in the set. */
    readonly values: readonly V[];

    constructor();

    constructor(set: ArraySet<V>);
    constructor(entries: Iterable<V> | null);
    constructor(init?: ArraySet<V> | Iterable<V> | null) {
        if (init instanceof ArraySet) {
            this.indices = new Map(init.indices);
            this._values = [...init._values];
        } else {
            this.indices = new Map();
            this._values = [];

            if (init) {
                for (const v of init) {
                    this.add(v);
                }
            }
        }

        this.values = this._values;
    }

    /**
     * Check if a value exists in the set.
     * @param v - Value
     * @returns `true` if value exists
     */
    has(v: V): boolean {
        return this.indices.has(v);
    }

    /**
     * Get index of value `v` in the backing array. Can be used to index {@link ArraySet.values} and
     * {@link ArrayMap.values}.
     * @param v - Value
     * @returns Index or `undefined`
     */
    indexOf(v: V): number | undefined {
        return this.indices.get(v);
    }

    /**
     * Add value `v` to the set.
     * @param v - Value
     * @returns Self
     */
    add(v: V): this {
        if (!this.indices.has(v)) {
            this.indices.set(v, this._values.length);
            this._values.push(v);
        }

        return this;
    }

    /**
     * Get value at `index`.
     * @param index - Index into backing array
     * @returns Value or `undefined`
     */
    at(index: number): V | undefined {
        return this._values.at(index);
    }

    /**
     * Delete entry for value `v`.
     * @param v - Value
     * @returns `true` if an entry was removed
     */
    delete(v: V): boolean {
        const index = this.indices.get(v);

        if (index === undefined) {
            return false;
        }

        if (this.size > 1 && index !== this.size - 1) {
            // Swap
            const lastIndex = this.size - 1;

            this.indices.set(this._values[lastIndex]!, index);

            this._values.copyWithin(index, lastIndex, lastIndex + 1);
        }

        this._values.length--;

        this.indices.delete(v);

        return true;
    }

    /**
     * Clear the map.
     */
    clear(): void {
        this.indices.clear();
        this._values.length = 0;
    }
}
