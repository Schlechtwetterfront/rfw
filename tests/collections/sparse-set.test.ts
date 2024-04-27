import { describe, expect, test } from 'vitest';
import { SparseSet, SparseSetEntry } from '../../src/util/sparse-set';

export class Entry implements SparseSetEntry {
    constructor(public readonly hashCode: number) {}
}

describe('sparse set', () => {
    test('init', () => {
        const s = SparseSet.withHashCodeEntries();

        expect(s).toBeDefined();
        expect(s.size).toBe(0);
        expect(s.values.length).toBe(0);
    });

    test('init from Set', () => {
        const set = new Set<Entry>();
        set.add(new Entry(1)).add(new Entry(10)).add(new Entry(100));

        const s = SparseSet.withHashCodeEntries(set);

        expect(s).toBeDefined();
        expect(s.size).toBe(3);
        expect(s.values.length).toBe(3);
    });

    test('init from SparseSet', () => {
        const set = SparseSet.withHashCodeEntries();
        set.add(new Entry(1)).add(new Entry(10)).add(new Entry(100));

        const s = SparseSet.withHashCodeEntries(set);

        expect(s).toBeDefined();
        expect(s.size).toBe(3);
        expect(s.values.length).toBe(3);
    });

    test('init from iter', () => {
        const s = SparseSet.withHashCodeEntries([
            new Entry(1),
            new Entry(10),
            new Entry(100),
        ]);

        expect(s).toBeDefined();
        expect(s.size).toBe(3);
        expect(s.values.length).toBe(3);
    });

    test('add', () => {
        const s = SparseSet.withHashCodeEntries();

        s.add(new Entry(10));

        expect(s.size).toBe(1);
        expect(s.values.length).toBe(1);

        expect(s.values[0]?.hashCode).toBe(10);
        expect(s.at(0)?.hashCode).toBe(10);
        expect(s.has(new Entry(10))).toBe(true);
        expect(s.indexOf(new Entry(10))).toBe(0);

        s.add(new Entry(20));

        expect(s.size).toBe(2);
        expect(s.values.length).toBe(2);

        expect(s.values[1]?.hashCode).toBe(20);
        expect(s.at(1)?.hashCode).toBe(20);
        expect(s.has(new Entry(20))).toBe(true);
        expect(s.indexOf(new Entry(20))).toBe(1);

        expect(s.at(-1)?.hashCode).toBe(20);
        expect(s.at(2)?.hashCode).toBe(undefined);
    });

    test('add same value', () => {
        const s = SparseSet.withHashCodeEntries();

        s.add(new Entry(10));

        expect(s.size).toBe(1);
        expect(s.values.length).toBe(1);

        s.add(new Entry(10));

        expect(s.size).toBe(1);
        expect(s.values.length).toBe(1);

        expect(s.values[0]?.hashCode).toBe(10);
        expect(s.at(0)?.hashCode).toBe(10);
        expect(s.has(new Entry(10))).toBe(true);
        expect(s.indexOf(new Entry(10))).toBe(0);
    });

    test('delete', () => {
        const s = SparseSet.withHashCodeEntries();

        s.add(new Entry(10)).add(new Entry(20)).add(new Entry(30));

        expect(s.size).toBe(3);

        expect(s.delete(new Entry(20))).toBe(true);

        expect(s.size).toBe(2);

        // Order
        expect(s.indexOf(new Entry(10))).toBe(0);
        expect(s.indexOf(new Entry(30))).toBe(1);
        expect(s.at(1)?.hashCode).toBe(30);
    });

    test('delete', () => {
        const s = SparseSet.withHashCodeEntries();

        s.add(new Entry(10)).add(new Entry(20)).add(new Entry(30));

        expect(s.size).toBe(3);

        s.clear();

        expect(s.size).toBe(0);
        expect(s.values.length).toBe(0);
    });

    test('with hashCode factory', () => {
        const s = new SparseSet(v => (v === 'a' ? 1 : 2));

        s.add('a');

        expect(s.has('a')).toBe(true);
        expect(s.has('b')).toBe(false);

        s.add('b');

        expect(s.has('b')).toBe(true);
        expect(s.has('c')).toBe(true);

        expect(s.size).toBe(2);
        expect(s.values.length).toBe(2);
    });
});
