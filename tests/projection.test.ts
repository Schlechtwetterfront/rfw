import { describe, expect, test } from 'vitest';
import { Camera2D, DefaultProjections, Vec2 } from '../src';
import { DefaultRenderContext } from '../src/rendering/render-context';

const dims = new Vec2(8, 8);
const context = new DefaultRenderContext(dims);
const centeredProjections = new DefaultProjections(context, {
    centered: true,
    x: 'right',
    y: 'up',
});
const projections = new DefaultProjections(context, {
    centered: false,
    x: 'right',
    y: 'up',
});

describe('projection to scene', () => {
    test('centered', () => {
        const cam = new Camera2D();
        const p = new Vec2(4, 4);

        centeredProjections.projectPointToScene(p, cam);

        expect(p).toEqual({ x: 0, y: 0 });

        p.set(2, 2);

        centeredProjections.projectPointToScene(p, cam);

        expect(p).toEqual({ x: -2, y: 2 });
    });

    test('centered & moved', () => {
        const cam = new Camera2D();
        cam.pan(4, 4);

        const p = new Vec2(2, 2);

        centeredProjections.projectPointToScene(p, cam);

        expect(p).toEqual({ x: 2, y: 6 });

        p.set(6, 6);

        centeredProjections.projectPointToScene(p, cam);

        expect(p).toEqual({ x: 6, y: 2 });
    });

    test('not centered', () => {
        const cam = new Camera2D();
        const p = new Vec2(4, 4);

        projections.projectPointToScene(p, cam);

        expect(p).toEqual({ x: 4, y: 4 });

        p.set(2, 2);

        projections.projectPointToScene(p, cam);

        expect(p).toEqual({ x: 2, y: 6 });
    });

    test('not centered & moved', () => {
        const cam = new Camera2D();
        cam.pan(4, 4);

        const p = new Vec2(4, 4);

        projections.projectPointToScene(p, cam);

        expect(p).toEqual({ x: 8, y: 8 });

        p.set(0, 0);

        projections.projectPointToScene(p, cam);

        expect(p).toEqual({ x: 4, y: 12 });
    });
});

describe('projection to viewport', () => {
    test('centered', () => {
        const cam = new Camera2D();
        const p = new Vec2(4, 4);

        centeredProjections.projectPointToViewport(p, cam);

        expect(p).toEqual({ x: 8, y: 0 });

        p.set(2, 2);

        centeredProjections.projectPointToViewport(p, cam);

        expect(p).toEqual({ x: 6, y: 2 });
    });

    test('centered & moved', () => {
        const cam = new Camera2D();
        cam.pan(4, 4);

        const p = new Vec2(2, 2);

        centeredProjections.projectPointToViewport(p, cam);

        expect(p).toEqual({ x: 2, y: 6 });

        p.set(6, 6);

        centeredProjections.projectPointToViewport(p, cam);

        expect(p).toEqual({ x: 6, y: 2 });
    });

    test('not centered', () => {
        const cam = new Camera2D();
        const p = new Vec2(4, 4);

        projections.projectPointToViewport(p, cam);

        expect(p).toEqual({ x: 4, y: 4 });

        p.set(2, 2);

        projections.projectPointToViewport(p, cam);

        expect(p).toEqual({ x: 2, y: 6 });
    });

    test('not centered & moved', () => {
        const cam = new Camera2D();
        cam.pan(4, 4);

        const p = new Vec2(4, 4);

        projections.projectPointToViewport(p, cam);

        expect(p).toEqual({ x: 0, y: 8 });

        p.set(0, 0);

        projections.projectPointToViewport(p, cam);

        expect(p).toEqual({ x: -4, y: 12 });
    });
});
