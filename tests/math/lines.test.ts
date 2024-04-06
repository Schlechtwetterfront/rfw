import { describe, expect, test } from 'vitest';
import { Vec2 } from '../../src';
import { linesIntersect } from '../../src/math/util';

describe('linesIntersect', () => {
    test('do not intersect colinear', () => {
        expect(
            linesIntersect(
                new Vec2(0, 0),
                new Vec2(2, 0),
                new Vec2(1, 0),
                new Vec2(3, 0),
            ),
        ).toBe(false);

        expect(
            linesIntersect(
                new Vec2(0, 0),
                new Vec2(0, 2),
                new Vec2(0, 1),
                new Vec2(0, 3),
            ),
        ).toBe(false);

        expect(
            linesIntersect(
                new Vec2(0, 0),
                new Vec2(2, 2),
                new Vec2(1, 1),
                new Vec2(3, 3),
            ),
        ).toBe(false);
    });

    test('intersect touching', () => {
        expect(
            linesIntersect(
                new Vec2(0, 0),
                new Vec2(2, 0),
                new Vec2(1, 0),
                new Vec2(1, 2),
            ),
        ).toBe(true);

        expect(
            linesIntersect(
                new Vec2(0, 0),
                new Vec2(0, 2),
                new Vec2(0, 1),
                new Vec2(2, 1),
            ),
        ).toBe(true);
    });

    test('intersect', () => {
        expect(
            linesIntersect(
                new Vec2(0, 0),
                new Vec2(2, 0),
                new Vec2(1, -1),
                new Vec2(1, 1),
            ),
        ).toBe(true);

        expect(
            linesIntersect(
                new Vec2(0, 0),
                new Vec2(0, 2),
                new Vec2(-1, 1),
                new Vec2(1, 1),
            ),
        ).toBe(true);

        expect(
            linesIntersect(
                new Vec2(0, 0),
                new Vec2(2, 2),
                new Vec2(2, 0),
                new Vec2(0, 2),
            ),
        ).toBe(true);

        expect(
            linesIntersect(
                new Vec2(0, 0),
                new Vec2(-2, -2),
                new Vec2(-2, 0),
                new Vec2(0, -2),
            ),
        ).toBe(true);
    });
});
