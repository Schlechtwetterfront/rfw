import { describe, expect, test } from 'vitest';
import { Vec2Like } from '../src/math';
import { Rect, RectLike } from '../src/math/shapes';
import { QuadTree, QuadTreeEntry } from '../src/util/quad-tree';

class RectEntry implements QuadTreeEntry {
    rect: Rect;

    constructor(x: number, yOrD: number, dOrW?: number, h?: number) {
        const y = typeof dOrW === 'number' ? yOrD : x;
        const w = typeof dOrW === 'number' ? yOrD : yOrD;
        h = typeof h === 'number' ? h : w;

        this.rect = new Rect(x, y, w, h);
    }

    containsPoint(point: Vec2Like): boolean {
        return this.rect.containsPoint(point);
    }

    intersectsRect(rect: RectLike): boolean {
        return this.rect.intersectsRect(rect);
    }
}

describe('quad tree', () => {
    test('initializes', () => {
        const t = new QuadTree({ x: 0, y: 0, width: 40, height: 20 });

        expect(t.size).toEqual(0);
        expect(t.bounds.x).toEqual(0);
        expect(t.bounds.y).toEqual(0);
        expect(t.bounds.width).toEqual(40);
        expect(t.bounds.height).toEqual(20);
    });

    test('adds entries and subdivides', () => {
        const t = new QuadTree({ x: 0, y: 0, width: 40, height: 20 }, 1);

        const e1 = new RectEntry(5, 1);

        expect(t.add(e1)).toBe(true);
        expect(t.size).toEqual(1);
        expect([...t.quads()]).toHaveLength(1);

        const e2 = new RectEntry(10, 1);

        expect(t.add(e2)).toBe(true);
        expect(t.size).toEqual(2);
        expect([...t.quads()]).toHaveLength(5);
    });

    test('deletes entries', () => {
        const t = new QuadTree({ x: 0, y: 0, width: 40, height: 20 }, 1);

        const e1 = new RectEntry(5, 1);

        expect(t.add(e1)).toBe(true);
        expect(t.size).toEqual(1);
        expect([...t.quads()]).toHaveLength(1);

        expect(t.delete(e1)).toBe(true);
        expect(t.size).toEqual(0);
        expect([...t.quads()]).toHaveLength(1);
    });

    test('deletes entries and merges', () => {
        const t = new QuadTree({ x: 0, y: 0, width: 40, height: 20 }, 1);

        const e1 = new RectEntry(5, 1);

        expect(t.add(e1)).toBe(true);
        expect(t.size).toEqual(1);
        expect([...t.quads()]).toHaveLength(1);

        const e2 = new RectEntry(10, 1);

        expect(t.add(e2)).toBe(true);
        expect(t.size).toEqual(2);
        expect([...t.quads()]).toHaveLength(5);

        expect(t.delete(e2, true)).toBe(true);
        expect(t.size).toEqual(1);
        expect([...t.quads()]).toHaveLength(1);
    });

    test('deletes entries and merges decoupled', () => {
        const t = new QuadTree({ x: 0, y: 0, width: 40, height: 20 }, 1);

        const e1 = new RectEntry(5, 1);

        expect(t.add(e1)).toBe(true);
        expect(t.size).toEqual(1);
        expect([...t.quads()]).toHaveLength(1);

        const e2 = new RectEntry(10, 1);

        expect(t.add(e2)).toBe(true);
        expect(t.size).toEqual(2);
        expect([...t.quads()]).toHaveLength(5);

        expect(t.delete(e2)).toBe(true);
        expect(t.size).toEqual(1);
        expect([...t.quads()]).toHaveLength(5);

        t.merge();

        expect([...t.quads()]).toHaveLength(1);
    });

    test('clears', () => {
        const t = new QuadTree({ x: 0, y: 0, width: 40, height: 20 }, 1);

        const e1 = new RectEntry(5, 1);
        const e2 = new RectEntry(10, 1);

        expect(t.add(e1)).toBe(true);
        expect(t.add(e2)).toBe(true);

        expect(t.size).toEqual(2);
        expect([...t.quads()]).toHaveLength(5);

        t.clear();

        expect(t.size).toEqual(0);
        expect([...t.quads()]).toHaveLength(1);
    });

    test('gets intersections', () => {
        const t = new QuadTree({ x: 0, y: 0, width: 40, height: 20 }, 1);

        const e1 = new RectEntry(5, 2);
        const e2 = new RectEntry(10, 2);

        t.add(e1);
        t.add(e2);

        // Touching
        const intersections1 = t.intersections({
            x: 4,
            y: 4,
            width: 1,
            height: 1,
        });

        expect(intersections1.has(e1)).toBe(false);
        expect(intersections1.has(e2)).toBe(false);

        // Contain
        const intersections2 = t.intersections({
            x: 4,
            y: 4,
            width: 4,
            height: 4,
        });

        expect(intersections2.has(e1)).toBe(true);
        expect(intersections2.has(e2)).toBe(false);

        // Within
        const intersections3 = t.intersections({
            x: 5.5,
            y: 5.5,
            width: 1,
            height: 1,
        });

        expect(intersections3.has(e1)).toBe(true);
        expect(intersections3.has(e2)).toBe(false);

        // Partial
        const intersections4 = t.intersections({
            x: 6,
            y: 6,
            width: 4,
            height: 4,
        });

        expect(intersections4.has(e1)).toBe(true);
        expect(intersections4.has(e2)).toBe(false);
    });
});
