import { ByteBuffer } from '../../rendering/buffers';

/** @category Rendering - WebGL */
export function uploadByteBuffer(
    gl: WebGL2RenderingContext,
    buffer: ByteBuffer,
    glBuffer: WebGLBuffer,
): number {
    if (buffer.changedByteLength === 0) {
        return 0;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);

    gl.bufferSubData(
        gl.ARRAY_BUFFER,
        buffer.changedFromByte,
        buffer.arrayBufferView,
        buffer.changedFromByte,
        buffer.changedByteLength,
    );

    return buffer.changedByteLength;
}
