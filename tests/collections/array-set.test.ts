import { describe, expect, test } from 'vitest';
import { ArraySet } from '../../src';

describe('array set', () => {
    test('init', () => {
        const m = new ArraySet();

        expect(m).toBeDefined();
        expect(m.size).toBe(0);
        expect(m.values.length).toBe(0);
    });

    test('add', () => {
        const m = new ArraySet<number>();

        m.add(10);

        expect(m.size).toBe(1);

        expect(m.values.length).toBe(1);

        expect(m.values[0]).toBe(10);
        expect(m.at(0)).toBe(10);
        expect(m.has(10)).toBe(true);
        expect(m.indexOf(10)).toBe(0);

        m.add(20);

        expect(m.size).toBe(2);

        expect(m.values.length).toBe(2);

        expect(m.values[1]).toBe(20);
        expect(m.at(1)).toBe(20);
        expect(m.has(20)).toBe(true);
        expect(m.indexOf(20)).toBe(1);

        expect(m.at(-1)).toBe(20);

        expect(m.at(2)).toBe(undefined);
    });

    test('add same value', () => {
        const m = new ArraySet<number>();

        m.add(10);
        m.add(10);

        expect(m.size).toBe(1);

        expect(m.values.length).toBe(1);

        expect(m.values[0]).toBe(10);
        expect(m.at(0)).toBe(10);
        expect(m.has(10)).toBe(true);
        expect(m.indexOf(10)).toBe(0);
    });

    test('delete', () => {
        const m = new ArraySet<number>();

        m.add(10).add(20).add(30);

        expect(m.size).toBe(3);

        expect(m.delete(20)).toBe(true);

        expect(m.size).toBe(2);

        // Order
        expect(m.indexOf(10)).toBe(0);

        expect(m.indexOf(30)).toBe(1);
    });

    test('clear', () => {
        const m = new ArraySet<number>();

        m.add(10).add(20).add(30);

        expect(m.size).toBe(3);

        m.clear();

        expect(m.size).toBe(0);
        expect(m.values.length).toBe(0);
    });
});
