/* eslint-disable @typescript-eslint/no-unused-vars */
function prep() {
    const a: number[] = [];
    const m = new Map<number, number>();
    const s = new Set<number>();

    for (let i = 0; i < 100_000; i++) {
        a[i] = i;
        m.set(i, i);
        s.add(i);
    }

    return [a, m, s] as const;
}

export function benchArrayIterFor() {
    const [a] = prep();

    const start = performance.now();

    let sum = 0;

    for (let i = 0; i < a.length; i++) {
        sum += a[i]!;
    }

    return performance.now() - start;
}

export function benchArrayIterForEach() {
    const [a] = prep();

    const start = performance.now();

    let sum = 0;

    for (const v of a) {
        sum += v;
    }

    return performance.now() - start;
}

export function benchMapIterForEachKeys() {
    const [_, m] = prep();

    const start = performance.now();

    let sum = 0;

    for (const v of m.keys()) {
        sum += v;
    }

    return performance.now() - start;
}

export function benchMapIterForEachValues() {
    const [_, m] = prep();

    const start = performance.now();

    let sum = 0;

    for (const v of m.values()) {
        sum += v;
    }

    return performance.now() - start;
}

export function benchSetIterForEach() {
    const [_, __, s] = prep();

    const start = performance.now();

    let sum = 0;

    for (const v of s) {
        sum += v;
    }

    return performance.now() - start;
}
