import { expect, test } from 'vitest';
import { Vec2 } from '../../src/math';
import { Circle, Poly } from '../../src/math/shapes';

test('circle', () => {
    expect(new Circle(1, 2, 3).equals(new Circle(1, 2, 3))).toBe(true);
    expect(new Circle(1, 2, 3).equals(new Circle(1, 2, 3))).toBe(true);
});

test('circle contains', () => {
    expect(new Circle(0, 0, 4).contains(new Vec2(0, 0))).toBe(true);
    expect(new Circle(0, 0, 4).contains(new Vec2(4, 0))).toBe(true);
    expect(new Circle(0, 0, 4).contains(new Vec2(0, 4))).toBe(true);
    expect(new Circle(0, 0, 4).contains(new Vec2(-4, 0))).toBe(true);
    expect(new Circle(0, 0, 4).contains(new Vec2(0, -4))).toBe(true);

    expect(new Circle(0, 0, 4).contains(new Vec2(1, 1))).toBe(true);
    expect(new Circle(0, 0, 4).contains(new Vec2(2, 2))).toBe(true);

    expect(new Circle(0, 0, 4).contains(new Vec2(4.0001, 0))).toBe(false);
    expect(new Circle(0, 0, 4).contains(new Vec2(0, 4.0001))).toBe(false);
    expect(new Circle(0, 0, 4).contains(new Vec2(-4.0001, 0))).toBe(false);
    expect(new Circle(0, 0, 4).contains(new Vec2(0, -4.0001))).toBe(false);
});

test('poly contains', () => {
    expect(
        new Poly(
            new Vec2(0, 0),
            new Vec2(1, 0),
            new Vec2(1, 1),
            new Vec2(0, 1),
        ).contains(new Vec2(0.75, 0.5)),
    ).toBe(true);

    // Borders
    expect(
        new Poly(
            new Vec2(0, 0),
            new Vec2(1, 0),
            new Vec2(1, 1),
            new Vec2(0, 1),
        ).contains(new Vec2(0, 0)),
    ).toBe(true);
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

    // Outside borders
    expect(
        new Poly(
            new Vec2(0, 0),
            new Vec2(1, 0),
            new Vec2(1, 1),
            new Vec2(0, 1),
        ).contains(new Vec2(-0.0001, 0)),
    ).toBe(false);
    expect(
        new Poly(
            new Vec2(0, 0),
            new Vec2(1, 0),
            new Vec2(1, 1),
            new Vec2(0, 1),
        ).contains(new Vec2(1.0001, 0)),
    ).toBe(false);
    expect(
        new Poly(
            new Vec2(0, 0),
            new Vec2(1, 0),
            new Vec2(1, 1),
            new Vec2(0, 1),
        ).contains(new Vec2(0, -0.0001)),
    ).toBe(false);
    expect(
        new Poly(
            new Vec2(0, 0),
            new Vec2(1, 0),
            new Vec2(1, 1),
            new Vec2(0, 1),
        ).contains(new Vec2(0, 1.0001)),
    ).toBe(false);

    expect(
        new Poly(
            new Vec2(0, 0),
            new Vec2(1, 0),
            new Vec2(0.5, 0.25),
            new Vec2(0.5, 0.75),
            new Vec2(1, 1),
            new Vec2(0, 1),
        ).contains(new Vec2(0.75, 0.5)),
    ).toBe(false);
});
