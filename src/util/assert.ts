/** @category Utility */
export function assert(
    condition: boolean,
    message?: string,
): asserts condition is true {
    if (!condition) {
        throw new Error(message ?? 'Assert failed');
    }
}

/** @category Utility */
export function assertEqual<V, E extends V>(
    value: V,
    expected: E,
    message?: string,
): asserts value is E {
    if (value !== expected) {
        throw new Error(message ?? 'Assert failed');
    }
}

/** @category Utility */
export function assertDefined<T>(
    value: T,
    message?: string,
): asserts value is NonNullable<T> {
    if (!value) {
        throw new Error(message ?? 'Assert failed');
    }
}
