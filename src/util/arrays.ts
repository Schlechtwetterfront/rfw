/** @category Utility */
export type TypedArray =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array
    | BigInt64Array
    | BigUint64Array;

/** @category Utility */
export type TypedIntArray =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | BigInt64Array
    | BigUint64Array;

/** @category Utility */
export type TypedFloatArray = Float32Array | Float64Array;

/**
 * Check if `a` is any of the typed int arrays.
 * @param a - Array to check
 * @returns `true` if `a` is a typed int array
 *
 * @category Utility
 */
export function isIntArray(a: TypedArray): a is TypedIntArray {
    return !(a instanceof Float32Array) && !(a instanceof Float64Array);
}

/**
 * Check if `a` is any of the typed float arrays.
 * @param a - Array to check
 * @returns `true` if `a` is a typed float array
 *
 * @category Utility
 */
export function isFloatArray(a: TypedArray): a is TypedFloatArray {
    return a instanceof Float32Array || a instanceof Float64Array;
}
