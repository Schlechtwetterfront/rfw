import { WriteElementByteBuffer } from './element-buffers';

/**
 * Manages a byte buffer of element size.
 *
 * @category Rendering - Buffers
 */
export class ElementByteBufferManager implements WriteElementByteBuffer {
    private _changedFromByte = 0;
    private _changedByteLength = 0;

    get changedFromByte() {
        return this._changedFromByte;
    }

    get changedByteLength() {
        return this._changedByteLength;
    }

    get byteLength() {
        return this.arrayBuffer.byteLength;
    }

    readonly arrayBuffer: ArrayBuffer;

    readonly uint8View: Uint8Array;

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

        this.arrayBufferView = this.uint8View = new Uint8Array(
            this.arrayBuffer,
        );
    }

    clearChange(): void {
        this._changedFromByte = 0;
        this._changedByteLength = 0;
    }

    setChanged(start: number, end: number): void {
        this._changedFromByte = start * this.elementByteLength;
        this._changedByteLength = (end - start) * this.elementByteLength;
    }

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

    copyWithin(target: number, start: number, end?: number): void {
        end ??= this.uint8View.length;

        this.uint8View.copyWithin(target, start, end);

        const length = end - start;

        this.markChanged(
            Math.min(start, target),
            Math.max(start + length, target + length),
        );
    }
}
