import { WriteBuffer } from './buffers';
import { ByteBuffer } from './byte-buffers';

/**
 * Manager for a {@link ByteBuffer}.
 *
 * Any changes (e.g., applied via using {@link ByteBufferManager.u8View} directly or creating new
 * views of {@link ByteBufferManager.buffer}) must be tracked via {@link ByteBufferManager.setChanged}
 * or {@link ByteBufferManager.markChanged}.
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
    setChanged(from: number, length: number): void {
        this._changedFromByte = from;
        this._changedByteLength = length;
    }

    /** @inheritdoc */
    markChanged(from: number, length: number): void {
        if (this._changedByteLength === 0) {
            this._changedByteLength = length;
            this._changedFromByte = from;

            return;
        }

        const currentRight = this._changedFromByte + this._changedByteLength;
        const right = from + length;

        this._changedFromByte = Math.min(this._changedFromByte, from);
        this._changedByteLength =
            Math.max(right, currentRight) - this._changedFromByte;
    }
}
