import { Pool } from '../../util';
import { vec, Vec2 } from '../vec2';

/** @category Math - Paths */
export interface EnsurePointsOptions {
    /** If given, will only ignore part of array before start */
    sliceStart?: number;
    /** Optional pool to take additional points from/return unneeded points to */
    vecPool?: Pool<Vec2>;
    /** If the array should be truncated if there are more points than needed */
    truncate?: boolean;
}

/**
 * Ensures exactly `count` elements in `points`. Will allocate if less, truncate if more.
 * @param points - Point array
 * @param count - Count of elements
 * @param options - Options
 *
 * @category Math - Paths
 */
export function ensurePoints(
    points: Vec2[],
    count: number,
    options?: EnsurePointsOptions,
): void {
    const sliceStart = options?.sliceStart ?? 0;
    const vecPool = options?.vecPool;
    const truncate = options?.truncate !== false;

    const totalCount = count + sliceStart;

    if (points.length === totalCount) {
        return;
    }

    const diff = points.length - totalCount;

    if (diff > 0 && truncate) {
        const del = Math.abs(diff);

        for (let i = 1; i <= del; i++) {
            const p = points[points.length - i]!;

            vecPool?.return(p);
        }

        points.length -= del;
    } else if (diff < 0) {
        const add = Math.abs(diff);

        for (let i = 0; i < add; i++) {
            points[sliceStart + i] = vecPool?.take() ?? vec();
        }
    }
}
