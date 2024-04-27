import { assert, expect, test } from 'vitest';

import { Color, parseHexColor } from '../src/colors';

const WHITE_TUPLE = [255, 255, 255, 255];

test('color hex formats', () => {
    assert.throw(() => parseHexColor('f', false));
    assert.throw(() => parseHexColor('ff', false));
    assert.throw(() => parseHexColor('fffff', false));
    assert.throw(() => parseHexColor('fffffff', false));
    assert.throw(() => parseHexColor('fffffffff', false));

    expect(parseHexColor('fff', false)).toEqual(WHITE_TUPLE);
    expect(parseHexColor('#fff', false)).toEqual(WHITE_TUPLE);
    expect(parseHexColor('ffff', false)).toEqual(WHITE_TUPLE);
    expect(parseHexColor('#ffff', false)).toEqual(WHITE_TUPLE);
    expect(parseHexColor('ffffff', false)).toEqual(WHITE_TUPLE);
    expect(parseHexColor('#ffffff', false)).toEqual(WHITE_TUPLE);
    expect(parseHexColor('ffffffff', false)).toEqual(WHITE_TUPLE);
    expect(parseHexColor('#ffffffff', false)).toEqual(WHITE_TUPLE);
});

test('color hex number parsing', () => {
    expect(parseHexColor('fff', false)).toEqual(WHITE_TUPLE);
    expect(parseHexColor('fff', true)).toEqual([1, 1, 1, 1]);
    expect(parseHexColor('000', true)).toEqual([0, 0, 0, 1]);
    expect(parseHexColor('0000', true)).toEqual([0, 0, 0, 0]);

    const red = [1, 0, 0, 1];
    expect(parseHexColor('f00', true)).toEqual(red);
    expect(parseHexColor('f00f', true)).toEqual(red);
    expect(parseHexColor('ff0000', true)).toEqual(red);
    expect(parseHexColor('ff0000ff', true)).toEqual(red);

    const green = [0, 1, 0, 1];
    expect(parseHexColor('0f0', true)).toEqual(green);
    expect(parseHexColor('0f0f', true)).toEqual(green);
    expect(parseHexColor('00ff00', true)).toEqual(green);
    expect(parseHexColor('00ff00ff', true)).toEqual(green);

    const blue = [0, 0, 1, 1];
    expect(parseHexColor('00f', true)).toEqual(blue);
    expect(parseHexColor('00ff', true)).toEqual(blue);
    expect(parseHexColor('0000ff', true)).toEqual(blue);
    expect(parseHexColor('0000ffff', true)).toEqual(blue);
});

test('color from', () => {
    expect(Color.fromHexString('f00')).toEqual(new Color(1, 0, 0, 1));
    expect(Color.fromHexString('0f0')).toEqual(new Color(0, 1, 0, 1));
    expect(Color.fromHexString('00f')).toEqual(new Color(0, 0, 1, 1));
    expect(Color.fromHexString('0000')).toEqual(new Color(0, 0, 0, 0));

    expect(Color.from({ r: 1, g: 0.5, b: 0, a: 1 })).toEqual(
        new Color(1, 0.5, 0, 1),
    );
});

test('color', () => {
    expect(Color.white().equalsWithAlpha(1, 1, 1, 1)).toEqual(true);
    expect(Color.white().equalsWithAlpha(1.5, 1, 1, 1, 0.6)).toEqual(true);
    expect(Color.white().equalsColor(new Color(1, 1, 1, 1))).toEqual(true);
    expect(Color.white().equalsColor({ r: 1, g: 1, b: 1, a: 1 })).toEqual(true);
    expect(
        Color.white().equalsColorWithAlpha({ r: 1.5, g: 1, b: 1, a: 1 }, 0.6),
    ).toEqual(true);

    const c = Color.white();
    expect(c.clone()).not.toBe(c);
    expect(
        Color.white().copyFrom(Color.black()).equalsColor(Color.black()),
    ).toEqual(true);
});

test('color toCssString', () => {
    expect(Color.transparent().toCSSString()).toEqual('#00000000');
    expect(Color.black().toCSSString()).toEqual('#000000ff');
    expect(Color.white().toCSSString()).toEqual('#ffffffff');
});

test('color RGB to HSL', () => {
    expect(Color.red().toHSL()).toEqual({ h: 0, s: 1, l: 0.5 });
    expect(Color.white().toHSL()).toEqual({ h: 0, s: 0, l: 1 });
    expect(Color.black().toHSL()).toEqual({ h: 0, s: 0, l: 0 });
    expect(new Color(0.5, 0.5, 0.5).toHSL()).toEqual({
        h: 0,
        s: 0,
        l: 0.5,
    });

    const o = { h: 0, s: 0, l: 0 };
    Color.red().toHSL(o);
    expect(o).toEqual({ h: 0, s: 1, l: 0.5 });

    const oa = { h: 0, s: 0, l: 0, a: 0 };
    new Color(1, 1, 1, 0.5).toHSLA(oa);
    expect(oa.a).toBeCloseTo(0.5);
});

test('color HSL to RGB', () => {
    const c = Color.white().setHSL(50, 1, 0.5);
    expect(c.r).toBeCloseTo(1);
    expect(c.g).toBeCloseTo(0.83);
    expect(c.b).toBeCloseTo(0);

    c.setHSL(0, 1, 1);
    expect(c.r).toBeCloseTo(1);
    expect(c.g).toBeCloseTo(1);
    expect(c.b).toBeCloseTo(1);

    c.setHSL(0, 0, 0);
    expect(c.r).toBeCloseTo(0);
    expect(c.g).toBeCloseTo(0);
    expect(c.b).toBeCloseTo(0);

    c.setHSL(0, 1, 0.5, 0.5);
    expect(c.r).toBeCloseTo(1);
    expect(c.g).toBeCloseTo(0);
    expect(c.b).toBeCloseTo(0);
    expect(c.a).toBeCloseTo(0.5);

    const cf = Color.fromHSL(0, 1, 0.5, 0.5);
    expect(cf.r).toBeCloseTo(1);
    expect(cf.g).toBeCloseTo(0);
    expect(cf.b).toBeCloseTo(0);
    expect(cf.a).toBeCloseTo(0.5);
});

test('color RGB to HSV', () => {
    expect(Color.red().toHSV()).toEqual({ h: 0, s: 1, v: 1 });
    expect(Color.white().toHSV()).toEqual({ h: 0, s: 0, v: 1 });
    expect(Color.black().toHSV()).toEqual({ h: 0, s: 0, v: 0 });
    expect(new Color(0.5, 0.5, 0.5).toHSV()).toEqual({
        h: 0,
        s: 0,
        v: 0.5,
    });

    const o = { h: 0, s: 0, v: 0 };
    Color.red().toHSV(o);
    expect(o).toEqual({ h: 0, s: 1, v: 1 });

    const oa = { h: 0, s: 0, v: 0, a: 0 };
    new Color(1, 1, 1, 0.5).toHSVA(oa);
    expect(oa.a).toBeCloseTo(0.5);
});

test('color HSV to RGB', () => {
    const c = Color.white().setHSV(50, 1, 0.5);
    expect(c.r).toBeCloseTo(0.5);
    expect(c.g).toBeCloseTo(0.415);
    expect(c.b).toBeCloseTo(0);

    c.setHSV(0, 1, 1);
    expect(c.r).toBeCloseTo(1);
    expect(c.g).toBeCloseTo(0);
    expect(c.b).toBeCloseTo(0);

    c.setHSV(0, 0, 0);
    expect(c.r).toBeCloseTo(0);
    expect(c.g).toBeCloseTo(0);
    expect(c.b).toBeCloseTo(0);

    c.setHSV(0, 1, 0.5, 0.5);
    expect(c.r).toBeCloseTo(0.5);
    expect(c.g).toBeCloseTo(0);
    expect(c.b).toBeCloseTo(0);
    expect(c.a).toBeCloseTo(0.5);

    const cf = Color.fromHSV(0, 1, 0.5, 0.5);
    expect(cf.r).toBeCloseTo(0.5);
    expect(cf.g).toBeCloseTo(0);
    expect(cf.b).toBeCloseTo(0);
    expect(cf.a).toBeCloseTo(0.5);
});
