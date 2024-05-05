import { describe, expect, test } from 'vitest';
import { Circle } from '../../src/math/shapes/circle';
import { Rect } from '../../src/math/shapes/rect';
import { Vec2 } from '../../src/math/vec2';

describe('circle', () => {
    test('new instances', () => {
        const c = new Circle(0, 0, 1);
        expect(c).not.toBe(c.clone());
        expect(c.asReadonly()).toBe(c);
        expect(Circle.zero()).not.toBe(Circle.zero());
        expect(Circle.one()).not.toBe(Circle.one());
    });

    test('equals', () => {
        expect(new Circle(1, 2, 3).equals(new Circle(1, 2, 3))).toBe(true);
        expect(
            new Circle(1, 2, 3).equals({
                x: 1,
                y: 2,
                radius: 3,
            }),
        ).toBe(true);
    });

    test('contains inner point', () => {
        expect(new Circle(0, 0, 4).containsPoint(new Vec2(0, 0))).toBe(true);
        expect(new Circle(0, 0, 4).containsPoint(new Vec2(-3, 0))).toBe(true);
        expect(new Circle(0, 0, 4).containsPoint(new Vec2(3, 0))).toBe(true);
    });

    test('contains border point', () => {
        expect(new Circle(0, 0, 4).containsPoint(new Vec2(4, 0))).toBe(true);
        expect(new Circle(0, 0, 4).containsPoint(new Vec2(-4, 0))).toBe(true);
        expect(new Circle(0, 0, 4).containsPoint(new Vec2(0, -4))).toBe(true);
        expect(new Circle(0, 0, 4).containsPoint(new Vec2(0, 4))).toBe(true);

        expect(new Circle(0, 0, 4).containsPoint(new Vec2(4.0001, 0))).toBe(
            false,
        );
        expect(new Circle(0, 0, 4).containsPoint(new Vec2(-4.0001, 0))).toBe(
            false,
        );
    });

    test('contains not corner/outer point', () => {
        expect(new Circle(0, 0, 4).containsPoint(new Vec2(-4, -4))).toBe(false);
        expect(new Circle(0, 0, 4).containsPoint(new Vec2(4, -4))).toBe(false);
        expect(new Circle(0, 0, 4).containsPoint(new Vec2(4, 4))).toBe(false);
        expect(new Circle(0, 0, 4).containsPoint(new Vec2(-4, 4))).toBe(false);
    });

    test('does not intersect borders', () => {
        expect(new Circle(0, 0, 2).intersectsCircle(new Circle(0, -4, 2))).toBe(
            false,
        );
        expect(new Circle(0, 0, 2).intersectsCircle(new Circle(4, 0, 2))).toBe(
            false,
        );
        expect(new Circle(0, 0, 2).intersectsCircle(new Circle(0, 4, 2))).toBe(
            false,
        );
        expect(new Circle(0, 0, 2).intersectsCircle(new Circle(-4, 0, 2))).toBe(
            false,
        );
    });

    test('intersects partial overlaps', () => {
        expect(new Circle(0, 0, 2).intersectsCircle(new Circle(0, -2, 1))).toBe(
            true,
        );
        expect(new Circle(0, 0, 2).intersectsCircle(new Circle(2, 0, 1))).toBe(
            true,
        );
        expect(new Circle(0, 0, 2).intersectsCircle(new Circle(0, 2, 1))).toBe(
            true,
        );
        expect(new Circle(0, 0, 2).intersectsCircle(new Circle(-2, 0, 1))).toBe(
            true,
        );
    });

    test('intersects when contained', () => {
        expect(new Circle(0, 0, 1).intersectsCircle(new Circle(0, 0, 2))).toBe(
            true,
        );
        expect(
            new Circle(1, 1, 0.1).intersectsCircle(new Circle(0, 0, 2)),
        ).toBe(true);
    });

    test('intersects contained', () => {
        expect(new Circle(0, 0, 2).intersectsCircle(new Circle(0, 0, 1))).toBe(
            true,
        );
        expect(
            new Circle(0, 0, 2).intersectsCircle(new Circle(1, 1, 0.1)),
        ).toBe(true);
    });

    test('does not intersect rect borders', () => {
        expect(new Circle(0, 0, 2).intersectsRect(new Rect(-1, -4, 2, 2))).toBe(
            false,
        );
        expect(new Circle(0, 0, 2).intersectsRect(new Rect(2, -1, 2, 2))).toBe(
            false,
        );
        expect(new Circle(0, 0, 2).intersectsRect(new Rect(-1, 2, 2, 2))).toBe(
            false,
        );
        expect(new Circle(0, 0, 2).intersectsRect(new Rect(-4, -1, 2, 2))).toBe(
            false,
        );
    });

    test('intersects partial rect overlaps', () => {
        expect(new Circle(0, 0, 2).intersectsRect(new Rect(-1, -3, 2, 2))).toBe(
            true,
        );
        expect(new Circle(0, 0, 2).intersectsRect(new Rect(1, -1, 2, 2))).toBe(
            true,
        );
        expect(new Circle(0, 0, 2).intersectsRect(new Rect(-1, 1, 2, 2))).toBe(
            true,
        );
        expect(new Circle(0, 0, 2).intersectsRect(new Rect(-3, -1, 2, 2))).toBe(
            true,
        );
    });

    test('intersects rect when contained', () => {
        expect(new Circle(0, 0, 2).intersectsRect(new Rect(-2, -2, 4, 4))).toBe(
            true,
        );
        expect(new Circle(0, 0, 2).intersectsRect(new Rect(-4, -4, 8, 8))).toBe(
            true,
        );
    });

    test('intersects contained rect', () => {
        expect(new Circle(0, 0, 2).intersectsRect(new Rect(0, 0, 1, 1))).toBe(
            true,
        );
        expect(new Circle(0, 0, 2).intersectsRect(new Rect(-1, -1, 1, 1))).toBe(
            true,
        );
    });
});
