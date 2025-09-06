import { ByteBuffer } from '../../rendering/buffers';

/** @category Rendering - WebGL */
export interface WithVAO {
    vao: WebGLVertexArrayObject;
}

/** @category Rendering - WebGL */
export interface VAOWithBufferArray extends WithVAO {
    buffers: WebGLBuffer[];
}

/** @category Rendering - WebGL */
export function createVAOAndBufferArray(
    gl: WebGL2RenderingContext,
    buffers: readonly ByteBuffer[],
): VAOWithBufferArray {
    const data = {
        vao: gl.createVertexArray(),
        buffers: [],
    } as VAOWithBufferArray;

    for (let i = 0; i < buffers.length; i++) {
        const buffer = gl.createBuffer();

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

/** @category Rendering - WebGL */
export type VAOWithBuffers<B> = WithVAO & BufferMap<B>;

/** @category Rendering - WebGL */
export type ByteBufferMap = {
    [key: string]: ByteBuffer;
};

/** @category Rendering - WebGL */
export type BufferMap<B> = {
    [K in keyof B]: WebGLBuffer;
};

/** @category Rendering - WebGL */
export function createVAOAndBuffers<B extends ByteBufferMap>(
    gl: WebGL2RenderingContext,
    buffers: B,
): VAOWithBuffers<B> {
    const propNames = Object.getOwnPropertyNames(
        buffers,
    ) as (keyof BufferMap<B>)[];

    const data = {} as BufferMap<B>;

    for (let i = 0; i < propNames.length; i++) {
        const propName = propNames[i]!;
        const byteBuffer = buffers[propName]!;

        const glBuffer = gl.createBuffer();

        data[propName] = glBuffer;

        gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);

        gl.bufferData(
            gl.ARRAY_BUFFER,
            byteBuffer.arrayBufferView,
            gl.DYNAMIC_DRAW,
        );
    }

    return { vao: gl.createVertexArray(), ...data };
}
