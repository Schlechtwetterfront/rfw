import { WriteBuffer } from './buffers';
import { ByteBuffer } from './byte-buffers';

/**
 * Manager for a {@link ByteBuffer}.
 *
 * Any changes (e.g., applied via using {@link ByteBufferManager.u8View} directly or creating new
 * views of {@link ByteBufferManager.buffer}) must be tracked via {@link ByteBufferManager.setChanged}
 * or {@link ByteBufferManager.markChanged}.
 *
 * @category Rendering - Buffers
 */
export class ByteBufferManager implements ByteBuffer, WriteBuffer {
    private _changedFromByte = 0;
    private _changedByteLength = 0;

    /** @inheritdoc */
    get changedFromByte() {
        return this._changedFromByte;
    }

    /** @inheritdoc */
    get changedByteLength() {
        return this._changedByteLength;
    }

    /** @inheritdoc */
    get byteLength() {
        return this.buffer.byteLength;
    }

    /** @inheritdoc */
    readonly buffer: ArrayBuffer;

    readonly u8View: Uint8Array;

    /** @inheritdoc */
    readonly arrayBufferView: ArrayBufferView;

    constructor(byteLength: number) {
        this.buffer = new ArrayBuffer(byteLength);

        this.arrayBufferView = this.u8View = new Uint8Array(this.buffer);
    }

    /** @inheritdoc */
    clearChange(): void {
        this._changedFromByte = 0;
        this._changedByteLength = 0;
    }

    /** @inheritdoc */
    setChanged(start: number, end: number): void {
        this._changedFromByte = start;
        this._changedByteLength = end - start;
    }

    /** @inheritdoc */
    markChanged(start: number, end: number): void {
        if (this._changedByteLength === 0) {
            this._changedFromByte = start;
            this._changedByteLength = end - start;

            return;
        }

        const currentEnd = this._changedFromByte + this._changedByteLength;

        this._changedFromByte = Math.min(this._changedFromByte, start);
        this._changedByteLength =
            Math.max(end, currentEnd) - this._changedFromByte;
    }
}
