import { swapDeleteAt } from '../../src';

function prep() {
    const a = [];

    for (let i = 0; i < 100_000; i++) {
        a[i] = i;
    }

    return a;
}

export function benchSpliceDelete() {
    const a = prep();

    const start = performance.now();

    for (let i = 0; i < 100_000; i++) {
        const index = Math.floor(Math.random() * a.length);

        a.splice(index, 1);
    }

    return performance.now() - start;
}

export function benchSwapDeleteIndex() {
    const a = prep();

    const start = performance.now();

    for (let i = 0; i < 100_000; i++) {
        const index = Math.floor(Math.random() * a.length);

        swapDeleteAt(a, index);
    }

    return performance.now() - start;
}
