import { describe, expect, test } from 'vitest';
import { Mat2D, Transform2D, Vec2 } from '../../src/math';

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

        const m = Mat2D.IDENTITY;
        t.compose(m);

        const tt = new Transform2D();
        tt.decompose(m);

        expect(tt.position).toEqual(new Vec2(16, 8));
        expect(tt.degrees).toEqual(111);
        expect(tt.scale).toEqual(new Vec2(3, 6));
    });

    test('fromMatrix', () => {
        const t = new Transform2D();
        const m = Mat2D.IDENTITY;

        m.scale(1, 2).translate(3, 4);

        t.decompose(m);

        expect(t.scale.x).toEqual(1);
        expect(t.scale.y).toEqual(2);
        expect(t.position.x).toEqual(3);
        expect(t.position.y).toEqual(4);
    });
});
