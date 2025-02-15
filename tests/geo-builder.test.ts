import { describe, expect, test } from 'vitest';
import { arc, arcAtDegrees, arcTo, line, linePath, pointAt, vec } from '../src';

describe('geo builder', () => {
    test('square', () => {
        const def = linePath(
            pointAt(0, 0),
            line(10, 0),
            line(0, 10),
            line(-10, 0),
        );

        expect(def).toBeDefined();

        const points = def.build();

        expect(points.length).toBe(4);

        expect(points[0]).toEqual(vec(0, 0));
        expect(points[1]).toEqual(vec(10, 0));
        expect(points[2]).toEqual(vec(10, 10));
        expect(points[3]).toEqual(vec(0, 10));
    });

    test('arc clockwise', () => {
        const def = linePath(
            arcAtDegrees(0, 0, 10, 90, 0, {
                interval: 2,
                intervalKind: 'segments',
            }),
        );

        expect(def).toBeDefined();

        const points = def.build();

        expect(points.length).toBe(3);

        expect(points[0]!.x).toBeCloseTo(0);
        expect(points[0]!.y).toBeCloseTo(10);

        expect(points[2]!.x).toBeCloseTo(10);
        expect(points[2]!.y).toBeCloseTo(0);
    });

    test('arc counterclockwise', () => {
        const def = linePath(
            arcAtDegrees(0, 10, 10, -90, 0, {
                interval: 2,
                intervalKind: 'segments',
            }),
        );

        expect(def).toBeDefined();

        const points = def.build();

        expect(points.length).toBe(3);

        expect(points[0]!.x).toBeCloseTo(0);
        expect(points[0]!.y).toBeCloseTo(0);

        expect(points[2]!.x).toBeCloseTo(10);
        expect(points[2]!.y).toBeCloseTo(10);
    });

    test('arcTo clockwise', () => {
        const def = linePath(
            pointAt(0, 0),
            arcTo(10, 0, 10, -10, 10, {
                interval: 2,
                intervalKind: 'segments',
            }),
        );

        expect(def).toBeDefined();

        const points = def.build();

        expect(points.length).toBe(3);

        expect(points[0]!).toEqual(vec(0, 0));

        expect(points[2]!.x).toBeCloseTo(10);
        expect(points[2]!.y).toBeCloseTo(-10);
    });

    test('arcTo counterclockwise', () => {
        const def = linePath(
            pointAt(0, 0),
            arcTo(10, 0, 10, 10, 10, { interval: 2, intervalKind: 'segments' }),
        );

        expect(def).toBeDefined();

        const points = def.build();

        expect(points.length).toBe(3);

        expect(points[0]!).toEqual(vec(0, 0));

        expect(points[2]!.x).toBeCloseTo(10);
        expect(points[2]!.y).toBeCloseTo(10);
    });

    test('arc', () => {
        const def = linePath(
            pointAt(0, 0),
            arc(10, 0, 10, -10, 10, { interval: 2, intervalKind: 'segments' }),
        );

        expect(def).toBeDefined();

        const points = def.build();

        expect(points.length).toBe(3);

        expect(points[0]!).toEqual(vec(0, 0));

        expect(points[2]!.x).toBeCloseTo(10);
        expect(points[2]!.y).toBeCloseTo(-10);
    });
});
