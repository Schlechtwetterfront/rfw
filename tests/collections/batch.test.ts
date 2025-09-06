import { describe, expect, test } from 'vitest';
import {
    Batch,
    BatchEntry,
    ChangeTracker,
    SizedBatcher,
    SizedObject,
} from '../../src';

class TestObject implements SizedObject {
    constructor(readonly size: number) {}
}

class TestBatcher extends SizedBatcher<TestObject> {
    protected override createBatch(): Batch<TestObject> {
        return new Batch();
    }

    protected override discardBatch(batch: Batch<TestObject>): void {
        this.clearBatch(batch);
    }

    protected override copyWithinStorage(
        batch: Batch<TestObject, BatchEntry<TestObject>>,
        target: number,
        start: number,
        end: number,
    ): void {}
}

describe('sized batcher', () => {
    const globalChangeTracker = new ChangeTracker();

    function sized(maxSize: number, changeTracker?: ChangeTracker) {
        const batcher = new TestBatcher(changeTracker ?? globalChangeTracker);

        batcher.setMaximums(maxSize);

        return batcher;
    }

    test('init', () => {
        const batcher = sized(2);

        expect(batcher.maxSize).toBe(2);
        expect(batcher.finalize().length).toBe(0);
    });

    test('batch', () => {
        const ct = new ChangeTracker();
        const batcher = sized(3, ct);

        const e = new TestObject(1);

        batcher.add(e);

        expect(ct.changed).toBe(true);

        let b = batcher.finalize();

        ct.reset();

        expect(b.length).toBe(1);
        expect(b[0]!.size).toBe(1);
        expect(b[0]!.entries.length).toBe(1);
        expect(b[0]!.entries[0]!.object).toBe(e);

        const e2 = new TestObject(1);

        const entry2 = batcher.add(e2);

        expect(ct.changed).toBe(true);

        b = batcher.finalize();

        ct.reset();

        expect(b.length).toBe(1);
        expect(b[0]!.size).toBe(2);
        expect(b[0]!.entries.length).toBe(2);

        const e3 = new TestObject(2);

        batcher.add(e3);

        b = batcher.finalize();

        expect(b.length).toBe(2);
        expect(b[0]!.entries.length).toBe(2);
        expect(b[1]!.entries.length).toBe(1);

        expect(batcher.delete(entry2)).toBe(true);

        b = batcher.finalize();

        expect(b.length).toBe(2);
    });

    test('compact batch', () => {
        const batcher = sized(10);

        const e = new TestObject(1);
        const e2 = new TestObject(2);
        const e3 = new TestObject(1);

        batcher.add(e);
        const entry2 = batcher.add(e2);
        batcher.add(e3);

        let b = batcher.finalize();

        expect(b.length).toBe(1);
        expect(b[0]!.size).toBe(4);
        expect(b[0]!.entries[1]!.object).toBe(e2);

        batcher.delete(entry2);

        b = batcher.finalize();

        expect(b.length).toBe(1);
        expect(b[0]!.size).toBe(2);
        expect(b[0]!.entries[1]!.object).toBe(e3);
    });
});
