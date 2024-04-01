/**
 * Round a value up to a power of two. If `n` is a power of two, returns `n`.
 * @param n - Number to round from
 * @returns Power of two
 */
export function roundUpPowerOfTwo(n: number): number {
    return 1 << (32 - Math.clz32(n - 1));
}

/**
 * Get the next higher power of two from `n`.
 * @param n - Base value
 * @returns Next higher power of two
 */
export function higherPowerOfTwo(n: number): number {
    return 1 << (32 - Math.clz32(n));
}

/**
 * Round a value down to a power of two. If `n` is a power of two, returns `n`.
 * @param n - Number to round from
 * @returns Power of two
 */
export function roundDownPowerOfTwo(n: number): number {
    return 1 << (31 - Math.clz32(n));
}

/**
 * Get the next lower power of two from `n`.
 * @param n - Base value
 * @returns Next lower power of two
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
