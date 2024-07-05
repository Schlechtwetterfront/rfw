/**
 * Byte buffer with change tracking.
 *
 * @category Rendering - Buffers
 */
export interface ByteBuffer {
    /** Changed range start byte offset. */
    readonly changedFromByte: number;
    /** Changed range byte length. */
    readonly changedByteLength: number;

    /** Total byte length of the buffer. */
    readonly byteLength: number;

    /** Buffer view. */
    readonly arrayBufferView: ArrayBufferView;
}

/**
 * Collection of byte buffers.
 *
 * @category Rendering - Buffers
 */
export interface ByteBuffers {
    /** Buffers. */
    readonly buffers: readonly ByteBuffer[];
}
