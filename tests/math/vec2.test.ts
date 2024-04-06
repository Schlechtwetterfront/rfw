import { describe, expect, test } from 'vitest';
import { Mat2D, Vec2 } from '../../src/math';

describe('vec2', () => {
    test('vec2', () => {
        expect(Vec2.ZERO).toEqual({ x: 0, y: 0 });

        expect(Vec2.ZERO.equalsVec(Vec2.ZERO)).toEqual(true);
        expect(Vec2.RIGHT.equalsVec(Vec2.ZERO)).toEqual(false);
        expect(Vec2.RIGHT.equals(1, 0)).toEqual(true);
        expect(Vec2.RIGHT.equals(1.5, 0, 0.6)).toEqual(true);

        expect(Vec2.RIGHT.clone()).toEqual(Vec2.RIGHT);

        const v = Vec2.RIGHT;
        expect(v.clone()).not.toBe(v);

        expect(new Vec2(10, 0).normalize()).toEqual(Vec2.RIGHT);
        expect(new Vec2(0, 1).normalize()).toEqual(Vec2.UP);

        expect(new Vec2(0, 0).copyFrom(new Vec2(2, 4))).toEqual(new Vec2(2, 4));
    });

    test('set', () => {
        expect(Vec2.ZERO).toEqual({ x: 0, y: 0 });
        expect(Vec2.ZERO.set(1)).toEqual({ x: 1, y: 1 });
        expect(Vec2.ZERO.set(1, 0.5)).toEqual({ x: 1, y: 0.5 });
    });

    test('length', () => {
        expect(Vec2.ZERO.length).toEqual(0);
        expect(new Vec2(1, 1).length).toBeCloseTo(1.4142, 4);
        expect(new Vec2(0, 1).length).toBeCloseTo(1);
        expect(new Vec2(1, 0).length).toBeCloseTo(1);
    });

    test('dot', () => {
        expect(new Vec2(1, 1).dot(new Vec2(1, 1))).toEqual(2);
        expect(new Vec2(4, -2).dot(new Vec2(3, 6))).toEqual(0);
    });

    test('angle', () => {
        expect(Vec2.ZERO.radians).toEqual(0);

        expect(new Vec2(1, 0).radians).toBeCloseTo(0, 1);
        expect(new Vec2(0, 1).radians).toBeCloseTo(Math.PI / 2);
        expect(new Vec2(-1, 0).radians).toBeCloseTo(Math.PI);
        expect(new Vec2(0, -1).radians).toBeCloseTo(Math.PI * 1.5);

        expect(new Vec2(1, 1).radiansToVec(new Vec2(-1, 1))).toBeCloseTo(
            Math.PI / 2,
        );
        expect(new Vec2(1, 0).radiansToVec(new Vec2(-1, 0))).toBeCloseTo(
            Math.PI,
        );
        expect(new Vec2(0, 1).radiansToVec(new Vec2(0, -1))).toBeCloseTo(
            Math.PI,
        );
        expect(new Vec2(1, 1).radiansToVec(new Vec2(-1, -1))).toBeCloseTo(
            Math.PI,
        );

        expect(new Vec2(1, 1).radiansTo(-1, -1)).toBeCloseTo(Math.PI);

        expect(new Vec2(1, 0).degrees).toBeCloseTo(0);
        expect(new Vec2(0, 1).degrees).toBeCloseTo(90);
        expect(new Vec2(-1, 0).degrees).toBeCloseTo(180);
        expect(new Vec2(0, -1).degrees).toBeCloseTo(270);

        expect(new Vec2(1, 1).degreesToVec(new Vec2(-1, 1))).toBeCloseTo(90);
        expect(new Vec2(1, 0).degreesToVec(new Vec2(-1, 0))).toBeCloseTo(180);
        expect(new Vec2(0, 1).degreesToVec(new Vec2(0, -1))).toBeCloseTo(180);
        expect(new Vec2(1, 1).degreesToVec(new Vec2(-1, -1))).toBeCloseTo(180);

        expect(new Vec2(1, 1).degreesTo(-1, -1)).toBeCloseTo(180);
    });

    test('rotate degrees', () => {
        expect(Vec2.RIGHT.rotateDegrees(90).x).toBeCloseTo(0);
        expect(Vec2.RIGHT.rotateDegrees(90).y).toBeCloseTo(1);
        expect(Vec2.RIGHT.rotateDegrees(-90).y).toBeCloseTo(-1);
        expect(Vec2.RIGHT.rotateDegrees(180).x).toBeCloseTo(-1);

        expect(Vec2.RIGHT.rotateDegrees(90, 0, 0).x).toBeCloseTo(0);
        expect(Vec2.RIGHT.rotateDegrees(90, 0, 0).y).toBeCloseTo(1);

        expect(Vec2.RIGHT.rotateDegreesVec(90, new Vec2(0, 0)).x).toBeCloseTo(
            0,
        );
        expect(Vec2.RIGHT.rotateDegreesVec(90, new Vec2(0, 0)).y).toBeCloseTo(
            1,
        );

        expect(Vec2.RIGHT.rotateDegreesVec(90, new Vec2(0, 1)).x).toBeCloseTo(
            1,
        );
        expect(Vec2.RIGHT.rotateDegreesVec(90, new Vec2(0, 1)).y).toBeCloseTo(
            2,
        );
    });

    test('rotate radians', () => {
        expect(Vec2.RIGHT.rotateRadians(Math.PI / 2).x).toBeCloseTo(0);
        expect(Vec2.RIGHT.rotateRadians(Math.PI / 2).y).toBeCloseTo(1);
        expect(Vec2.RIGHT.rotateRadians(-Math.PI / 2).y).toBeCloseTo(-1);
        expect(Vec2.RIGHT.rotateRadians(Math.PI).x).toBeCloseTo(-1);

        expect(Vec2.RIGHT.rotateRadians(Math.PI / 2, 0, 0).x).toBeCloseTo(0);
        expect(Vec2.RIGHT.rotateRadians(Math.PI / 2, 0, 0).y).toBeCloseTo(1);

        expect(
            Vec2.RIGHT.rotateRadiansVec(Math.PI / 2, new Vec2(0, 0)).x,
        ).toBeCloseTo(0);
        expect(
            Vec2.RIGHT.rotateRadiansVec(Math.PI / 2, new Vec2(0, 0)).y,
        ).toBeCloseTo(1);

        expect(
            Vec2.RIGHT.rotateRadiansVec(Math.PI / 2, new Vec2(0, 1)).x,
        ).toBeCloseTo(1);
        expect(
            Vec2.RIGHT.rotateRadiansVec(Math.PI / 2, new Vec2(0, 1)).y,
        ).toBeCloseTo(2);
    });

    test('add', () => {
        expect(Vec2.ZERO.add(2)).toEqual({ x: 2, y: 2 });
        expect(Vec2.ZERO.add(2, 1)).toEqual({ x: 2, y: 1 });
        expect(Vec2.ZERO.addVec({ x: 3, y: 1 })).toEqual({ x: 3, y: 1 });

        const v = Vec2.ZERO;
        expect(v.add(1)).toBe(v);
    });

    test('sub', () => {
        expect(Vec2.ZERO.subtract(2)).toEqual({ x: -2, y: -2 });
        expect(Vec2.ZERO.subtract(2, 1)).toEqual({ x: -2, y: -1 });
        expect(Vec2.ZERO.subtractVec({ x: 3, y: 1 })).toEqual({
            x: -3,
            y: -1,
        });

        const v = Vec2.ZERO;
        expect(v.subtract(1)).toBe(v);
    });

    test('mul', () => {
        expect(new Vec2(2, 1).multiply(2)).toEqual({ x: 4, y: 2 });
        expect(new Vec2(2, 3).multiply(2, 1)).toEqual({ x: 4, y: 3 });
        expect(new Vec2(2, 1).multiplyVec({ x: 3, y: 2 })).toEqual({
            x: 6,
            y: 2,
        });

        const v = Vec2.ZERO;
        expect(v.multiply(1)).toBe(v);
    });

    test('div', () => {
        expect(new Vec2(4, 2).divide(2)).toEqual({ x: 2, y: 1 });
        expect(new Vec2(4, 2).divide(2, 1)).toEqual({ x: 2, y: 2 });
        expect(new Vec2(3, 2).divideVec({ x: 3, y: 1 })).toEqual({
            x: 1,
            y: 2,
        });

        const v = Vec2.ZERO;
        expect(v.divide(1)).toBe(v);
    });

    test('mat', () => {
        const scaleMat = Mat2D.fromScale(2);
        const rotationMat = Mat2D.fromRotation(90);
        const translationMat = Mat2D.fromTranslation(10, 10);

        expect(Vec2.RIGHT.multiplyMat(scaleMat)).toEqual({ x: 2, y: 0 });
        expect(Vec2.RIGHT.multiplyMat(rotationMat).degrees).toEqual(90);
        expect(Vec2.RIGHT.multiplyMat(translationMat)).toEqual({
            x: 11,
            y: 10,
        });

        expect(Vec2.RIGHT.multiplyInverse(scaleMat)).toEqual({
            x: 0.5,
            y: 0,
        });
        expect(Vec2.RIGHT.multiplyInverse(rotationMat).degrees).toEqual(270);
        expect(Vec2.RIGHT.multiplyInverse(translationMat)).toEqual({
            x: -9,
            y: -10,
        });

        const sr = Vec2.RIGHT.multiplyMat(scaleMat).multiplyMat(rotationMat);

        expect(sr.degrees).toEqual(90);
        expect(sr.x).toBeCloseTo(0);
        expect(sr.y).toBeCloseTo(2);

        const st = new Vec2(1, 0)
            .multiplyMat(scaleMat)
            .multiplyMat(translationMat);

        expect(st).toEqual({ x: 1 * 2 + 10, y: 0 * 2 + 10 });

        const tsr = Vec2.RIGHT.multiplyMat(translationMat)
            .multiplyMat(scaleMat)
            .multiplyMat(rotationMat);

        expect(tsr).toEqual({ x: -20, y: 22 });
    });
});
