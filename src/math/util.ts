import { Vec2Like } from './vec2';

/**
 * Round a value up to a power of two. If `n` is a power of two, returns `n`.
 * @param n - Number to round from
 * @returns Power of two
 * @remarks
 * Only works in a 32-bit range
 */
export function roundUpPowerOfTwo(n: number): number {
    return 1 << (32 - Math.clz32(n - 1));
}

/**
 * Get the next higher power of two from `n`.
 * @param n - Base value
 * @returns Next higher power of two
 * @remarks
 * Only works in a 32-bit range
 */
export function higherPowerOfTwo(n: number): number {
    return 1 << (32 - Math.clz32(n));
}

/**
 * Round a value down to a power of two. If `n` is a power of two, returns `n`.
 * @param n - Number to round from
 * @returns Power of two
 * @remarks
 * Only works in a 32-bit range
 */
export function roundDownPowerOfTwo(n: number): number {
    return 1 << (31 - Math.clz32(n));
}

/**
 * Get the next lower power of two from `n`.
 * @param n - Base value
 * @returns Next lower power of two
 * @remarks
 * Only works in a 32-bit range
 */
export function lowerPowerOfTwo(n: number): number {
    return 1 << (31 - Math.clz32(n - 1));
}

/**
 * Lerp between `v0` and `v1` based on `t`.
 * @param v0 - 0 value
 * @param v1 - 1 value
 * @param t - Time
 * @returns Lerped value
 */
export function lerp(v0: number, v1: number, t: number): number {
    return (1 - t) * v0 + t * v1;
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

/**
 * Check if the lines `p0` to `p1` and `p2` to `p3` intersect.
 * @param p0 - Start of line 1
 * @param p1 - End of line 1
 * @param p2 - Start of line 2
 * @param p3 - End of line 2
 * @returns `true` if the lines intersect
 */
export function linesIntersect(
    p0: Vec2Like,
    p1: Vec2Like,
    p2: Vec2Like,
    p3: Vec2Like,
): boolean {
    let partial = false;
    let p01 = 0;
    let p23 = 0;

    const denom = (p2.y - p3.y) * (p0.x - p1.x) - (p0.y - p1.y) * (p2.x - p3.x);

    if (denom === 0) {
        p01 = p23 = -1;
    } else {
        p01 =
            (p2.x * (p1.y - p3.y) +
                p3.x * (p2.y - p1.y) +
                p1.x * (p3.y - p2.y)) /
            denom;

        partial = p01 >= 0 && p01 <= 1;

        if (partial) {
            p23 =
                (p1.y * (p0.x - p3.x) +
                    p3.y * (p1.x - p0.x) +
                    p0.y * (p3.x - p1.x)) /
                denom;
        }
    }

    if (partial && p23 >= 0 && p23 <= 1) {
        return true;
    }

    return false;
}
