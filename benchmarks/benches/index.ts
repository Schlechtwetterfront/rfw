import { benchSpliceDelete, benchSwapDeleteIndex } from './array-delete';
import {
    benchArrayIterFor,
    benchArrayIterForEach,
    benchMapIterForEachKeys,
    benchMapIterForEachValues,
    benchSetIterForEach,
} from './iter';

export interface Bench {
    label: string;
    items: BenchItem[];
}

export interface BenchItem {
    label: string;
    baseline?: true;
    fn: () => number;
}

export const BENCHES: Bench[] = [
    {
        label: 'Array delete',
        items: [
            {
                label: 'Splice (index)',
                fn: benchSpliceDelete,
            },
            {
                label: 'Swap (index)',
                fn: benchSwapDeleteIndex,
                baseline: true,
            },
        ],
    },
    {
        label: 'Iter',
        items: [
            {
                label: 'Array (for)',
                fn: benchArrayIterFor,
                baseline: true,
            },
            {
                label: 'Array (for of)',
                fn: benchArrayIterForEach,
            },
            {
                label: 'Map (for of keys)',
                fn: benchMapIterForEachKeys,
            },
            {
                label: 'Map (for of values)',
                fn: benchMapIterForEachValues,
            },
            {
                label: 'Set (for of)',
                fn: benchSetIterForEach,
            },
        ],
    },
];
