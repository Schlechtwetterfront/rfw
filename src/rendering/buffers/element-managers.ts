import { ElementByteBuffers, WriteElementByteBuffer } from './element-buffers';
import { ObjectStorage } from './storage';

/**
 * Manages a byte buffer of element size.
 *
 * @category Rendering
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
    setChanged(start: number, end: number): void {
        this._changedFromByte = start * this.elementByteLength;
        this._changedByteLength = (end - start) * this.elementByteLength;
    }

    /** @inheritdoc */
    markChanged(start: number, end: number): void {
        if (this._changedByteLength === 0) {
            this._changedFromByte = start * this.elementByteLength;
            this._changedByteLength = (end - start) * this.elementByteLength;

            return;
        }

        const currentEnd = this._changedFromByte + this._changedByteLength;

        this._changedFromByte = Math.min(
            this._changedFromByte,
            start * this.elementByteLength,
        );
        this._changedByteLength =
            Math.max(end * this.elementByteLength, currentEnd) -
            this._changedFromByte;
    }
}

/**
 * Manages multiple element byte buffers. Useful when one object is written into multiple buffers (
 * e.g., index and vertex buffer).
 *
 * @category Rendering
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
    setChanged(start: number, end: number): void {
        for (let i = 0; i < this.buffers.length; i++) {
            const buffer = this.buffers[i]!;

            buffer.setChanged(start, end);
        }
    }

    /** @inheritdoc */
    markChanged(start: number, end: number): void {
        for (let i = 0; i < this.buffers.length; i++) {
            const buffer = this.buffers[i]!;

            buffer.markChanged(start, end);
        }
    }

    /** @inheritdoc */
    abstract update(object: O, offset: number): void;

    /** @inheritdoc */
    copyWithin(target: number, start: number, end: number): void {
        for (let i = 0; i < this.buffers.length; i++) {
            const buffer = this.buffers[i]!;

            const length = end - start;

            buffer.markChanged(
                Math.min(start, target),
                Math.max(start + length, target + length),
            );

            buffer.u8View.copyWithin(
                target * buffer.elementByteLength,
                start * buffer.elementByteLength,
                end * buffer.elementByteLength,
            );
        }
    }
}
