import { roundUpPowerOfTwo } from '../../math/util';

/** @category Rendering - WebGL */
export class WGLBufferCache {
    private readonly buffers: WebGLBuffer[] = [];

    constructor(
        private readonly gl: WebGL2RenderingContext,
        private readonly usage: number,
    ) {}

    take(bytes: number): WebGLBuffer {
        const nextPoT = roundUpPowerOfTwo(bytes);
        const index = Math.log2(nextPoT);

        let buffer = this.buffers[index];

        if (!buffer) {
            const { gl } = this;

            buffer = gl.createBuffer()!;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, nextPoT, this.usage);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            this.buffers[index] = buffer;
        }

        return buffer;
    }

    clear(): void {
        this.buffers.forEach(b => this.gl.deleteBuffer(b));
        this.buffers.length = 0;
    }
}
