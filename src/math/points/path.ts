import {
    ArcIntervalKind,
    ensurePoints,
    EnsurePointsOptions,
    setArcPoints,
    setArcToPoints,
} from '.';
import { TO_RADIANS, Vec2 } from '..';
import { Pool } from '../../util';

/** @category Math - Paths */
export type AddedPointCount = number;

/** @category Math - Paths */
export interface ArcOptions {
    /** Interval between points, see `intervalKind` */
    interval?: number;
    /** Unit of `interval` (`distance` = a point every `interval` distance, `segments` = arc will be split into `interval` segments) */
    intervalKind?: ArcIntervalKind;
}

/** @category Math - Paths */
export interface ArcAtOptions extends ArcOptions {
    /** If points between the start point angle and end point angle should be built clockwise or counter-clockwise */
    clockwise?: boolean;
}

/** @category Math - Paths */
export interface LinePathOptions extends ArcOptions {
    /** Point pool to use when adding/removing points from the path */
    vecPool?: Pool<Vec2>;
}

/** @category Math - Paths */
export type LinePathlet = (
    points: Vec2[],
    sliceStart: number,
    options?: LinePathOptions,
) => AddedPointCount;

/** @category Math - Paths */
export interface LinePathBuilder {
    /**
     * Line the path definition by building points for all path sections.
     * @param options - Build options
     * @returns Path points
     */
    build(options?: LinePathOptions): Vec2[];

    /**
     * Line the path definition by building points for all path sections.
     * @param points - Array of points to reuse
     * @param options - Build options
     * @returns Path points
     */
    build(points: Vec2[], options?: LinePathOptions): Vec2[];
}

/**
 * Build a definition for a line path.
 * @param pathlets - Path section builders
 * @returns Path definition
 *
 * @category Math - Paths
 */
export function linePath(...pathlets: LinePathlet[]): LinePathBuilder {
    function build(
        pointsOrOptions?: Vec2[] | LinePathOptions,
        options?: LinePathOptions,
    ): Vec2[] {
        options =
            typeof pointsOrOptions === 'object' &&
            !Array.isArray(pointsOrOptions)
                ? pointsOrOptions
                : options;

        const points = Array.isArray(pointsOrOptions) ? pointsOrOptions : [];

        let addedPoints = 0;

        for (let i = 0; i < pathlets.length; i++) {
            addedPoints += pathlets[i]!(points, addedPoints, options);
        }

        ensurePoints(points, addedPoints, options);

        return points;
    }

    return { build };
}

const ENSURE_POINTS_OPTIONS: EnsurePointsOptions = {
    truncate: false,
};

/**
 * Build a single point at the given coordinates.
 *
 * @category Math - Paths
 */
export function pointAt(x: number, y: number): LinePathlet {
    return (points, sliceStart, options) => {
        ENSURE_POINTS_OPTIONS.sliceStart = sliceStart;
        ENSURE_POINTS_OPTIONS.vecPool = options?.vecPool;

        ensurePoints(points, 1, ENSURE_POINTS_OPTIONS);

        points[sliceStart]?.set(x, y);

        return 1;
    };
}

/**
 * Draw a relative line from the last point in the path.
 *
 * @category Math - Paths
 */
export function line(x: number, y: number): LinePathlet {
    return (points, sliceStart, options) => {
        ENSURE_POINTS_OPTIONS.sliceStart = sliceStart;
        ENSURE_POINTS_OPTIONS.vecPool = options?.vecPool;

        ensurePoints(points, 1, ENSURE_POINTS_OPTIONS);

        const last = points[sliceStart - 1];

        if (!last) {
            throw new Error('lineTo expected a last point');
        }

        points[sliceStart]?.set(last.x + x, last.y + y);

        return 1;
    };
}

/**
 * Draw an arc.
 * @param cx - Arc center
 * @param cy - Arc center
 * @param radius - Radius
 * @param startRadians - Start point angle
 * @param endRadians - End point angle
 * @param options - Arc options
 *
 * @category Math - Paths
 */
export function arcAtRadians(
    cx: number,
    cy: number,
    radius: number,
    startRadians: number,
    endRadians: number,
    options?: ArcAtOptions,
): LinePathlet {
    return (points, sliceStart, globalOptions) => {
        ENSURE_POINTS_OPTIONS.sliceStart = sliceStart;
        ENSURE_POINTS_OPTIONS.vecPool = globalOptions?.vecPool;

        return setArcPoints(
            cx,
            cy,
            radius,
            startRadians,
            endRadians,
            options?.clockwise,
            options?.interval ?? globalOptions?.interval ?? 10,
            options?.intervalKind ?? globalOptions?.intervalKind ?? 'distance',
            points,
            undefined,
            ENSURE_POINTS_OPTIONS,
        );
    };
}

/**
 * Draw an arc.
 * @param cx - Arc center
 * @param cy - Arc center
 * @param radius - Radius
 * @param startDegrees - Start point angle in degrees
 * @param endDegrees - End point angle in degrees
 * @param options - Arc options
 *
 * @category Math - Paths
 */
export function arcAtDegrees(
    cx: number,
    cy: number,
    radius: number,
    startDegrees: number,
    endDegrees: number,
    options?: ArcAtOptions,
) {
    return arcAtRadians(
        cx,
        cy,
        radius,
        startDegrees * TO_RADIANS,
        endDegrees * TO_RADIANS,
        options,
    );
}

/**
 * Draw an arc from the last point in the path to the given absolute coordinates.
 * @param c1x - Control point
 * @param c1y - Control point
 * @param toX - End point
 * @param toY - End point
 * @param radius - Arc radius
 * @param options - Arc options
 *
 * @category Math - Paths
 */
export function arcTo(
    c1x: number,
    c1y: number,
    toX: number,
    toY: number,
    radius: number,
    options?: ArcOptions,
): LinePathlet {
    return (points, sliceStart, globalOptions) => {
        ENSURE_POINTS_OPTIONS.sliceStart = sliceStart;
        ENSURE_POINTS_OPTIONS.vecPool = globalOptions?.vecPool;

        const last = points[sliceStart - 1];

        if (!last) {
            throw new Error('lineTo expected a last point');
        }

        return setArcToPoints(
            last.x,
            last.y,
            c1x,
            c1y,
            toX,
            toY,
            radius,
            options?.interval ?? globalOptions?.interval ?? 10,
            options?.intervalKind ?? globalOptions?.intervalKind ?? 'distance',
            points,
            ENSURE_POINTS_OPTIONS,
        );
    };
}

/**
 * Draw an arc from the last point in the path. `c1*` and `to*` are relative to that last point.
 * @param c1x - Control point
 * @param c1y - Control point
 * @param toX - End point
 * @param toY - End point
 * @param radius - Arc radius
 * @param options - Arc options
 *
 * @category Math - Paths
 */
export function arc(
    c1x: number,
    c1y: number,
    toX: number,
    toY: number,
    radius: number,
    options?: ArcOptions,
): LinePathlet {
    return (points, sliceStart, globalOptions) => {
        ENSURE_POINTS_OPTIONS.sliceStart = sliceStart;
        ENSURE_POINTS_OPTIONS.vecPool = globalOptions?.vecPool;

        const last = points[sliceStart - 1];

        if (!last) {
            throw new Error('lineTo expected a last point');
        }

        return setArcToPoints(
            last.x,
            last.y,
            last.x + c1x,
            last.y + c1y,
            last.x + toX,
            last.y + toY,
            radius,
            options?.interval ?? globalOptions?.interval ?? 10,
            options?.intervalKind ?? globalOptions?.intervalKind ?? 'distance',
            points,
            ENSURE_POINTS_OPTIONS,
        );
    };
}
