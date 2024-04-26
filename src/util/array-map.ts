/**
 * Array-backed map. Trades memory for iteration speed
 */
export class ArrayMap<K, V> {
    private readonly indices = new Map<K, number>();
    private readonly _keys: K[] = [];
    private readonly _values: V[] = [];

    /** Number of entries in the map. */
    get size() {
        return this._keys.length;
    }

    /** Read-only array of keys in the map. */
    readonly keys: readonly K[] = this._keys;

    /** Read-only array of values in the map. */
    readonly values: readonly V[] = this._values;

    /**
     * Check if a key exists in the map.
     * @param k - Key
     * @returns `true` if key exists
     */
    has(k: K): boolean {
        return this.indices.has(k);
    }

    /**
     * Get index of key `k` in the backing array. Can be used to index {@link ArrayMap.keys} and
     * {@link ArrayMap.values}.
     * @param k - Key
     * @returns Index or `undefined`
     */
    indexOf(k: K): number | undefined {
        return this.indices.get(k);
    }

    /**
     * Set value `v` for key `k`. Overrides existing values for `k`.
     * @param k - Key
     * @param v - Value
     * @returns Self
     */
    set(k: K, v: V): this {
        const index = this.indices.get(k);

        if (index !== undefined) {
            this._values[index] = v;
        } else {
            this.indices.set(k, this.size);
            this._keys.push(k);
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
     * Get key at `index`.
     * @param index - Index into backing array
     * @returns Key or `undefined`
     */
    keyAt(index: number): K | undefined {
        return this._keys.at(index);
    }

    /**
     * Get value for key `k`.
     * @param k - Key
     * @returns Value or `undefined`
     */
    get(k: K): V | undefined {
        const index = this.indices.get(k);

        if (index === undefined) {
            return undefined;
        }

        return this._values[index];
    }

    /**
     * Delete entry for key `k`.
     * @param k - Key
     * @returns `true` if an entry was removed
     */
    delete(k: K): boolean {
        const index = this.indices.get(k);

        if (index === undefined) {
            return false;
        }

        if (this.size > 1 && index !== this.size - 1) {
            // Swap
            const lastIndex = this.size - 1;

            this.indices.set(this._keys[lastIndex]!, index);

            this._keys.copyWithin(index, lastIndex, lastIndex + 1);
            this._values.copyWithin(index, lastIndex, lastIndex + 1);
        }

        this._keys.length--;
        this._values.length--;

        this.indices.delete(k);

        return true;
    }

    /**
     * Clear the map.
     */
    clear(): void {
        this.indices.clear();
        this._keys.length = 0;
        this._values.length = 0;
    }
}
