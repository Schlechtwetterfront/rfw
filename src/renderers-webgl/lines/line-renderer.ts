import { Mat2D } from '../../math';
import { BYTES_PER_LINE_SEGMENT } from '../../renderers/lines';
import { WGLBatchedRenderer } from '../../rendering-webgl/batched-renderer';
import { WGLDriver } from '../../rendering-webgl/driver';
import { getUniformLocations } from '../../rendering-webgl/shaders';
import { setVertexAttributes } from '../../rendering-webgl/util/vertex-attributes';
import { RenderBatch } from '../../rendering/batching';
import { Camera2D } from '../../rendering/camera2d';
import { assert, assertDefined } from '../../util/assert';
import FRAG_SRC from './lines.frag?raw';
import VERT_SRC from './lines.vert?raw';

interface ProgramData {
    program: WebGLProgram;
    projectionLocation: WebGLUniformLocation;
    cameraScaleLocation: WebGLUniformLocation;
}

const PROJECTION_MAT = Mat2D.identity();
const PROJECTION_ARRAY = new Float32Array(6);

export class WGLLineRenderer extends WGLBatchedRenderer {
    protected program?: ProgramData;
    protected meshData?: { buffer: WebGLBuffer };

    constructor(driver: WGLDriver) {
        super(driver);
    }

    override async initialize() {
        await super.initialize();

        const { gl } = this;

        const [_, program] = await this.driver.shaders.loadProgram(
            'lines',
            VERT_SRC,
            FRAG_SRC,
        );

        this.program = {
            program,
            ...getUniformLocations(this.gl, program, {
                projectionLocation: 'u_projection',
                cameraScaleLocation: 'u_cameraScale',
            }),
        };

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

        this.upload(batches, batch => {
            gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, batch.size);

            this.driver.diagnostics.triangles.count(batch.size * 2);
        });
    }

    protected prepareRenderPass(camera?: Camera2D): void {
        const { gl } = this;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.depthMask(false);
    }

    protected prepareShader(camera?: Camera2D): void {
        assertDefined(this.program, 'Renderer not initialized');

        const { gl } = this;

        const { program, projectionLocation, cameraScaleLocation } =
            this.program;

        gl.useProgram(program);

        if (camera) {
            this.driver.projections.getClipProjection(camera, PROJECTION_MAT);
        } else {
            this.driver.projections.getViewportClipProjection(PROJECTION_MAT);
        }

        PROJECTION_MAT.copyTo3x2(PROJECTION_ARRAY);

        gl.uniformMatrix3x2fv(projectionLocation, false, PROJECTION_ARRAY);

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

        setVertexAttributes(
            gl,
            [
                // Before
                {
                    size: 2,
                    type: 'float',
                },
                // Start
                {
                    size: 2,
                    type: 'float',
                },
                // End
                {
                    size: 2,
                    type: 'float',
                },
                // After
                {
                    size: 2,
                    type: 'float',
                },
                // Z
                {
                    size: 1,
                    type: 'float',
                },
                // Thickness
                {
                    size: 1,
                    type: 'float',
                },
                // Alignment
                {
                    size: 1,
                    type: 'float',
                },
                // Dash size
                {
                    size: 1,
                    type: 'float',
                },
                // Gap size
                {
                    size: 1,
                    type: 'float',
                },
                // Distance start
                {
                    size: 1,
                    type: 'float',
                },
                // Distance end
                {
                    size: 1,
                    type: 'float',
                },
                {
                    size: 4,
                    type: 'unsignedByte',
                    normalize: true,
                },
            ],
            {
                index: 1,
                stride: BYTES_PER_LINE_SEGMENT,
                divisor: 1,
            },
        );
    }
}
