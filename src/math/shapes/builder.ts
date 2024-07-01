import { PI_2 } from '../constants';
import { Vec2 } from '../vec2';
import { CircleLike } from './circle';
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

export function buildPointsFromCircle(
    circle: CircleLike,
    sections: number,
    closed = false,
    results?: Vec2[],
): Vec2[] {
    const { x, y, radius } = circle;

    return buildCirclePoints(x, y, radius, sections, closed, results);
}

export function buildCirclePoints(
    cx: number,
    cy: number,
    r: number,
    sections: number,
    closed = false,
    results?: Vec2[],
): Vec2[] {
    results ??= [];

    const sectionAngle = PI_2 / sections;

    for (let i = 0; i < sections; i++) {
        const angle = sectionAngle * i;

        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);

        results.push(new Vec2(x, y));
    }

    if (closed) {
        results.push(new Vec2(cx + r * Math.cos(0), cy + r * Math.sin(0)));
    }

    return results;
}
