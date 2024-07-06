import { describe, expect, test } from 'vitest';
import { Mat2D } from '../../src/math';
import { Rect } from '../../src/math/shapes/rect';
import { Vec2 } from '../../src/math/vec2';

describe('rect', () => {
    test('instances', () => {
        const r = new Rect(0, 0, 1, 1);
        expect(r).not.toBe(r.clone());
        expect(r.asReadonly()).toBe(r);
        expect(Rect.zero()).not.toBe(Rect.zero());
        expect(Rect.one()).not.toBe(Rect.one());
    });

    test('top right center', () => {
        const r = new Rect(0, 10, 100, 1000);

        expect(r.top).toBe(1010);
        expect(r.right).toBe(100);
        expect(r.cx).toBe(50);
        expect(r.cy).toBe(510);
    });

    test('equals', () => {
        expect(new Rect(1, 2, 3, 4).equals(new Rect(1, 2, 3, 4))).toBe(true);
        expect(
            new Rect(1, 2, 3, 4).equals({
                x: 1,
                y: 2,
                width: 3,
                height: 4,
            }),
        ).toBe(true);
    });

    test('contains point', () => {
        expect(new Rect(0, 0, 4, 4).containsPoint(new Vec2(1, 1))).toBe(true);
        expect(new Rect(0, 0, 4, 4).containsPoint(new Vec2(2, 2))).toBe(true);
    });

    test('contains border point', () => {
        expect(new Rect(0, 0, 4, 4).containsPoint(new Vec2(0, 0))).toBe(true);
        expect(new Rect(0, 0, 4, 4).containsPoint(new Vec2(0, 4))).toBe(true);

        expect(new Rect(0, 0, 4, 4).containsPoint(new Vec2(4, 4))).toBe(true);
        expect(new Rect(0, 0, 4, 4).containsPoint(new Vec2(4, 0))).toBe(true);

        expect(
            new Rect(0, 0, 4, 4).containsPoint(new Vec2(-0.0001, -0.0001)),
        ).toBe(false);
        expect(
            new Rect(0, 0, 4, 4).containsPoint(new Vec2(4.0001, 4.0001)),
        ).toBe(false);
    });

    test('does not intersect corners', () => {
        // Top left point
        expect(new Rect(2, 2, 2, 2).intersectsRect(new Rect(1, 1, 1, 1))).toBe(
            false,
        );
        // Bottom right point
        expect(new Rect(2, 2, 2, 2).intersectsRect(new Rect(4, 4, 1, 1))).toBe(
            false,
        );
    });

    test('does not intersect borders', () => {
        // Left border
        expect(new Rect(2, 2, 2, 2).intersectsRect(new Rect(1, 2, 1, 2))).toBe(
            false,
        );
        // Top border
        expect(new Rect(2, 2, 2, 2).intersectsRect(new Rect(2, 1, 2, 1))).toBe(
            false,
        );
        // Right border
        expect(new Rect(2, 2, 2, 2).intersectsRect(new Rect(4, 2, 1, 2))).toBe(
            false,
        );
        // Bottom border
        expect(new Rect(2, 2, 2, 2).intersectsRect(new Rect(2, 4, 2, 1))).toBe(
            false,
        );
    });

    test('intersects partial overlaps', () => {
        // Left and top overlap
        expect(
            new Rect(2, 2, 2, 2).intersectsRect(new Rect(1.5, 1.5, 1, 1)),
        ).toBe(true);
        // Left overlap
        expect(
            new Rect(2, 2, 2, 2).intersectsRect(new Rect(1.5, 2.5, 1, 1)),
        ).toBe(true);
        // Top overlap
        expect(
            new Rect(2, 2, 2, 2).intersectsRect(new Rect(2.5, 1.5, 1, 1)),
        ).toBe(true);
        // Right overlap
        expect(
            new Rect(2, 2, 2, 2).intersectsRect(new Rect(3.5, 2.5, 1, 1)),
        ).toBe(true);
        // Bottom overlap
        expect(
            new Rect(2, 2, 2, 2).intersectsRect(new Rect(2.5, 3.5, 1, 1)),
        ).toBe(true);
        // Bottom and right overlap
        expect(
            new Rect(2, 2, 2, 2).intersectsRect(new Rect(3.5, 3.5, 1, 1)),
        ).toBe(true);
    });

    test('intersects contained', () => {
        // Contained
        expect(new Rect(2, 2, 2, 2).intersectsRect(new Rect(1, 1, 4, 4))).toBe(
            true,
        );

        // Contains
        expect(
            new Rect(2, 2, 2, 2).intersectsRect(new Rect(2.5, 2.5, 1, 1)),
        ).toBe(true);
    });

    test('matrix mult', () => {
        const tra = Mat2D.identity().translate(10, -10);
        const rot = Mat2D.identity().rotateDegrees(90);
        const sca = Mat2D.identity().scale(2);

        const rect = new Rect(2, 2, 2, 2);

        const translated = rect.clone().multiplyMat(tra);

        expect(translated).toEqual({
            x: 12,
            y: -8,
            width: 2,
            height: 2,
        });

        const rotated = rect.clone().multiplyMat(rot);

        expect(rotated.x).toBeCloseTo(-4);
        expect(rotated.y).toBeCloseTo(2);
        expect(rotated.width).toBeCloseTo(2);
        expect(rotated.height).toBeCloseTo(2);

        const scaled = rect.clone().multiplyMat(sca);

        expect(scaled.x).toBeCloseTo(4);
        expect(scaled.y).toBeCloseTo(4);
        expect(scaled.width).toBeCloseTo(4);
        expect(scaled.height).toBeCloseTo(4);
    });

    test('matrix mult inverse', () => {
        const tra = Mat2D.identity().translate(10, -10);
        const rot = Mat2D.identity().rotateDegrees(90);
        const sca = Mat2D.identity().scale(2);

        const rect = new Rect(2, 2, 2, 2);

        const translated = rect.clone().multiplyMatInverse(tra);

        expect(translated).toEqual({
            x: -8,
            y: 12,
            width: 2,
            height: 2,
        });

        const rotated = rect.clone().multiplyMatInverse(rot);

        expect(rotated.x).toBeCloseTo(2);
        expect(rotated.y).toBeCloseTo(-4);
        expect(rotated.width).toBeCloseTo(2);
        expect(rotated.height).toBeCloseTo(2);

        const scaled = rect.clone().multiplyMatInverse(sca);

        expect(scaled.x).toBeCloseTo(1);
        expect(scaled.y).toBeCloseTo(1);
        expect(scaled.width).toBeCloseTo(1);
        expect(scaled.height).toBeCloseTo(1);
    });

    test('stays same if extended with contained', () => {
        const rect = new Rect(2, 2, 2, 2);

        expect(rect.clone().extend(new Rect(2.5, 2.5, 1, 1))).toEqual(rect);
    });

    test('extends', () => {
        const rect = new Rect(2, 2, 2, 2);

        // Left
        expect(rect.clone().extend(new Rect(1, 2, 2, 2))).toEqual(
            new Rect(1, 2, 3, 2),
        );

        // Top
        expect(rect.clone().extend(new Rect(2, 1, 2, 2))).toEqual(
            new Rect(2, 1, 2, 3),
        );

        // Right
        expect(rect.clone().extend(new Rect(3, 2, 2, 2))).toEqual(
            new Rect(2, 2, 3, 2),
        );

        // Bottom
        expect(rect.clone().extend(new Rect(2, 3, 2, 2))).toEqual(
            new Rect(2, 2, 2, 3),
        );
    });

    test('extends without overlap', () => {
        const rect = new Rect(2, 2, 2, 2);

        // Left
        expect(rect.clone().extend(new Rect(0, 2, 1, 1))).toEqual(
            new Rect(0, 2, 4, 2),
        );

        // Top
        expect(rect.clone().extend(new Rect(2, 0, 1, 1))).toEqual(
            new Rect(2, 0, 2, 4),
        );

        // Right
        expect(rect.clone().extend(new Rect(5, 2, 1, 1))).toEqual(
            new Rect(2, 2, 4, 2),
        );

        // Bottom
        expect(rect.clone().extend(new Rect(2, 5, 1, 1))).toEqual(
            new Rect(2, 2, 2, 4),
        );
    });

    test('clips', () => {
        const rect = new Rect(2, 2, 2, 2);

        expect(rect.clone().clip(new Rect(2, 2, 1, 1))).toEqual(
            new Rect(2, 2, 1, 1),
        );

        expect(rect.clone().clip(new Rect(3, 3, 1, 1))).toEqual(
            new Rect(3, 3, 1, 1),
        );

        expect(rect.clone().clip(new Rect(3, 3, 1, 1))).toEqual(
            new Rect(3, 3, 1, 1),
        );

        expect(rect.clone().clip(new Rect(1, 1, 2, 2))).toEqual(
            new Rect(2, 2, 1, 1),
        );

        expect(rect.clone().clip(new Rect(3, 3, 2, 2))).toEqual(
            new Rect(3, 3, 1, 1),
        );
    });

    test('clips non-overlaps to zero', () => {
        const rect = new Rect(2, 2, 2, 2);

        expect(rect.clone().clip(new Rect(0, 0, 1, 1))).toEqual(
            new Rect(2, 2, 0, 0),
        );

        expect(rect.clone().clip(new Rect(5, 5, 1, 1))).toEqual(
            new Rect(2, 2, 0, 0),
        );
    });
});
