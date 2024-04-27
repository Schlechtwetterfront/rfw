import { describe, expect, test } from 'vitest';
import { ChangeTracker, SizedBatcher } from '../../src';

function storageFactory() {
    return {
        clearChange() {},
        setChanged() {},
        markChanged() {},
        update() {},
        copyWithin() {},
    };
}

function entry(size: number) {
    return {
        size,
    };
}

describe('sized batcher', () => {
    const globalChangeTracker = new ChangeTracker();

    function sized(maxSize: number, changeTracker?: ChangeTracker) {
        return new SizedBatcher({
            maxSize,
            changeTracker: changeTracker ?? globalChangeTracker,
            batchStorageFactory: storageFactory,
        });
    }

    test('init', () => {
        const batcher = sized(2);

        expect(batcher.maxSize).toBe(2);
        expect(batcher.batches.length).toBe(0);
    });

    test('add same', () => {
        const batcher = sized(10);

        const e = entry(1);

        batcher.add(e);

        expect(batcher.has(e)).toBe(true);

        let b = batcher.finalize();

        expect(b.length).toBe(1);
        expect(b[0]!.size).toBe(1);

        batcher.add(e);

        b = batcher.finalize();

        expect(b.length).toBe(1);
        expect(b[0]!.size).toBe(1);
    });

    test('batch', () => {
        const ct = new ChangeTracker();
        const batcher = sized(3, ct);

        const e = entry(1);

        batcher.add(e);

        expect(batcher.has(e)).toBe(true);
        expect(ct.changed).toBe(true);

        let b = batcher.finalize();

        ct.reset();

        expect(b.length).toBe(1);
        expect(b[0]!.size).toBe(1);
        expect(b[0]!.entries.length).toBe(1);
        expect(b[0]!.entries[0]!.object).toBe(e);

        const e2 = entry(1);

        batcher.add(e2);

        expect(batcher.has(e)).toBe(true);
        expect(ct.changed).toBe(true);

        b = batcher.finalize();

        ct.reset();

        expect(b.length).toBe(1);
        expect(b[0]!.size).toBe(2);
        expect(b[0]!.entries.length).toBe(2);

        const e3 = entry(2);

        batcher.add(e3);

        b = batcher.finalize();

        expect(b.length).toBe(2);
        expect(b[0]!.entries.length).toBe(2);
        expect(b[1]!.entries.length).toBe(1);

        expect(batcher.delete(e2)).toBe(true);

        expect(batcher.has(e2)).toBe(false);

        b = batcher.finalize();

        expect(b.length).toBe(2);
    });

    test('compact batch', () => {
        const batcher = sized(10);

        const e = entry(1);
        const e2 = entry(2);
        const e3 = entry(1);

        batcher.add(e);
        batcher.add(e2);
        batcher.add(e3);

        let b = batcher.finalize();

        expect(b.length).toBe(1);
        expect(b[0]!.size).toBe(4);
        expect(b[0]!.entries[1]!.object).toBe(e2);

        batcher.delete(e2);

        b = batcher.finalize();

        expect(b.length).toBe(1);
        expect(b[0]!.size).toBe(2);
        expect(b[0]!.entries[1]!.object).toBe(e3);
    });
});
