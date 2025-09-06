import { ChangeTrackedBuffer } from './buffers';
import { ByteBuffer } from './byte-buffers';

/**
 * An element buffer with change tracking.
 *
 * An element is e.g., a vertex, line segmeent, etc. That means offsets into an element buffer do not
 * equal offsets into a byte buffer (a vertex can be of any byte length).
 *
 * @category Rendering - Buffers
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
 *
 * @category Rendering - Buffers
 */
export interface ElementByteBuffer extends ByteBuffer {
    readonly elementByteLength: number;
}

/**
 * Change tracked, writeable element buffer.
 *
 * @category Rendering - Buffers
 */
export interface WriteElementByteBuffer
    extends ElementByteBuffer,
        ChangeTrackedBuffer {
    readonly arrayBuffer: ArrayBuffer;
    readonly uint8View: Uint8Array;
}
