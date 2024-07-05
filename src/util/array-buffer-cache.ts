import { roundUpPowerOfTwo } from '../math/util';

/**
 * Keeps a cache of `ArrayBuffer`s. Buffers are sized to a power of two. Only one buffer exists for
 * any size at a time. It does not create new buffers for the same size.
 *
 * @category Utility
 */
export class ArrayBufferCache {
    private readonly buffers = new Array<ArrayBuffer>();

    /**
     * Get a buffer for the given size.
     * @param bytes - Minimum number of bytes. Will be rounded up to the next highest power of two
     * @returns The `ArrayBuffer` for the rounded size
     */
    get(bytes: number): ArrayBuffer {
        const nextPoT = roundUpPowerOfTwo(bytes);
        const index = Math.log2(nextPoT);

        let buffer = this.buffers[index];

        if (!buffer) {
            buffer = new ArrayBuffer(nextPoT);

            this.buffers[index] = buffer;
        }

        return buffer;
    }

    /**
     * Clear all buffers.
     */
    clear(): void {
        this.buffers.length = 0;
    }
}
