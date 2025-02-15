import { ArcIntervalKind } from '.';
import { PI_2, Vec2 } from '..';
import { CircleLike } from '../shapes';
import { EnsurePointsOptions, ensurePoints } from './util';

/**
 * Build circle points.
 * @param circle - Circle
 * @param interval - Interval between points, see `intervalKind`
 * @param intervalKind - Unit of `interval` (`distance` = a point every `interval` distance, `segments` = arc will be split into `interval` segments)
 * @param closed - Generate an additional point closing the circle (equal to first point)
 * @returns Circle points
 *
 * @category Math - Paths
 */
export function buildPointsFromCircle(
    circle: CircleLike,
    interval: number,
    intervalKind: ArcIntervalKind = 'distance',
    closed = false,
): Vec2[] {
    const points: Vec2[] = [];

    setPointsFromCircle(circle, interval, intervalKind, closed, points);

    return points;
}

/**
 * Build points for the described circle. Reuse points in `results` if already present.
 * @param circle - Circle
 * @param interval - Interval between points, see `intervalKind`
 * @param intervalKind - Unit of `interval` (`distance` = a point every `interval` distance, `segments` = arc will be split into `interval` segments)
 * @param closed - Generate an additional point closing the circle (equal to first point)
 * @param results - Array of points to reuse
 * @param options - Options describing how to reuse `results`
 * @returns Number of points added/changed
 *
 * @category Math - Paths
 */
export function setPointsFromCircle(
    circle: CircleLike,
    interval: number,
    intervalKind: ArcIntervalKind,
    closed: boolean,
    results: Vec2[],
    options?: EnsurePointsOptions,
): number {
    const { x, y, radius } = circle;

    return setCirclePoints(
        x,
        y,
        radius,
        interval,
        intervalKind,
        closed,
        results,
        options,
    );
}

/**
 * Build circle points.
 * @param cx - Center
 * @param cy - Center
 * @param r - Radius
 * @param interval - Interval between points, see `intervalKind`
 * @param intervalKind - Unit of `interval` (`distance` = a point every `interval` distance, `segments` = arc will be split into `interval` segments)
 * @param closed - Generate an additional point closing the circle (equal to first point)
 * @returns Circle points
 *
 * @category Math - Paths
 */
export function buildCirclePoints(
    cx: number,
    cy: number,
    r: number,
    interval: number,
    intervalKind: ArcIntervalKind = 'distance',
    closed = false,
): Vec2[] {
    const points: Vec2[] = [];

    setCirclePoints(cx, cy, r, interval, intervalKind, closed, points);

    return points;
}

/**
 * Build points for the described circle. Reuse points in `results` if already present.
 * @param cx - Center
 * @param cy - Center
 * @param r - Radius
 * @param interval - Interval between points, see `intervalKind`
 * @param intervalKind - Unit of `interval` (`distance` = a point every `interval` distance, `segments` = arc will be split into `interval` segments)
 * @param closed - Generate an additional point closing the circle (equal to first point)
 * @param results - Array of points to reuse
 * @param options - Options describing how to reuse `results`
 * @returns Number of points added/changed
 *
 * @category Math - Paths
 */
export function setCirclePoints(
    cx: number,
    cy: number,
    r: number,
    interval: number,
    intervalKind: ArcIntervalKind,
    closed: boolean,
    results: Vec2[],
    options?: EnsurePointsOptions,
): number {
    const segmentPointCount =
        intervalKind === 'segments'
            ? interval
            : Math.max(Math.ceil((PI_2 * r) / interval), 3);

    const sliceStart = options?.sliceStart ?? 0;

    // The close point is same as first point, does not create another segment.
    const pointCount = closed ? segmentPointCount + 1 : segmentPointCount;

    ensurePoints(results, pointCount, options);

    const sectionAngle = PI_2 / segmentPointCount;

    for (let i = 0; i < segmentPointCount; i++) {
        const angle = sectionAngle * i;

        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);

        results[sliceStart + i]!.set(x, y);
    }

    if (closed) {
        results[sliceStart + segmentPointCount]!.set(
            cx + r * Math.cos(0),
            cy + r * Math.sin(0),
        );
    }

    return segmentPointCount;
}
