import { ByteBuffer } from './byte-buffers';
import { ChangeTrackedStorage } from './storage';

/**
 * An element buffer with change tracking.
 *
 * An element is e.g., a vertex, line segmeent, etc. That means offsets into an element buffer do not
 * equal offsets into a byte buffer (a vertex can be of any byte length).
 */
export interface ElementBuffer {
    /** Changed range start element offset. */
    readonly changedFrom: number | undefined;
    /** Changed range element count. */
    readonly changedLength: number;

    /** Total length of the buffer. */
    readonly length: number;
}

/**
 * Byte bvffer that stores elements.
 */
export interface ElementByteBuffer extends ByteBuffer {
    readonly elementByteLength: number;
}

/**
 * Change tracked, writeable element buffer.
 */
export interface WriteElementByteBuffer
    extends ElementByteBuffer,
        ChangeTrackedStorage {
    readonly arrayBuffer: ArrayBuffer;
    readonly u8View: Uint8Array;
}

/**
 * Collection of element byte buffers.
 */
export interface ElementByteBuffers {
    readonly buffers: readonly ElementByteBuffer[];
}
