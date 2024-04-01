import { BYTES_PER_LINE_SEGMENT } from '../../renderers/lines';
import { WGLBatchedRenderer } from '../../rendering-webgl/batched-renderer';
import { WGLDriver } from '../../rendering-webgl/driver';
import { RenderBatch } from '../../rendering/batching';
import { Camera2D } from '../../rendering/camera2d';
import { getUseOnceClipProjectionArray } from '../../rendering/projection';
import { assert, assertDefined } from '../../util/assert';
import { FLOAT_SIZE } from '../../util/sizes';
import FRAG_SRC from './lines.frag?raw';
import VERT_SRC from './lines.vert?raw';

interface ProgramData {
    program: WebGLProgram;
    projectionLocation: WebGLUniformLocation;
    cameraScaleLocation: WebGLUniformLocation;
}

export class WGLLineRenderer extends WGLBatchedRenderer {
    private program?: ProgramData;
    private meshData?: { buffer: WebGLBuffer };

    constructor(driver: WGLDriver) {
        super(driver);
    }

    override async initialize() {
        await super.initialize();

        const { gl } = this;

        const programHandle = await this.driver.shaders.load(
            'lines',
            VERT_SRC,
            FRAG_SRC,
        );
        const program = this.driver.shaders.get(programHandle)!;

        const projectionLocation = gl.getUniformLocation(
            program,
            'u_projection',
        )!;
        const cameraScaleLocation = gl.getUniformLocation(
            program,
            'u_cameraScale',
        )!;

        this.program = { program, projectionLocation, cameraScaleLocation };

        this.meshData = {
            buffer: gl.createBuffer()!,
        };

        gl.bindBuffer(gl.ARRAY_BUFFER, this.meshData.buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([0, 0.5, 0, -0.5, 1, 0.5, 1, -0.5]),
            gl.STATIC_DRAW,
        );
    }

    override async uninitialize(): Promise<void> {
        await super.uninitialize();

        const { gl } = this;

        this.program = undefined;

        if (this.meshData) {
            gl.deleteBuffer(this.meshData.buffer);

            this.meshData = undefined;
        }
    }

    render(batches: readonly RenderBatch[], camera?: Camera2D) {
        const { gl } = this;

        this.prepareRenderPass(camera);
        this.prepareShader(camera);

        this.renderBatches(batches, batch => {
            gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, batch.size);

            this.driver.diagnostics.triangles.count(batch.size * 2);
        });
    }

    protected prepareRenderPass(camera?: Camera2D): void {
        const { gl } = this;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
        gl.depthMask(false);
    }

    protected prepareShader(camera?: Camera2D): void {
        assertDefined(this.program, 'Renderer not initialized');

        const { gl } = this;

        const { program, projectionLocation, cameraScaleLocation } =
            this.program;

        gl.useProgram(program);

        gl.uniformMatrix3x2fv(
            projectionLocation,
            false,
            getUseOnceClipProjectionArray(this.driver.dimensions, camera),
        );

        gl.uniform1f(cameraScaleLocation, 1 / (camera?.transform.scale.x ?? 1));
    }

    protected override initializeAttributes(buffers: WebGLBuffer[]) {
        assert(
            buffers.length === 1,
            'Line renderer takes one per-instance buffer',
        );

        this.initializeMeshAttributes();
        this.initializeInstanceAttributes(buffers[0]!);
    }

    protected initializeMeshAttributes() {
        const { gl } = this;

        gl.bindBuffer(this.gl.ARRAY_BUFFER, this.meshData!.buffer);

        // Pos
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
    }

    protected initializeInstanceAttributes(buffer: WebGLBuffer) {
        const { gl } = this;

        gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);

        // Before
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(
            1,
            2,
            gl.FLOAT,
            false,
            BYTES_PER_LINE_SEGMENT,
            0,
        );
        gl.vertexAttribDivisor(1, 1);

        // Start
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(
            2,
            2,
            gl.FLOAT,
            false,
            BYTES_PER_LINE_SEGMENT,
            2 * FLOAT_SIZE,
        );
        gl.vertexAttribDivisor(2, 1);

        // End
        gl.enableVertexAttribArray(3);
        gl.vertexAttribPointer(
            3,
            2,
            gl.FLOAT,
            false,
            BYTES_PER_LINE_SEGMENT,
            4 * FLOAT_SIZE,
        );
        gl.vertexAttribDivisor(3, 1);

        // After
        gl.enableVertexAttribArray(4);
        gl.vertexAttribPointer(
            4,
            2,
            gl.FLOAT,
            false,
            BYTES_PER_LINE_SEGMENT,
            6 * FLOAT_SIZE,
        );
        gl.vertexAttribDivisor(4, 1);

        // Z
        gl.enableVertexAttribArray(5);
        gl.vertexAttribPointer(
            5,
            1,
            gl.FLOAT,
            false,
            BYTES_PER_LINE_SEGMENT,
            8 * FLOAT_SIZE,
        );
        gl.vertexAttribDivisor(5, 1);

        // Thickness
        gl.enableVertexAttribArray(6);
        gl.vertexAttribPointer(
            6,
            1,
            gl.FLOAT,
            false,
            BYTES_PER_LINE_SEGMENT,
            9 * FLOAT_SIZE,
        );
        gl.vertexAttribDivisor(6, 1);

        // Alignment
        gl.enableVertexAttribArray(7);
        gl.vertexAttribPointer(
            7,
            1,
            gl.FLOAT,
            false,
            BYTES_PER_LINE_SEGMENT,
            10 * FLOAT_SIZE,
        );
        gl.vertexAttribDivisor(7, 1);

        // Dash size
        gl.enableVertexAttribArray(8);
        gl.vertexAttribPointer(
            8,
            1,
            gl.FLOAT,
            false,
            BYTES_PER_LINE_SEGMENT,
            11 * FLOAT_SIZE,
        );
        gl.vertexAttribDivisor(8, 1);

        // Gap size
        gl.enableVertexAttribArray(9);
        gl.vertexAttribPointer(
            9,
            1,
            gl.FLOAT,
            false,
            BYTES_PER_LINE_SEGMENT,
            12 * FLOAT_SIZE,
        );
        gl.vertexAttribDivisor(9, 1);

        // Distance start
        gl.enableVertexAttribArray(10);
        gl.vertexAttribPointer(
            10,
            1,
            gl.FLOAT,
            false,
            BYTES_PER_LINE_SEGMENT,
            13 * FLOAT_SIZE,
        );
        gl.vertexAttribDivisor(10, 1);

        // Distance end
        gl.enableVertexAttribArray(11);
        gl.vertexAttribPointer(
            11,
            1,
            gl.FLOAT,
            false,
            BYTES_PER_LINE_SEGMENT,
            14 * FLOAT_SIZE,
        );
        gl.vertexAttribDivisor(11, 1);

        // Color
        gl.enableVertexAttribArray(12);
        gl.vertexAttribPointer(
            12,
            4,
            gl.UNSIGNED_BYTE,
            true,
            BYTES_PER_LINE_SEGMENT,
            15 * FLOAT_SIZE,
        );
        gl.vertexAttribDivisor(12, 1);
    }
}
