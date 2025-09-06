import { describe, expect, test } from 'vitest';
import { FenwickTree } from '../../src/util/fenwick-tree';

describe('fenwick tree', () => {
    test('init', () => {
        new FenwickTree(4);
    });

    test('add', () => {
        const tree = new FenwickTree();

        tree.add(0, 4);

        expect(tree.at(0)).toBe(4);
    });

    test('add 2', () => {
        const tree = new FenwickTree();

        tree.add(0, 4);
        tree.add(1, 4);
        tree.add(2, 4);

        expect(tree.at(2)).toBe(4);
        expect(tree.sumToIncluding(2)).toBe(12);
    });

    test('set', () => {
        const tree = new FenwickTree();

        tree.add(0, 4);
        tree.add(1, 4);
        tree.add(2, 4);

        expect(tree.sumToIncluding(2)).toBe(12);

        tree.set(1, 0);

        expect(tree.at(1)).toBe(0);
        expect(tree.sumToIncluding(2)).toBe(8);
    });

    test('grow', () => {
        const tree = new FenwickTree();

        tree.add(0, 4);
        tree.add(1, 4);
        tree.add(2, 4);
        tree.add(3, 4);
        tree.add(4, 4);
        tree.add(5, 4);
    });
});
