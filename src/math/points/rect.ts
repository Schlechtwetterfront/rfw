import { Vec2 } from '..';
import { RectLike } from '../shapes';
import { EnsurePointsOptions, ensurePoints } from './util';

/**
 * Build rect points.
 * @param rect - Rect
 * @param closed - Generate an additional point closing the rect (equal to first point)
 * @returns Rect points
 *
 * @category Math - Paths
 */
export function buildPointsFromRect(rect: RectLike, closed = false): Vec2[] {
    const points: Vec2[] = [];

    setPointsFromRect(rect, closed, points);

    return points;
}

/**
 * Build rect points. Reuse points in `results` if already present.
 * @param rect - Rect
 * @param closed - Generate an additional point closing the rect (equal to first point)
 * @param results - Array of points to reuse
 * @param options - Options describing how to reuse `results`
 * @returns Number of points added/changed
 *
 * @category Math - Paths
 */
export function setPointsFromRect(
    rect: RectLike,
    closed: boolean,
    results: Vec2[],
    options?: EnsurePointsOptions,
): number {
    const { x, y, width, height } = rect;

    return setRectPoints(x, y, width, height, closed, results, options);
}

/**
 * Build rect points.
 * @param x - Left
 * @param y - Bottom
 * @param width - Width
 * @param height - Height
 * @param closed - Generate an additional point closing the rect (equal to first point)
 * @returns Rect points
 *
 * @category Math - Paths
 */
export function buildRectPoints(
    x: number,
    y: number,
    width: number,
    height: number,
    closed = false,
): Vec2[] {
    const points: Vec2[] = [];

    setRectPoints(x, y, width, height, closed, points);

    return points;
}

/**
 * Build rect points. Reuse points in `results` if already present.
 * @param x - Left
 * @param y - Bottom
 * @param width - Width
 * @param height - Height
 * @param closed - Generate an additional point closing the rect (equal to first point)
 * @param results - Array of points to reuse
 * @param options - Options describing how to reuse `results`
 * @returns Number of points added/changed
 *
 * @category Math - Paths
 */
export function setRectPoints(
    x: number,
    y: number,
    width: number,
    height: number,
    closed: boolean,
    results: Vec2[],
    options?: EnsurePointsOptions,
): number {
    const count = closed ? 5 : 4;

    const sliceStart = options?.sliceStart ?? 0;

    ensurePoints(results, count, options);

    results[sliceStart]!.set(x, y);
    results[sliceStart + 1]!.set(x + width, y);
    results[sliceStart + 2]!.set(x + width, y + height);
    results[sliceStart + 3]!.set(x, y + height);

    if (closed) {
        results[sliceStart + 4]!.set(x, y);
    }

    return count;
}

/**
 * Build square points.
 * @param x - Left
 * @param y - Bottom
 * @param length - Width/height
 * @returns Square points
 *
 * @category Math - Paths
 */
export function buildSquarePoints(
    x: number,
    y: number,
    length: number,
): Vec2[] {
    const points: Vec2[] = [];

    setSquarePoints(x, y, length, points);

    return points;
}

/**
 * Build square points. Reuse points in `results` if already present.
 * @param x - Left
 * @param y - Bottom
 * @param length - Width/height
 * @param results - Array of points to reuse
 * @param options - Options describing how to reuse `results`
 * @returns Number of points added/changed
 *
 * @category Math - Paths
 */
export function setSquarePoints(
    x: number,
    y: number,
    length: number,
    results: Vec2[],
    options?: EnsurePointsOptions,
): number {
    return setRectPoints(x, y, length, length, closed, results, options);
}
