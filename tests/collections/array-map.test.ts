import { describe, expect, test } from 'vitest';
import { ArrayMap } from '../../src';

describe('array map', () => {
    test('init', () => {
        const m = new ArrayMap();

        expect(m).toBeDefined();
        expect(m.size).toBe(0);
        expect(m.keys.length).toBe(0);
        expect(m.values.length).toBe(0);
    });

    test('init from Map', () => {
        const map = new Map();
        map.set(1, 10).set(2, 20).set(3, 30);

        const m = new ArrayMap(map);

        expect(m).toBeDefined();
        expect(m.size).toBe(3);
        expect(m.keys.length).toBe(3);
        expect(m.values.length).toBe(3);

        expect(m.keys[1]).toBe(2);
        expect(m.values[1]).toBe(20);
    });

    test('init from ArrayMap', () => {
        const map = new ArrayMap();
        map.set(1, 10).set(2, 20).set(3, 30);

        const m = new ArrayMap(map);

        expect(m).toBeDefined();
        expect(m.size).toBe(3);
        expect(m.keys.length).toBe(3);
        expect(m.values.length).toBe(3);

        expect(m.keys[1]).toBe(2);
        expect(m.values[1]).toBe(20);
    });

    test('init from iter', () => {
        const m = new ArrayMap([
            [1, 10],
            [2, 20],
            [3, 30],
        ]);

        expect(m).toBeDefined();
        expect(m.size).toBe(3);
        expect(m.keys.length).toBe(3);
        expect(m.values.length).toBe(3);

        expect(m.keys[1]).toBe(2);
        expect(m.values[1]).toBe(20);
    });

    test('set', () => {
        const m = new ArrayMap<number, number>();

        m.set(10, 100);

        expect(m.size).toBe(1);
        expect(m.keys.length).toBe(1);
        expect(m.values.length).toBe(1);
        expect(m.keys[0]).toBe(10);
        expect(m.keyAt(0)).toBe(10);
        expect(m.values[0]).toBe(100);
        expect(m.at(0)).toBe(100);
        expect(m.has(10)).toBe(true);
        expect(m.indexOf(10)).toBe(0);
        expect(m.get(10)).toBe(100);

        m.set(20, 200);

        expect(m.size).toBe(2);
        expect(m.keys.length).toBe(2);
        expect(m.values.length).toBe(2);
        expect(m.keys[1]).toBe(20);
        expect(m.keyAt(1)).toBe(20);
        expect(m.values[1]).toBe(200);
        expect(m.at(1)).toBe(200);
        expect(m.has(20)).toBe(true);
        expect(m.indexOf(20)).toBe(1);
        expect(m.get(20)).toBe(200);

        expect(m.keyAt(-1)).toBe(20);
        expect(m.at(-1)).toBe(200);

        expect(m.keyAt(2)).toBe(undefined);
        expect(m.at(2)).toBe(undefined);
    });

    test('set same key', () => {
        const m = new ArrayMap<number, number>();

        m.set(10, 100);
        m.set(10, 200);

        expect(m.size).toBe(1);
        expect(m.keys.length).toBe(1);
        expect(m.values.length).toBe(1);
        expect(m.keys[0]).toBe(10);
        expect(m.keyAt(0)).toBe(10);
        expect(m.values[0]).toBe(200);
        expect(m.at(0)).toBe(200);
        expect(m.has(10)).toBe(true);
        expect(m.indexOf(10)).toBe(0);
        expect(m.get(10)).toBe(200);
    });

    test('delete', () => {
        const m = new ArrayMap<number, number>();

        m.set(10, 100).set(20, 200).set(30, 300);

        expect(m.get(20)).toBe(200);
        expect(m.size).toBe(3);

        expect(m.delete(20)).toBe(true);
        expect(m.get(20)).toBe(undefined);
        expect(m.size).toBe(2);

        // Order
        expect(m.indexOf(10)).toBe(0);
        expect(m.get(10)).toBe(100);

        expect(m.indexOf(30)).toBe(1);
        expect(m.get(30)).toBe(300);
    });

    test('clear', () => {
        const m = new ArrayMap<number, number>();

        m.set(10, 100).set(20, 200).set(30, 300);

        expect(m.get(20)).toBe(200);
        expect(m.size).toBe(3);

        m.clear();

        expect(m.get(20)).toBe(undefined);
        expect(m.size).toBe(0);
        expect(m.keys.length).toBe(0);
        expect(m.values.length).toBe(0);
    });
});
