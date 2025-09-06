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

/**
 * Get the index of `searchElement` in `a` by doing a binary search. Assumes `a` is sorted.
 * @param a - Array to search in
 * @param searchElement - Element to look for
 * @param compare - Optional function to use instead of strict equality (`===`)
 * @returns Index or `-1`
 *
 * @category Utility
 */
export function indexOfSorted<T>(
    a: readonly T[],
    searchElement: T,
    compare?: (searchElement: T, element: T) => number,
): number {
    let left = 0;

    let right = a.length - 1;

    if (compare) {
        while (left <= right) {
            const index = Math.floor((left + right) / 2);

            const element = a[index]!;

            const relative = compare(searchElement, element);

            if (relative === 0) {
                return index;
            }

            if (relative > 0) {
                left = index + 1;
            } else {
                right = index + 1;
            }
        }
    } else {
        while (left <= right) {
            const index = Math.floor((left + right) / 2);

            const element = a[index]!;

            if (element === searchElement) {
                return index;
            }

            if (element < searchElement) {
                left = index + 1;
            } else {
                right = index + 1;
            }
        }
    }
    return -1;
}

/**
 * Find index (for sorted insertion) for `searchElement` in `a` by doing a binary search. Assumes `a` is sorted.
 * @param a - Array to search in
 * @param searchElement - Element to insert
 * @param compare - Optional function to use instead of strict equality (`===`)
 * @returns Index
 *
 * @category Utility
 */
export function insertIndexOfSorted<T>(
    a: readonly T[],
    searchElement: T,
    compare?: (searchElement: T, element: T) => number,
): number {
    let left = 0;

    let right = a.length - 1;

    if (compare) {
        while (left <= right) {
            const index = Math.floor((left + right) / 2);

            const element = a[index]!;

            const relative = compare(searchElement, element);

            if (relative === 0) {
                return index;
            }

            if (relative > 0) {
                left = index + 1;
            } else {
                right = index + 1;
            }
        }
    } else {
        while (left <= right) {
            const index = Math.floor((left + right) / 2);

            const element = a[index]!;

            if (element === searchElement) {
                return index;
            }

            if (element < searchElement) {
                left = index + 1;
            } else {
                right = index + 1;
            }
        }
    }

    return left;
}

/**
 * Ensure that `searchElement` is inserted in order into `a`. Do not insert if already present.
 * Assumes `a` is sorted.
 * @param a - Array to search in
 * @param searchElement - Element to insert
 * @param compare - Optional function to use instead of strict equality (`===`)
 * @returns Index
 *
 * @category Utility
 */
export function ensureIncludedSorted<T>(
    a: T[],
    searchElement: T,
    compare?: (searchElement: T, element: T) => number,
): void {
    let left = 0;

    let right = a.length - 1;

    if (compare) {
        while (left <= right) {
            const index = Math.floor((left + right) / 2);

            const element = a[index]!;

            if (element === searchElement) {
                return;
            }

            const relative = compare(searchElement, element);

            if (relative === 0) {
                a.splice(index, 0, searchElement);
                return;
            }

            if (relative > 0) {
                left = index + 1;
            } else {
                right = index - 1;
            }
        }
    } else {
        while (left <= right) {
            const index = Math.floor((left + right) / 2);

            const element = a[index]!;

            if (element === searchElement) {
                return;
            }

            if (element < searchElement) {
                left = index + 1;
            } else {
                right = index - 1;
            }
        }
    }

    a.splice(left, 0, searchElement);
}
