import { describe, expect, test } from 'vitest';
import {
    Camera2D,
    Vec2,
    projectPointToScene,
    projectPointToViewport,
} from '../src';

describe('projection to scene', () => {
    const dims = new Vec2(10, 10);

    test('centered', () => {
        const centerCam = new Camera2D({ centered: true });
        const p = new Vec2(5, 5);

        projectPointToScene(p, dims, centerCam);

        expect(p).toEqual({ x: 0, y: 0 });

        p.set(0, 0);

        projectPointToScene(p, dims, centerCam);

        expect(p).toEqual({ x: -5, y: -5 });
    });

    test('centered & moved', () => {
        const centerCam = new Camera2D({ centered: true });
        centerCam.pan(5, 5);

        const p = new Vec2(5, 5);

        projectPointToScene(p, dims, centerCam);

        expect(p).toEqual({ x: 5, y: 5 });

        p.set(0, 0);

        projectPointToScene(p, dims, centerCam);

        expect(p).toEqual({ x: 0, y: 0 });
    });

    test('topleft', () => {
        const topLeftCam = new Camera2D({ centered: false });
        const p = new Vec2(5, 5);

        projectPointToScene(p, dims, topLeftCam);

        expect(p).toEqual({ x: 5, y: 5 });

        p.set(0, 0);

        projectPointToScene(p, dims, topLeftCam);

        expect(p).toEqual({ x: 0, y: 0 });
    });

    test('topleft & moved', () => {
        const topLeftCam = new Camera2D({ centered: false });
        topLeftCam.pan(5, 5);

        const p = new Vec2(5, 5);

        projectPointToScene(p, dims, topLeftCam);

        expect(p).toEqual({ x: 10, y: 10 });

        p.set(0, 0);

        projectPointToScene(p, dims, topLeftCam);

        expect(p).toEqual({ x: 5, y: 5 });
    });
});

describe('projection to viewport', () => {
    const dims = new Vec2(10, 10);

    test('centered', () => {
        const centerCam = new Camera2D({ centered: true });
        const p = new Vec2(5, 5);

        projectPointToViewport(p, dims, centerCam);

        expect(p).toEqual({ x: 10, y: 10 });

        p.set(0, 0);

        projectPointToViewport(p, dims, centerCam);

        expect(p).toEqual({ x: 5, y: 5 });
    });

    test('centered & moved', () => {
        const centerCam = new Camera2D({ centered: true });
        centerCam.pan(5, 5);

        const p = new Vec2(5, 5);

        projectPointToViewport(p, dims, centerCam);

        expect(p).toEqual({ x: 5, y: 5 });

        p.set(0, 0);

        projectPointToViewport(p, dims, centerCam);

        expect(p).toEqual({ x: 0, y: 0 });
    });

    test('topleft', () => {
        const topLeftCam = new Camera2D({ centered: false });
        const p = new Vec2(5, 5);

        projectPointToViewport(p, dims, topLeftCam);

        expect(p).toEqual({ x: 5, y: 5 });

        p.set(0, 0);

        projectPointToViewport(p, dims, topLeftCam);

        expect(p).toEqual({ x: 0, y: 0 });
    });

    test('topleft & moved', () => {
        const topLeftCam = new Camera2D({ centered: false });
        topLeftCam.pan(5, 5);

        const p = new Vec2(5, 5);

        projectPointToViewport(p, dims, topLeftCam);

        expect(p).toEqual({ x: 0, y: 0 });

        p.set(0, 0);

        projectPointToViewport(p, dims, topLeftCam);

        expect(p).toEqual({ x: -5, y: -5 });
    });
});
