import { Mat2D } from '../../math';
import { roundUpPowerOfTwo } from '../../math/util';
import { BYTES_PER_VERTEX, MeshBatchBuffers } from '../../renderers/mesh';
import { RenderContextLifeCycleHandler } from '../../rendering';
import {
    createVAOAndBuffers,
    uploadByteBuffer,
    VAOWithBuffers,
    WGLBatchIterator,
} from '../../rendering-webgl';
import { WGLDriver } from '../../rendering-webgl/driver';
import {
    bindMultiTexture,
    buildMultiTextureSamplingShaders,
    getUniformLocations,
} from '../../rendering-webgl/shaders';
import { setVertexAttributes } from '../../rendering-webgl/util/vertex-attributes';
import { Camera2D } from '../../rendering/camera2d';
import { getMaxTextures, TextureHandle } from '../../rendering/textures';
import { assert } from '../../util/assert';
import FRAG_TEMPLATE from './mesh-batch.template.frag?raw';
import VERT_SRC from './mesh-batch.vert?raw';

/** @category Rendering - Mesh - WebGL */
export interface WGLMeshRenderBatch {
    readonly vertexCount: number;

    readonly textureCount: number;
    readonly textures: readonly TextureHandle[];

    readonly storage?: MeshBatchBuffers;
}

/** @category Rendering - Mesh - WebGL */
export interface WGLMeshBatchRendererProgramData {
    program: WebGLProgram;
    projectionLocation: WebGLUniformLocation;
    samplerLocation: WebGLUniformLocation;
    samplerUnits: Int32Array;
}

const PROJECTION_MAT = Mat2D.identity();
const PROJECTION_ARRAY = new Float32Array(6);

/** @category Rendering - Mesh - WebGL */
export class WGLMeshBatchRenderer implements RenderContextLifeCycleHandler {
    protected readonly gl: WebGL2RenderingContext;

    protected readonly batchIterator: WGLBatchIterator<
        WGLMeshRenderBatch,
        VAOWithBuffers<MeshBatchBuffers>
    >;

    protected programs: WGLMeshBatchRendererProgramData[] = [];

    constructor(protected readonly driver: WGLDriver) {
        this.gl = driver.gl;
        this.batchIterator = new WGLBatchIterator(this.gl);

        driver.addLifeCycleHandler(this);
    }

    async initialize() {
        const { gl } = this;

        const shaderInfos = await buildMultiTextureSamplingShaders(
            this.driver.shaders,
            'mesh',
            VERT_SRC,
            FRAG_TEMPLATE,
            this.driver.textures.maxTextureCount,
        );

        this.programs = shaderInfos.map(i => {
            const program = this.driver.shaders.get(i.handle)!;

            const samplerUnits = new Int32Array(i.textureCount);
            samplerUnits.forEach((_, i) => (samplerUnits[i] = i));

            return {
                program,
                ...getUniformLocations(gl, program, {
                    projectionLocation: 'u_projection',
                    samplerLocation: 'u_sampler',
                }),
                samplerUnits,
            };
        });
    }

    uninitialize(): Promise<void> {
        this.programs.length = 0;
        this.batchIterator.clear();

        return Promise.resolve();
    }

    render(batches: readonly WGLMeshRenderBatch[], camera?: Camera2D) {
        const { gl, batchIterator } = this;

        const textureCount = roundUpPowerOfTwo(getMaxTextures(batches));

        this.prepareRenderPass(textureCount, camera);
        this.prepareShader(textureCount, camera);

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

            bindMultiTexture(
                gl,
                this.driver.textures,
                textureCount,
                batch.textures,
            );

            gl.drawArrays(gl.TRIANGLES, 0, batch.vertexCount);

            this.driver.diagnostics.triangles.count(batch.vertexCount / 3);
            this.driver.diagnostics.drawCalls.count();
        }
    }

    protected prepareRenderPass(textureCount: number, camera?: Camera2D) {
        const { gl } = this;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.depthMask(false);
    }

    protected prepareShader(textureCount: number, camera?: Camera2D) {
        assert(this.programs.length > 0, 'Renderer not initialized');

        const { gl } = this;

        const { program, projectionLocation, samplerLocation, samplerUnits } =
            this.programs[Math.log2(textureCount)]!;

        gl.useProgram(program);
        gl.uniform1iv(samplerLocation, samplerUnits);

        if (camera) {
            this.driver.projections.getClipProjection(camera, PROJECTION_MAT);
        } else {
            this.driver.projections.getViewportClipProjection(PROJECTION_MAT);
        }

        PROJECTION_MAT.copyTo3x2(PROJECTION_ARRAY);

        gl.uniformMatrix3x2fv(projectionLocation, false, PROJECTION_ARRAY);
    }

    protected initializeAttributes(buffer: WebGLBuffer) {
        const { gl } = this;

        gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);

        setVertexAttributes(
            gl,
            [
                // Pos
                {
                    size: 3,
                    type: 'float',
                },
                // UV
                {
                    size: 2,
                    type: 'float',
                },
                // Color
                {
                    size: 4,
                    type: 'unsignedByte',
                    normalize: true,
                },
                // Texture ID
                {
                    size: 1,
                    type: 'int',
                },
            ],
            { stride: BYTES_PER_VERTEX },
        );
    }
}
