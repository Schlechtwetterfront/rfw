import { describe, expect, test } from 'vitest';
import { LocalTransform2D, Mat2D, Transform2D, Vec2 } from '../../src/math';

describe('transform2d', () => {
    test('rotation conversions', () => {
        const t = new Transform2D();

        t.radians = Math.PI;

        expect(t.degrees).toEqual(180);

        t.degrees = 90;

        expect(t.radians).toEqual(Math.PI / 2);
    });

    test('to matrix', () => {
        const t = new Transform2D();

        t.position.x = 16;
        t.position.y = 8;

        t.degrees = 111;

        t.scale.x = 3;
        t.scale.y = 6;

        const m = Mat2D.identity();
        t.compose(m);

        const tt = new Transform2D();
        tt.decompose(m);

        expect(tt.position).toEqual(new Vec2(16, 8));
        expect(tt.degrees).toEqual(111);
        expect(tt.scale).toEqual(new Vec2(3, 6));
    });

    test('fromMatrix', () => {
        const t = new Transform2D();
        const m = Mat2D.identity();

        m.scale(1, 2).translate(3, 4);

        t.decompose(m);

        expect(t.scale.x).toEqual(1);
        expect(t.scale.y).toEqual(2);
        expect(t.position.x).toEqual(3);
        expect(t.position.y).toEqual(4);
    });

    test('composes child transforms correctly', () => {
        const p = new Vec2(10, 0);

        const parent = new LocalTransform2D();
        const child = new LocalTransform2D();

        parent.degrees = 90;

        child.position.x = 10;

        parent.composeWorld();
        child.composeWorld(parent);

        const pp = p.clone().multiplyMat(child.worldMatrix);

        expect(pp.x).toBeCloseTo(0);
        expect(pp.y).toBeCloseTo(20);
    });
});
