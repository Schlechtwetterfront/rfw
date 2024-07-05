/**
 * Delete an element from an array by swapping it with the last element and then truncating.
 * @param a - Array to delete in
 * @param element - Element to delete
 * @returns Swapped element, if found
 *
 * @category Utility
 */
export function swapDelete<T>(a: T[], element: T): T | undefined {
    const index = a.indexOf(element);

    if (index < 0) {
        return undefined;
    }

    return swapDeleteAt(a, index);
}

/**
 * Delete element at index from an array by swapping it with the last element and then truncating.
 * @param a - Array to delete in
 * @param index - Index to delete
 * @returns Swapped element, if any
 *
 * @category Utility
 */
export function swapDeleteAt<T>(a: T[], index: number): T | undefined {
    const { length } = a;

    let last: T | undefined;

    if (index < length - 1) {
        last = a[length - 1]!;

        a[index] = last;
    }

    a.length--;

    return last;
}
