/**
 * Efficient tree structure for prefix sums.
 *
 * @category Utility
 */
export class FenwickTree {
    private values: number[];

    // 1-based size/highest index;
    private _size = 1;

    constructor(
        /** 0-based capacity. */
        private capacity = 4,
    ) {
        this.values = new Array<number>(this.capacity + 1).fill(0);
    }

    add(i: number, delta: number): this {
        if (i >= this.capacity) {
            this.grow(i + 1);
        }

        if (i + 1 > this._size) {
            this._size = i + 1;
        }

        let index = i + 1;

        while (index <= this.capacity) {
            this.values[index]! += delta;

            index += index & -index;
        }

        return this;
    }

    set(i: number, value: number): this {
        const current = this.at(i);

        const delta = value - current;

        this.add(i, delta);

        return this;
    }

    at(i: number): number {
        return this.sumToIncluding(i) - this.sumToIncluding(i - 1);
    }

    sumToIncluding(i: number): number {
        if (this._size === 0 && i === 0) {
            return 0;
        }

        if (i >= this._size || i < -1 || (i > 0 && this._size === 0)) {
            throw new Error('Index out of range');
        }

        let index = i + 1;

        let sum = 0;

        while (index > 0) {
            sum += this.values[index]!;

            index -= index & -index;
        }

        return sum;
    }

    clear(): void {
        this.values.fill(0);
    }

    private grow(size: number) {
        let newCapacity = this.capacity;

        while (newCapacity < size) {
            newCapacity *= 2;
        }

        const newValues = new Array<number>(newCapacity + 1).fill(0);

        for (let i = 0; i < this._size; i++) {
            const value = this.sumToIncluding(i) - this.sumToIncluding(i - 1);

            let index = i + 1;

            while (index <= newCapacity) {
                newValues[index]! += value;

                index += index & -index;
            }
        }

        this.values = newValues;
        this.capacity = newCapacity;
    }
}
