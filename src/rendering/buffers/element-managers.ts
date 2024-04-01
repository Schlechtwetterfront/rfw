import { ElementByteBuffers, WriteElementByteBuffer } from './element-buffers';
import { ObjectStorage } from './storage';

/**
 * Manages a byte buffer of element size.
 */
export class ElementByteBufferManager implements WriteElementByteBuffer {
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
        return this.arrayBuffer.byteLength;
    }

    /** @inheritdoc */
    readonly arrayBuffer: ArrayBuffer;

    readonly u8View: Uint8Array;

    /** @inheritdoc */
    readonly arrayBufferView: ArrayBufferView;

    /**
     * Create a new instance.
     * @param maxElementCount - Max number of elements in this buffer
     * @param elementByteLength - Byte length of one element
     */
    constructor(
        maxElementCount: number,
        readonly elementByteLength: number,
    ) {
        this.arrayBuffer = new ArrayBuffer(maxElementCount * elementByteLength);

        this.arrayBufferView = this.u8View = new Uint8Array(this.arrayBuffer);
    }

    /** @inheritdoc */
    clearChange(): void {
        this._changedFromByte = 0;
        this._changedByteLength = 0;
    }

    /** @inheritdoc */
    setChanged(from: number, length: number): void {
        this._changedFromByte = from * this.elementByteLength;
        this._changedByteLength = length * this.elementByteLength;
    }

    /** @inheritdoc */
    markChanged(from: number, length: number): void {
        if (this._changedByteLength === 0) {
            this._changedByteLength = length * this.elementByteLength;
            this._changedFromByte = from * this.elementByteLength;

            return;
        }

        const currentRight = this._changedFromByte + this._changedByteLength;
        const right =
            from * this.elementByteLength + length * this.elementByteLength;

        this._changedFromByte = Math.min(
            this._changedFromByte,
            from * this.elementByteLength,
        );
        this._changedByteLength =
            Math.max(right, currentRight) - this._changedFromByte;
    }
}

/**
 * Manages multiple element byte buffers. Useful when one object is written into multiple buffers (
 * e.g., index and vertex buffer).
 */
export abstract class ElementByteBuffersManager<O>
    implements ElementByteBuffers, ObjectStorage<O>
{
    constructor(readonly buffers: readonly WriteElementByteBuffer[]) {}

    /** @inheritdoc */
    clearChange(): void {
        for (let i = 0; i < this.buffers.length; i++) {
            const buffer = this.buffers[i]!;

            buffer.clearChange();
        }
    }

    /** @inheritdoc */
    setChanged(from: number, length: number): void {
        for (let i = 0; i < this.buffers.length; i++) {
            const buffer = this.buffers[i]!;

            buffer.setChanged(from, length);
        }
    }

    /** @inheritdoc */
    markChanged(from: number, length: number): void {
        for (let i = 0; i < this.buffers.length; i++) {
            const buffer = this.buffers[i]!;

            buffer.markChanged(from, length);
        }
    }

    /** @inheritdoc */
    abstract update(object: O, offset: number): void;

    /** @inheritdoc */
    copyWithin(to: number, from: number, length: number): void {
        for (let i = 0; i < this.buffers.length; i++) {
            const buffer = this.buffers[i]!;

            buffer.markChanged(Math.min(from, to), Math.max(from, to) + length);

            buffer.u8View.copyWithin(
                to * buffer.elementByteLength,
                from * buffer.elementByteLength,
                length * buffer.elementByteLength,
            );
        }
    }
}
