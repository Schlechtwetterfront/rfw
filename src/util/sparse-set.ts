/** @category Utility */
export interface SparseSetEntry {
    readonly hashCode: number;
}

/** @category Utility */
export class SparseSet<V> {
    private readonly indices: (number | undefined)[];
    private readonly _values: V[];

    get size() {
        return this._values.length;
    }

    readonly values: readonly V[];

    constructor(getHashCode: (v: V) => number);
    constructor(getHashCode: (v: V) => number, set: SparseSet<V>);
    constructor(getHashCode: (v: V) => number, entries: Iterable<V> | null);
    constructor(
        private readonly getHashCode: (v: V) => number,
        init?: SparseSet<V> | Iterable<V> | null,
    ) {
        if (init instanceof SparseSet) {
            this.indices = [...init.indices];
            this._values = [...init._values];
        } else {
            this.indices = [];
            this._values = [];

            if (init) {
                for (const v of init) {
                    this.add(v);
                }
            }
        }

        this.values = this._values;
    }

    has(v: V): boolean {
        const hashCode = this.getHashCode(v);

        return this.indices[hashCode] !== undefined;
    }

    indexOf(v: V): number | undefined {
        const hashCode = this.getHashCode(v);

        return this.indices[hashCode];
    }

    add(v: V): this {
        const hashCode = this.getHashCode(v);

        if (this.indices.length <= hashCode) {
            this.allocate(hashCode);
        }

        let index = this.indices[hashCode];

        index ??= this._values.length;

        this.indices[hashCode] = index;
        this._values[index] = v;

        return this;
    }

    at(index: number): V | undefined {
        return this._values.at(index);
    }

    delete(v: V): boolean {
        const hashCode = this.getHashCode(v);

        const index = this.indices[hashCode];

        if (index === undefined) {
            return false;
        }

        const size = this._values.length;

        if (size > 1 && index !== size - 1) {
            // Swap
            const lastIndex = size - 1;
            const lastValue = this._values[lastIndex]!;

            this.indices[this.getHashCode(lastValue)] = index;

            this._values.copyWithin(index, lastIndex, lastIndex + 1);
        }

        this._values.length--;

        return true;
    }

    clear(): void {
        this.indices.length = 0;
        this._values.length = 0;
    }

    private allocate(hashCode: number) {
        const { length } = this.indices;
        const additionalLength = hashCode - length;

        this.indices.length += additionalLength;

        this.indices.fill(undefined, length);
    }

    static withHashCodeEntries<V extends SparseSetEntry>(): SparseSet<V>;
    static withHashCodeEntries<V extends SparseSetEntry>(
        set: SparseSet<V>,
    ): SparseSet<V>;
    static withHashCodeEntries<V extends SparseSetEntry>(
        entries: Iterable<V> | null,
    ): SparseSet<V>;
    static withHashCodeEntries<V extends SparseSetEntry>(
        init?: SparseSet<V> | Iterable<V> | null,
    ) {
        return new SparseSet<V>(v => v.hashCode, init as Iterable<V>);
    }
}
