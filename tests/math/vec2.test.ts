import { describe, expect, test } from 'vitest';
import { Mat2D, Vec2 } from '../../src/math';

function right() {
    return new Vec2(1, 0);
}

describe('vec2', () => {
    test('vec2', () => {
        expect(Vec2.zero()).toEqual({ x: 0, y: 0 });

        expect(Vec2.one().clone()).toEqual(Vec2.one());

        const v = Vec2.one();
        expect(v.clone()).not.toBe(v);

        expect(new Vec2(10, 0).normalize()).toEqual(new Vec2(1, 0));
        expect(new Vec2(0, 1).normalize()).toEqual(new Vec2(0, 1));

        expect(new Vec2(0, 0).copyFrom(new Vec2(2, 4))).toEqual(new Vec2(2, 4));
    });

    test('equality', () => {
        expect(Vec2.zero().equalsVec(Vec2.zero())).toEqual(true);
        expect(Vec2.one().equalsVec(Vec2.zero())).toEqual(false);
        expect(Vec2.one().equals(1, 1)).toEqual(true);
        expect(Vec2.one().equals(1.5, 0.5, 0.6)).toEqual(true);

        expect(Vec2.one().componentsEqual()).toBe(true);
        expect(Vec2.zero().componentsEqual()).toBe(true);
        expect(new Vec2(10, 10).componentsEqual()).toBe(true);
        expect(new Vec2(10, 9).componentsEqual()).toBe(false);
    });

    test('set', () => {
        expect(Vec2.zero()).toEqual({ x: 0, y: 0 });
        expect(Vec2.zero().set(1)).toEqual({ x: 1, y: 1 });
        expect(Vec2.zero().set(1, 0.5)).toEqual({ x: 1, y: 0.5 });
    });

    test('length', () => {
        expect(Vec2.zero().length).toEqual(0);
        expect(new Vec2(1, 1).length).toBeCloseTo(1.4142, 4);
        expect(new Vec2(0, 1).length).toBeCloseTo(1);
        expect(new Vec2(1, 0).length).toBeCloseTo(1);
    });

    test('dot', () => {
        expect(new Vec2(1, 1).dotVec(new Vec2(1, 1))).toEqual(2);
        expect(new Vec2(4, -2).dotVec(new Vec2(3, 6))).toEqual(0);
    });

    test('dir', () => {
        expect(new Vec2(1, 1).makeDirTo(2, 1)).toEqual({ x: 1, y: 0 });
    });

    test('angle', () => {
        expect(Vec2.zero().radians).toEqual(0);

        expect(new Vec2(1, 0).radians).toBeCloseTo(0, 1);
        expect(new Vec2(0, 1).radians).toBeCloseTo(Math.PI / 2);
        expect(new Vec2(-1, 0).radians).toBeCloseTo(Math.PI);
        expect(new Vec2(0, -1).radians).toBeCloseTo(Math.PI * 1.5);

        expect(new Vec2(1, 1).radiansBetweenVec(new Vec2(-1, 1))).toBeCloseTo(
            Math.PI / 2,
        );
        expect(new Vec2(1, 0).radiansBetweenVec(new Vec2(-1, 0))).toBeCloseTo(
            Math.PI,
        );
        expect(new Vec2(0, 1).radiansBetweenVec(new Vec2(0, -1))).toBeCloseTo(
            Math.PI,
        );
        expect(new Vec2(1, 1).radiansBetweenVec(new Vec2(-1, -1))).toBeCloseTo(
            Math.PI,
        );

        expect(new Vec2(1, 1).radiansBetween(-1, -1)).toBeCloseTo(Math.PI);

        expect(new Vec2(1, 0).degrees).toBeCloseTo(0);
        expect(new Vec2(0, 1).degrees).toBeCloseTo(90);
        expect(new Vec2(-1, 0).degrees).toBeCloseTo(180);
        expect(new Vec2(0, -1).degrees).toBeCloseTo(270);

        expect(new Vec2(1, 1).degreesBetweenVec(new Vec2(-1, 1))).toBeCloseTo(
            90,
        );
        expect(new Vec2(1, 0).degreesBetweenVec(new Vec2(-1, 0))).toBeCloseTo(
            180,
        );
        expect(new Vec2(0, 1).degreesBetweenVec(new Vec2(0, -1))).toBeCloseTo(
            180,
        );
        expect(new Vec2(1, 1).degreesBetweenVec(new Vec2(-1, -1))).toBeCloseTo(
            180,
        );

        expect(new Vec2(1, 1).degreesBetween(-1, -1)).toBeCloseTo(180);

        expect(new Vec2(1, 1).degreesTo(2, 1)).toBe(0);
        expect(new Vec2(1, 1).degreesTo(1, 2)).toBe(90);
        expect(new Vec2(-1, -1).degreesTo(-2, -1)).toBe(180);
        expect(new Vec2(0, 0).degreesTo(0, -1)).toBe(270);
        expect(new Vec2(1, 1).degreesTo(2, 2)).toBe(45);
    });

    test('rotate degrees', () => {
        expect(right().rotateDegrees(90).x).toBeCloseTo(0);
        expect(right().rotateDegrees(90).y).toBeCloseTo(1);
        expect(right().rotateDegrees(-90).y).toBeCloseTo(-1);
        expect(right().rotateDegrees(180).x).toBeCloseTo(-1);

        expect(right().rotateDegrees(90, 0, 0).x).toBeCloseTo(0);
        expect(right().rotateDegrees(90, 0, 0).y).toBeCloseTo(1);

        expect(right().rotateDegreesVec(90, new Vec2(0, 0)).x).toBeCloseTo(0);
        expect(right().rotateDegreesVec(90, new Vec2(0, 0)).y).toBeCloseTo(1);

        expect(right().rotateDegreesVec(90, new Vec2(0, 1)).x).toBeCloseTo(1);
        expect(right().rotateDegreesVec(90, new Vec2(0, 1)).y).toBeCloseTo(2);
    });

    test('rotate radians', () => {
        expect(right().rotateRadians(Math.PI / 2).x).toBeCloseTo(0);
        expect(right().rotateRadians(Math.PI / 2).y).toBeCloseTo(1);
        expect(right().rotateRadians(-Math.PI / 2).y).toBeCloseTo(-1);
        expect(right().rotateRadians(Math.PI).x).toBeCloseTo(-1);

        expect(right().rotateRadians(Math.PI / 2, 0, 0).x).toBeCloseTo(0);
        expect(right().rotateRadians(Math.PI / 2, 0, 0).y).toBeCloseTo(1);

        expect(
            right().rotateRadiansVec(Math.PI / 2, new Vec2(0, 0)).x,
        ).toBeCloseTo(0);
        expect(
            right().rotateRadiansVec(Math.PI / 2, new Vec2(0, 0)).y,
        ).toBeCloseTo(1);

        expect(
            right().rotateRadiansVec(Math.PI / 2, new Vec2(0, 1)).x,
        ).toBeCloseTo(1);
        expect(
            right().rotateRadiansVec(Math.PI / 2, new Vec2(0, 1)).y,
        ).toBeCloseTo(2);
    });

    test('add', () => {
        expect(Vec2.zero().add(2)).toEqual({ x: 2, y: 2 });
        expect(Vec2.zero().add(2, 1)).toEqual({ x: 2, y: 1 });
        expect(Vec2.zero().addVec({ x: 3, y: 1 })).toEqual({ x: 3, y: 1 });

        const v = Vec2.zero();
        expect(v.add(1)).toBe(v);
    });

    test('sub', () => {
        expect(Vec2.zero().subtract(2)).toEqual({ x: -2, y: -2 });
        expect(Vec2.zero().subtract(2, 1)).toEqual({ x: -2, y: -1 });
        expect(Vec2.zero().subtractVec({ x: 3, y: 1 })).toEqual({
            x: -3,
            y: -1,
        });

        const v = Vec2.zero();
        expect(v.subtract(1)).toBe(v);
    });

    test('mul', () => {
        expect(new Vec2(2, 1).multiply(2)).toEqual({ x: 4, y: 2 });
        expect(new Vec2(2, 3).multiply(2, 1)).toEqual({ x: 4, y: 3 });
        expect(new Vec2(2, 1).multiplyVec({ x: 3, y: 2 })).toEqual({
            x: 6,
            y: 2,
        });

        const v = Vec2.zero();
        expect(v.multiply(1)).toBe(v);
    });

    test('div', () => {
        expect(new Vec2(4, 2).divide(2)).toEqual({ x: 2, y: 1 });
        expect(new Vec2(4, 2).divide(2, 1)).toEqual({ x: 2, y: 2 });
        expect(new Vec2(3, 2).divideVec({ x: 3, y: 1 })).toEqual({
            x: 1,
            y: 2,
        });

        const v = Vec2.zero();
        expect(v.divide(1)).toBe(v);
    });

    test('mat', () => {
        const scaleMat = Mat2D.fromScale(2);
        const rotationMat = Mat2D.fromRotation(90);
        const translationMat = Mat2D.fromTranslation(10, 10);

        expect(right().multiplyMat(scaleMat)).toEqual({ x: 2, y: 0 });
        expect(right().multiplyMat(rotationMat).degrees).toEqual(90);
        expect(right().multiplyMat(translationMat)).toEqual({
            x: 11,
            y: 10,
        });

        expect(right().multiplyMatInverse(scaleMat)).toEqual({
            x: 0.5,
            y: 0,
        });
        expect(right().multiplyMatInverse(rotationMat).degrees).toEqual(270);
        expect(right().multiplyMatInverse(translationMat)).toEqual({
            x: -9,
            y: -10,
        });

        const sr = right().multiplyMat(scaleMat).multiplyMat(rotationMat);

        expect(sr.degrees).toEqual(90);
        expect(sr.x).toBeCloseTo(0);
        expect(sr.y).toBeCloseTo(2);

        const st = new Vec2(1, 0)
            .multiplyMat(scaleMat)
            .multiplyMat(translationMat);

        expect(st).toEqual({ x: 1 * 2 + 10, y: 0 * 2 + 10 });

        const tsr = right()
            .multiplyMat(translationMat)
            .multiplyMat(scaleMat)
            .multiplyMat(rotationMat);

        expect(tsr).toEqual({ x: -20, y: 22 });
    });
});
