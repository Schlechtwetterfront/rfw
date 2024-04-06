import { describe, expect, test } from 'vitest';
import {
    higherPowerOfTwo,
    lowerPowerOfTwo,
    roundDownPowerOfTwo,
    roundUpPowerOfTwo,
} from '../../src/math/util';

describe('po2', () => {
    test('round up', () => {
        expect(roundUpPowerOfTwo(0)).toBe(1);
        expect(roundUpPowerOfTwo(1)).toBe(1);
        expect(roundUpPowerOfTwo(2)).toBe(2);
        expect(roundUpPowerOfTwo(3)).toBe(4);
        expect(roundUpPowerOfTwo(4)).toBe(4);
    });

    test('higher', () => {
        expect(higherPowerOfTwo(0)).toBe(1);
        expect(higherPowerOfTwo(1)).toBe(2);
        expect(higherPowerOfTwo(2)).toBe(4);
    });

    test('round down', () => {
        expect(roundDownPowerOfTwo(1)).toBe(1);
        expect(roundDownPowerOfTwo(2)).toBe(2);
        expect(roundDownPowerOfTwo(3)).toBe(2);
        expect(roundDownPowerOfTwo(4)).toBe(4);
        expect(roundDownPowerOfTwo(5)).toBe(4);
    });

    test('lower', () => {
        expect(lowerPowerOfTwo(2)).toBe(1);
        expect(lowerPowerOfTwo(4)).toBe(2);
    });
});
