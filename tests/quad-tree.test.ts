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

    test('deletes entries (spatial)', () => {
        const t = new QuadTree({ x: 0, y: 0, width: 40, height: 20 }, 1);

        const e1 = new RectEntry(5, 1);

        expect(t.add(e1)).toBe(true);
        expect(t.size).toEqual(1);
        expect([...t.quads()]).toHaveLength(1);

        expect(t.deleteSpatial(e1)).toBe(true);
        expect(t.size).toEqual(0);
        expect([...t.quads()]).toHaveLength(1);
    });

    test('does not delete entries if moved (spatial)', () => {
        const t = new QuadTree({ x: 0, y: 0, width: 40, height: 40 }, 1, 1);

        const e1 = new RectEntry(5, 1);
        const e2 = new RectEntry(5, 1);

        expect(t.add(e1)).toBe(true);
        expect(t.add(e2)).toBe(true);
        expect(t.size).toEqual(2);
        expect([...t.quads()]).toHaveLength(5);

        e1.rect.x += 20;

        expect(t.deleteSpatial(e1)).toBe(false);
        expect(t.size).toEqual(2);
    });

    test('updates moved entry', () => {
        const t = new QuadTree({ x: 0, y: 0, width: 40, height: 40 }, 1, 1);

        const e1 = new RectEntry(5, 1);

        expect(t.add(e1)).toBe(true);
        expect(t.size).toEqual(1);

        expect(t.intersections(new Rect(5, 5, 1, 1)).size).toBe(1);

        e1.rect.x = 20;
        e1.rect.y = 20;

        expect(t.update(e1)).toBe(true);

        expect(t.intersections(new Rect(5, 5, 1, 1)).size).toBe(0);
        expect(t.intersections(new Rect(20, 20, 1, 1)).size).toBe(1);
        expect(t.size).toEqual(1);
    });

    test('adds in update', () => {
        const t = new QuadTree({ x: 0, y: 0, width: 40, height: 40 }, 1, 1);

        const e1 = new RectEntry(50, 1);

        expect(t.add(e1)).toBe(false);
        expect(t.size).toEqual(0);

        e1.rect.x = 5;
        e1.rect.y = 5;

        expect(t.update(e1)).toBe(true);

        expect(t.intersections(new Rect(5, 5, 1, 1)).size).toBe(1);
        expect(t.intersections(new Rect(50, 50, 1, 1)).size).toBe(0);
        expect(t.size).toEqual(1);
    });

    test('deletes in update', () => {
        const t = new QuadTree({ x: 0, y: 0, width: 40, height: 40 }, 1, 1);

        const e1 = new RectEntry(5, 1);

        expect(t.add(e1)).toBe(true);
        expect(t.size).toEqual(1);

        expect(t.intersections(new Rect(5, 5, 1, 1)).size).toBe(1);

        e1.rect.x = 50;
        e1.rect.y = 50;

        expect(t.update(e1)).toBe(false);

        expect(t.intersections(new Rect(5, 5, 1, 1)).size).toBe(0);
        expect(t.intersections(new Rect(50, 50, 1, 1)).size).toBe(0);
        expect(t.size).toEqual(0);
    });

    test('does not merge quads with subdivided children', () => {
        const t = new QuadTree({ x: 0, y: 0, width: 40, height: 40 }, 2, 2);

        t.add(new RectEntry(3, 1));
        t.add(new RectEntry(3, 1));

        expect([...t.quads()]).toHaveLength(1);

        const e1 = new RectEntry(3, 1);

        t.add(e1);

        expect([...t.quads()]).toHaveLength(1 + 4 + 4);

        t.merge();

        expect([...t.quads()]).toHaveLength(1 + 4 + 4);

        t.delete(e1);

        expect([...t.quads()]).toHaveLength(1 + 4 + 4);

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

    test('only merges unique items', () => {
        const t = new QuadTree({ x: 0, y: 0, width: 10, height: 10 }, 2);

        const r1 = new RectEntry(1, 1);
        const r2 = new RectEntry(7, 1);
        const r3 = new RectEntry(4, 2);

        expect([...t.quads()].length).toBe(1);

        t.add(r1);
        t.add(r2);

        expect([...t.quads()].length).toBe(1);

        // Subdivides.
        t.add(r3);

        let quads = [...t.quads()];

        expect(quads.length).toBe(5);

        // Root has none.
        expect(quads[0]!.entryCount).toBe(0);
        // r3 overlaps all, and r1/r2 each in one.
        expect(quads[1]!.entryCount).toBe(2);
        expect(quads[2]!.entryCount).toBe(1);
        expect(quads[3]!.entryCount).toBe(1);
        expect(quads[4]!.entryCount).toBe(2);

        // Removing one merges.
        t.delete(r1, true);

        quads = [...t.quads()];

        // Only root left.
        expect(quads.length).toBe(1);

        // Overlapping item is not added multiple times.
        expect(quads[0]!.entryCount).toBe(2);
    });
});
