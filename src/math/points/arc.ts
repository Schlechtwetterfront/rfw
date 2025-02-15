import { ArcIntervalKind, ensurePoints, EnsurePointsOptions } from '.';
import { vec, Vec2 } from '../vec2';

/**
 * Build a point along the described circle.
 * @param cx - Circle center
 * @param cy - Circle center
 * @param radius - Circle radius
 * @param radians - Point angle
 * @returns Point on circle
 *
 * @category Math - Paths
 */
export function buildArcPoint(
    cx: number,
    cy: number,
    radius: number,
    radians: number,
): Vec2 {
    return vec(
        cx + radius * Math.cos(radians),
        cy + radius * Math.sin(radians),
    );
}

/**
 * Build points for the described arc.
 * @param cx - Arc center
 * @param cy - Arc center
 * @param radius - Arc radius
 * @param startRadians - Start point angle
 * @param endRadians - End point angle
 * @param clockwise - If points between `startRadians` and `endRadians` should be built clockwise or counter-clockwise
 * @param interval - Interval between points, see `intervalKind`
 * @param intervalKind - Unit of `interval` (`distance` = a point every `interval` distance, `segments` = arc will be split into `interval` segments)
 * @returns Arc points
 *
 * @category Math - Paths
 */
export function buildArcPoints(
    cx: number,
    cy: number,
    radius: number,
    startRadians: number,
    endRadians: number,
    clockwise: boolean | undefined,
    interval: number,
    intervalKind: ArcIntervalKind = 'distance',
): Vec2[] {
    const points: Vec2[] = [];

    setArcPoints(
        cx,
        cy,
        radius,
        startRadians,
        endRadians,
        clockwise,
        interval,
        intervalKind,
        points,
    );

    return points;
}

/**
 * Build points for the described arc. Reuse points in `results` if already present.
 * @param cx - Arc center
 * @param cy - Arc center
 * @param radius - Arc radius
 * @param startRadians - Start point angle
 * @param endRadians - End point angle
 * @param clockwise - If points between `startRadians` and `endRadians` should be built clockwise or counter-clockwise
 * @param interval - Interval between points, see `intervalKind`
 * @param intervalKind - Unit of `interval` (`distance` = a point every `interval` distance, `segments` = arc will be split into `interval` segments)
 * @param results - Array of points to reuse
 * @param skipFirst - Skip first point of arc (mostly useful when using arc to)
 * @param options - Options describing how to reuse `results`
 * @returns Number of points added/changed
 *
 * @category Math - Paths
 */
export function setArcPoints(
    cx: number,
    cy: number,
    radius: number,
    startRadians: number,
    endRadians: number,
    clockwise: boolean | undefined,
    interval: number,
    intervalKind: ArcIntervalKind,
    results: Vec2[],
    skipFirst = false,
    options?: EnsurePointsOptions,
): number {
    let arc = endRadians - startRadians;

    if (
        (clockwise === false && startRadians > endRadians) ||
        (clockwise === true && endRadians > startRadians)
    ) {
        arc *= -1;
    }

    const arcLength = Math.abs(radius * arc);

    let pointCount: number;

    if (intervalKind === 'segments') {
        pointCount = interval + 1;
    } else {
        pointCount = Math.ceil(arcLength / interval);
    }

    if (pointCount < 2) {
        pointCount = 2;
    }

    const radiansStep = arc / (pointCount - 1);

    // Radians per step must remain the same, so subtract here
    if (skipFirst) {
        pointCount--;
    }

    ensurePoints(results, pointCount, options);

    const additionalRadiansStart = skipFirst ? radiansStep : 0;
    const sliceStart = options?.sliceStart ?? 0;

    for (let i = 0; i < pointCount; i++) {
        const angle = startRadians + additionalRadiansStart + i * radiansStep;

        results[sliceStart + i]?.set(
            cx + radius * Math.cos(angle),
            cy + radius * Math.sin(angle),
        );
    }

    return pointCount;
}

/**
 * Build points for the described arc.
 * @param x - Start point
 * @param y - Start point
 * @param c1x - Control point
 * @param c1y - Control point
 * @param toX - End point
 * @param toY - End point
 * @param radius - Arc radius
 * @param interval - Interval between points, see `intervalKind`
 * @param intervalKind - Unit of `interval` (`distance` = a point every `interval` distance, `segments` = arc will be split into `interval` segments)
 * @returns Arc points
 *
 * @category Math - Paths
 */
export function buildArcToPoints(
    x: number,
    y: number,
    c1x: number,
    c1y: number,
    toX: number,
    toY: number,
    radius: number,
    interval: number,
    intervalKind: ArcIntervalKind = 'distance',
): Vec2[] {
    const points: Vec2[] = [];

    setArcToPoints(
        x,
        y,
        c1x,
        c1y,
        toX,
        toY,
        radius,
        interval,
        intervalKind,
        points,
    );

    return points;
}

/**
 * Build points for the described arc. Reuse points in `results` if already present.
 * @param x - Start point
 * @param y - Start point
 * @param c1x - Control point
 * @param c1y - Control point
 * @param toX - End point
 * @param toY - End point
 * @param radius - Arc radius
 * @param interval - Interval between points, see `intervalKind`
 * @param intervalKind - Unit of `interval` (`distance` = a point every `interval` distance, `segments` = arc will be split into `interval` segments)
 * @param results - Array of points to reuse
 * @param options - Options describing how to reuse `results`
 * @returns Number of points added/changed
 *
 * @category Math - Paths
 */
// From https://code.google.com/p/fxcanvas/
export function setArcToPoints(
    x: number,
    y: number,
    c1x: number,
    c1y: number,
    toX: number,
    toY: number,
    radius: number,
    interval: number,
    intervalKind: ArcIntervalKind,
    results: Vec2[],
    options?: EnsurePointsOptions,
): number {
    const fromX = x;
    const fromY = y;

    const a1 = fromY - c1y;
    const b1 = fromX - c1x;
    const a2 = toY - c1y;
    const b2 = toX - c1x;
    const mm = Math.abs(a1 * b2 - b1 * a2);

    // TODO: Integrate
    // if (mm < 1.0e-8 || radius === 0)
    // {
    //     if (points[points.length - 2] !== x1 || points[points.length - 1] !== y1)
    //     {
    //         points.push(x1, y1);
    //     }

    //     return;
    // }

    const dd = a1 * a1 + b1 * b1;
    const cc = a2 * a2 + b2 * b2;
    const tt = a1 * a2 + b1 * b2;
    const k1 = (radius * Math.sqrt(dd)) / mm;
    const k2 = (radius * Math.sqrt(cc)) / mm;
    const j1 = (k1 * tt) / dd;
    const j2 = (k2 * tt) / cc;
    const cx = k1 * b2 + k2 * b1;
    const cy = k1 * a2 + k2 * a1;
    const px = b1 * (k2 + j1);
    const py = a1 * (k2 + j1);
    const qx = b2 * (k1 + j2);
    const qy = a2 * (k1 + j2);
    const startAngle = Math.atan2(py - cy, px - cx);
    const endAngle = Math.atan2(qy - cy, qx - cx);

    return setArcPoints(
        cx + c1x,
        cy + c1y,
        radius,
        startAngle,
        endAngle,
        undefined,
        interval,
        intervalKind,
        results,
        // Skip first point because would overlap with last point of path up to here.
        true,
        options,
    );
}
