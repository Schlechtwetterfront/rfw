import { Mat2D } from '../../math';
import {
    BYTES_PER_LINE_SEGMENT,
    LineBatchBuffers,
} from '../../renderers/lines';
import {
    createVAOAndBuffers,
    uploadByteBuffer,
    VAOWithBuffers,
    WGLBatchIterator,
} from '../../rendering-webgl';
import { WGLDriver } from '../../rendering-webgl/driver';
import { getUniformLocations } from '../../rendering-webgl/shaders';
import { setVertexAttributes } from '../../rendering-webgl/util/vertex-attributes';
import { Camera2D } from '../../rendering/camera2d';
import { assertDefined } from '../../util/assert';
import FRAG_SRC from './lines.frag?raw';
import VERT_SRC from './lines.vert?raw';

/** @category Rendering - Lines - WebGL */
export interface WGLLineRenderBatch {
    readonly size: number;

    readonly storage?: LineBatchBuffers;
}

/** @category Rendering - Lines - WebGL */
export interface WGLLineRendererProgramData {
    program: WebGLProgram;
    projectionLocation: WebGLUniformLocation;
    cameraScaleLocation: WebGLUniformLocation;
}

const PROJECTION_MAT = Mat2D.identity();
const PROJECTION_ARRAY = new Float32Array(6);

/** @category Rendering - Lines - WebGL */
export class WGLLineBatchRenderer {
    protected readonly gl: WebGL2RenderingContext;

    protected readonly batchIterator: WGLBatchIterator<
        WGLLineRenderBatch,
        VAOWithBuffers<LineBatchBuffers>
    >;

    protected program?: WGLLineRendererProgramData;
    protected meshData?: { buffer: WebGLBuffer };

    constructor(protected readonly driver: WGLDriver) {
        this.gl = driver.gl;
        this.batchIterator = new WGLBatchIterator(this.gl);

        driver.addLifeCycleHandler(this);
    }

    async initialize() {
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
            buffer: gl.createBuffer(),
        };

        gl.bindBuffer(gl.ARRAY_BUFFER, this.meshData.buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([0, 0.5, 0, -0.5, 1, 0.5, 1, -0.5]),
            gl.STATIC_DRAW,
        );
    }

    uninitialize(): Promise<void> {
        const { gl } = this;

        this.program = undefined;

        if (this.meshData) {
            gl.deleteBuffer(this.meshData.buffer);

            this.meshData = undefined;
        }

        this.batchIterator.clear();

        return Promise.resolve();
    }

    render(batches: readonly WGLLineRenderBatch[], camera?: Camera2D) {
        const { gl, batchIterator } = this;

        this.prepareRenderPass(camera);
        this.prepareShader(camera);

        batchIterator.restart(batches);

        const handle = batchIterator.getHandle();

        while (batchIterator.next(handle)) {
            const batch = handle.batch;

            if (!batch.storage) {
                throw new Error('No batch storage');
            }

            if (!handle.vaoAndBuffers) {
                handle.setVAOAndBuffers(
                    createVAOAndBuffers(gl, { buffer: batch.storage.buffer }),
                );
            }

            if (handle.initializeAttributes) {
                this.initializeAttributes(handle.vaoAndBuffers!.buffer);
            }

            if (handle.upload) {
                uploadByteBuffer(
                    gl,
                    batch.storage.buffer,
                    handle.vaoAndBuffers!.buffer,
                );
            }

            gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, batch.size);

            this.driver.diagnostics.triangles.count(batch.size * 2);
            this.driver.diagnostics.drawCalls.count();
        }
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

    protected initializeAttributes(buffer: WebGLBuffer) {
        this.initializeMeshAttributes();
        this.initializeInstanceAttributes(buffer);
    }

    protected initializeMeshAttributes() {
        const { gl } = this;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.meshData!.buffer);

        // Pos
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
    }

    protected initializeInstanceAttributes(buffer: WebGLBuffer) {
        const { gl } = this;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

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
