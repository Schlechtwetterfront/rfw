import { Vec2 } from '../vec2';
import { RectLike } from './rect';

export function buildPointsFromRect(
    rect: RectLike,
    closed = false,
    results?: Vec2[],
): Vec2[] {
    results ??= [];

    const { x, y, width, height } = rect;

    return buildRectPoints(x, y, width, height, closed, results);
}

export function buildRectPoints(
    x: number,
    y: number,
    width: number,
    height: number,
    closed = false,
    results?: Vec2[],
): Vec2[] {
    results ??= [];

    results.push(
        new Vec2(x, y),
        new Vec2(x + width, y),
        new Vec2(x + width, y + height),
        new Vec2(x, y + height),
    );

    if (closed) {
        results.push(new Vec2(x, y));
    }

    return results;
}

export function buildSquarePoints(
    x: number,
    y: number,
    length: number,
    closed = false,
    results?: Vec2[],
): Vec2[] {
    results ??= [];

    return buildRectPoints(x, y, length, length, closed, results);
}
