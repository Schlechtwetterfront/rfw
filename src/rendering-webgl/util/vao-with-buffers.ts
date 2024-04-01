import { ByteBuffer } from '../../rendering/buffers';

export interface VAOWithBuffers {
    vao: WebGLVertexArrayObject;
    buffers: WebGLBuffer[];
}

export function createVAOAndBuffers(
    gl: WebGL2RenderingContext,
    buffers: readonly ByteBuffer[],
): VAOWithBuffers {
    const data = {
        vao: gl.createVertexArray()!,
        buffers: [],
    } as VAOWithBuffers;

    for (let i = 0; i < buffers.length; i++) {
        const buffer = gl.createBuffer()!;

        data.buffers.push(buffer);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        gl.bufferData(
            gl.ARRAY_BUFFER,
            buffers[i]!.arrayBufferView,
            gl.DYNAMIC_DRAW,
        );
    }

    return data;
}
