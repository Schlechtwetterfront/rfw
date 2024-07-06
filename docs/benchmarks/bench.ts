export interface Bench {
    label: string;
    items: BenchItem[];
}

export interface BenchItem {
    label: string;
    baseline?: true;
    fn: () => number;
}

export function timeoutPromise(t = 0): Promise<void> {
    return new Promise(resolve => {
        setTimeout(() => resolve(), t);
    });
}
