import { describe, expect, test } from 'vitest';
import { Mat2D, Vec2 } from '../../src/math';

describe('mat2d', () => {
    test('init', () => {
        expect(new Mat2D(1, 2, 3, 4, 5, 6).makeIdentity()).toEqual(
            Mat2D.IDENTITY,
        );

        const m = Mat2D.IDENTITY;
        expect(m.clone()).not.toBe(m);

        expect(Mat2D.IDENTITY.copyFrom(new Mat2D(1, 2, 3, 4, 5, 6))).toEqual({
            a: 1,
            b: 2,
            c: 3,
            d: 4,
            tx: 5,
            ty: 6,
        });
    });

    test('scales', () => {
        expect(Mat2D.IDENTITY.scale(10, 10)).toEqual(
            new Mat2D(10, 0, 0, 10, 0, 0),
        );
        expect(Mat2D.IDENTITY.scaleVec(new Vec2(10, 10))).toEqual(
            new Mat2D(10, 0, 0, 10, 0, 0),
        );

        expect(Mat2D.fromScale(10, 10)).toEqual(new Mat2D(10, 0, 0, 10, 0, 0));
    });

    test('translates', () => {
        expect(Mat2D.IDENTITY.translate(10, 10)).toEqual(
            new Mat2D(1, 0, 0, 1, 10, 10),
        );
        expect(Mat2D.IDENTITY.translateVec(new Vec2(10, 10))).toEqual(
            new Mat2D(1, 0, 0, 1, 10, 10),
        );

        expect(Mat2D.fromTranslation(10, 10)).toEqual(
            new Mat2D(1, 0, 0, 1, 10, 10),
        );
    });

    test('mults', () => {
        expect(Mat2D.IDENTITY.multiplyMat(new Mat2D(1, 2, 3, 4, 5, 6))).toEqual(
            new Mat2D(1, 2, 3, 4, 5, 6),
        );

        expect(
            new Mat2D(1, 2, 3, 4, 5, 6).multiplyMat(
                new Mat2D(1, 2, 3, 4, 5, 6),
            ),
        ).toEqual(new Mat2D(7, 10, 15, 22, 28, 40));

        expect(
            new Mat2D(1, 2, 3, 4, 5, 6).multiplyMat(
                new Mat2D(-1, -2, -3, -4, -5, -6),
            ),
        ).toEqual(new Mat2D(-7, -10, -15, -22, -18, -28));

        expect(
            Mat2D.fromTranslation(10, 10).multiplyMat(
                Mat2D.fromTranslation(10, 10),
            ),
        ).toEqual(Mat2D.fromTranslation(20, 20));

        expect(
            Mat2D.fromRotation(90).multiplyMat(Mat2D.fromRotation(90)),
        ).toEqual(Mat2D.fromRotation(180));

        expect(Mat2D.fromScale(3).multiplyMat(Mat2D.fromScale(3))).toEqual(
            Mat2D.fromScale(9),
        );

        expect(
            Mat2D.fromScale(3).multiplyMat(Mat2D.fromTranslation(3, 3)),
        ).toEqual(new Mat2D(3, 0, 0, 3, 9, 9));
    });
});
