import { RenderContextLifeCycleHandler } from '../../rendering';
import { ShaderHandle } from '../../rendering/shaders';
import { WGLDriver } from '../driver';

/** @category Rendering - WebGL */
export class WGLShaders implements RenderContextLifeCycleHandler {
    private gl: WebGL2RenderingContext;

    private readonly shaders = new WeakMap<ShaderHandle, WebGLProgram>();

    constructor(driver: WGLDriver) {
        this.gl = driver.gl;
    }

    get(handle: ShaderHandle): WebGLProgram | undefined {
        return this.shaders.get(handle);
    }

    load(
        label: string,
        vertexSource: string,
        fragmentSource: string,
    ): Promise<ShaderHandle> {
        const program = this.createProgram(vertexSource, fragmentSource);

        const handle = new ShaderHandle(label);

        this.shaders.set(handle, program);

        return Promise.resolve(handle);
    }

    async loadProgram(
        label: string,
        vertexSource: string,
        fragmentSource: string,
    ): Promise<[ShaderHandle, WebGLProgram]> {
        const handle = await this.load(label, vertexSource, fragmentSource);

        return [handle, this.get(handle)!];
    }

    initialize(): Promise<void> {
        return Promise.resolve();
    }

    uninitialize(): Promise<void> {
        return Promise.resolve();
    }

    createProgram(vertexSource: string, fragmentSource: string) {
        const { gl } = this;

        const vertexShader = this.createShader('vertex', vertexSource);
        const fragmentShader = this.createShader('fragment', fragmentSource);

        const program = gl.createProgram();

        if (!program) {
            throw new Error('Failed to create program');
        }

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program);

            gl.deleteProgram(program);

            throw new Error(`Failed to link program (${info})`);
        }

        return program;
    }

    createShader(type: 'vertex' | 'fragment', source: string): WebGLShader {
        const { gl } = this;

        const shader = gl.createShader(
            type === 'vertex' ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER,
        );

        if (!shader) {
            throw new Error('Failed to create shader');
        }

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);

            gl.deleteShader(shader);

            throw new Error(`Failed to compile shader (${info})`);
        }

        return shader;
    }
}
