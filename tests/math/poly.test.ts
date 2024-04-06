import { describe, expect, test } from 'vitest';
import { Vec2 } from '../../src/math';
import { Poly, Rect } from '../../src/math/shapes';

describe('poly', () => {
    const tri = new Poly(new Vec2(0, 0), new Vec2(2, 2), new Vec2(-2, 2));

    test('new instances', () => {
        const p = new Poly(new Vec2(0, 0), new Vec2(1, 0), new Vec2(0, 1));
        expect(p.clone()).not.toBe(p);
        expect(p.asReadOnly()).toBe(p);
        expect(new Poly()).toBeTruthy();
    });

    test('equals', () => {
        expect(
            new Poly(new Vec2(0, 0), new Vec2(1, 0), new Vec2(0, 1)).equals(
                new Poly(new Vec2(0, 0), new Vec2(1, 0)),
            ),
        ).toBe(false);

        expect(
            new Poly(new Vec2(0, 0), new Vec2(1, 0), new Vec2(0, 1)).equals(
                new Poly(new Vec2(0, 0), new Vec2(1, 0), new Vec2(0, 1)),
            ),
        ).toBe(true);

        expect(
            new Poly(new Vec2(0, 0), new Vec2(1, 0), new Vec2(0, 1)).equals({
                points: [
                    {
                        x: 0,
                        y: 0,
                    },
                    { x: 1, y: 0 },
                    { x: 0, y: 1 },
                ],
            }),
        ).toBe(true);
    });

    test('contains point', () => {
        expect(
            new Poly(
                new Vec2(0, 0),
                new Vec2(1, 0),
                new Vec2(1, 1),
                new Vec2(0, 1),
            ).containsPoint(new Vec2(0.75, 0.5)),
        ).toBe(true);

        // Borders
        expect(
            new Poly(
                new Vec2(0, 0),
                new Vec2(1, 0),
                new Vec2(1, 1),
                new Vec2(0, 1),
            ).containsPoint(new Vec2(0, 0)),
        ).toBe(true);

        // Outside borders
        expect(
            new Poly(
                new Vec2(0, 0),
                new Vec2(1, 0),
                new Vec2(1, 1),
                new Vec2(0, 1),
            ).containsPoint(new Vec2(-0.0001, 0)),
        ).toBe(false);
        expect(
            new Poly(
                new Vec2(0, 0),
                new Vec2(1, 0),
                new Vec2(1, 1),
                new Vec2(0, 1),
            ).containsPoint(new Vec2(1.0001, 0)),
        ).toBe(false);
        expect(
            new Poly(
                new Vec2(0, 0),
                new Vec2(1, 0),
                new Vec2(1, 1),
                new Vec2(0, 1),
            ).containsPoint(new Vec2(0, -0.0001)),
        ).toBe(false);
        expect(
            new Poly(
                new Vec2(0, 0),
                new Vec2(1, 0),
                new Vec2(1, 1),
                new Vec2(0, 1),
            ).containsPoint(new Vec2(0, 1.0001)),
        ).toBe(false);

        expect(
            new Poly(
                new Vec2(0, 0),
                new Vec2(1, 0),
                new Vec2(0.5, 0.25),
                new Vec2(0.5, 0.75),
                new Vec2(1, 1),
                new Vec2(0, 1),
            ).containsPoint(new Vec2(0.75, 0.5)),
        ).toBe(false);
    });

    test('contains border point', () => {
        // todo: Non-robust algorithm makes this not work
        // expect(
        //     new Poly(
        //         new Vec2(0, 0),
        //         new Vec2(1, 0),
        //         new Vec2(1, 1),
        //         new Vec2(0, 1)
        //     ).contains(new Vec2(1, 0))
        // ).toBe(true);
        // expect(
        //     new Poly(
        //         new Vec2(0, 0),
        //         new Vec2(1, 0),
        //         new Vec2(1, 1),
        //         new Vec2(0, 1)
        //     ).contains(new Vec2(1, 1))
        // ).toBe(true);
        // expect(
        //     new Poly(
        //         new Vec2(0, 0),
        //         new Vec2(1, 0),
        //         new Vec2(1, 1),
        //         new Vec2(0, 1)
        //     ).contains(new Vec2(0, 1))
        // ).toBe(true);
    });

    test('does not intersect rect borders', () => {
        expect(tri.intersectsRect(new Rect(0, 2, 2, 2))).toBe(false);
        expect(tri.intersectsRect(new Rect(-1, -2, 2, 2))).toBe(false);
    });

    test('intersects partial rect overlaps', () => {
        expect(tri.intersectsRect(new Rect(0, 1.9, 2, 2))).toBe(true);
        expect(tri.intersectsRect(new Rect(0, 0, 2, 2))).toBe(true);
        expect(tri.intersectsRect(new Rect(-2, 0, 2, 2))).toBe(true);
    });

    test('intersects rect when contained', () => {
        expect(tri.intersectsRect(new Rect(-2, -2, 4, 4))).toBe(true);
        expect(tri.intersectsRect(new Rect(-4, -4, 8, 8))).toBe(true);
    });

    test('intersects contained rect', () => {
        expect(tri.intersectsRect(new Rect(-0.5, 1, 0.5, 0.5))).toBe(true);
        expect(tri.intersectsRect(new Rect(-0.5, 1, 1, 1))).toBe(true);
    });
});
