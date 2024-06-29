import { beforeEach, describe, expect, test } from 'vitest';
import { swapDelete, swapDeleteAt } from '../../src';

describe('swap delete', () => {
    let a: string[];

    beforeEach(() => {
        a = Array.from({ length: 100 });

        a.forEach((_, i) => (a[i] = `el ${i}`));
    });

    test('deletes element', () => {
        expect(a.length).toBe(100);
        expect(a[10]).toBe('el 10');

        expect(swapDelete(a, 'el 10')).toBe('el 99');

        expect(a[10]).toBe('el 99');
    });

    test('deletes at index', () => {
        expect(a.length).toBe(100);
        expect(a[10]).toBe('el 10');

        expect(swapDeleteAt(a, 10)).toBe('el 99');
        expect(a[10]).toBe('el 99');
    });
});
