import { Mat2D, roundUpPowerOfTwo } from '../../math';
import {
    MESH_COLOR_SIZES,
    MeshColorBatchBuffers,
} from '../../renderers/textured-mesh-color';
import { RenderContextLifeCycleHandler } from '../../rendering';
import {
    createVAOAndBuffers,
    setVertexAttributes,
    uploadByteBuffer,
    VAOWithBuffers,
    WGLBatchIterator,
    WGLDriver,
} from '../../rendering-webgl';
import {
    bindMultiTexture,
    buildMultiTextureSamplingShaders,
    getUniformLocations,
} from '../../rendering-webgl/shaders';
import { Camera2D } from '../../rendering/camera2d';
import { getMaxTextures, TextureHandle } from '../../rendering/textures';
import { assert } from '../../util';
import { WGLTexturedMeshBatchRendererProgramData } from './textured-mesh-batch-renderer';
import FRAG_TEMPLATE from './textured-mesh-batch.template.frag?raw';
import VERT_SRC from './textured-mesh-batch.vert?raw';

/** @category Rendering - Textured Mesh - WebGL */
export interface WGLTexturedMeshColorRenderBatch {
    readonly vertexCount: number;

    readonly textureCount: number;
    readonly textures: readonly TextureHandle[];

    readonly storage?: MeshColorBatchBuffers;
}

const PROJECTION_MAT = Mat2D.identity();
const PROJECTION_ARRAY = new Float32Array(6);

/** @category Rendering - Textured Mesh - WebGL */
export class WGLTexturedMeshColorBatchRenderer
    implements RenderContextLifeCycleHandler
{
    protected readonly gl: WebGL2RenderingContext;

    protected readonly batchIterator: WGLBatchIterator<
        WGLTexturedMeshColorRenderBatch,
        VAOWithBuffers<MeshColorBatchBuffers>
    >;

    protected programs: WGLTexturedMeshBatchRendererProgramData[] = [];

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

    render(
        batches: readonly WGLTexturedMeshColorRenderBatch[],
        camera?: Camera2D,
    ) {
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
                    createVAOAndBuffers(gl, {
                        buffer: batch.storage.buffer,
                        colorBuffer: batch.storage.colorBuffer,
                    }),
                );
            }

            if (handle.initializeAttributes) {
                this.initializeAttributes(
                    handle.vaoAndBuffers!.buffer,
                    handle.vaoAndBuffers!.colorBuffer,
                );
            }

            if (handle.upload) {
                uploadByteBuffer(
                    gl,
                    batch.storage.buffer,
                    handle.vaoAndBuffers!.buffer,
                );

                uploadByteBuffer(
                    gl,
                    batch.storage.colorBuffer,
                    handle.vaoAndBuffers!.colorBuffer,
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

    protected initializeAttributes(
        buffer: WebGLBuffer,
        colorBuffer: WebGLBuffer,
    ) {
        const { gl } = this;

        gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);

        setVertexAttributes(
            gl,
            [
                // Pos
                {
                    index: 0,
                    size: 3,
                    type: 'float',
                },
                // UV
                {
                    index: 1,
                    size: 2,
                    type: 'float',
                },
                // Texture ID
                {
                    index: 3,
                    size: 1,
                    type: 'int',
                },
            ],
            { stride: MESH_COLOR_SIZES.BYTES_PER_VERTEX_MAIN_BUFFER },
        );

        gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);

        setVertexAttributes(
            gl,
            [
                // Color
                {
                    index: 2,
                    size: 4,
                    type: 'unsignedByte',
                    normalize: true,
                },
            ],
            { stride: MESH_COLOR_SIZES.BYTES_PER_VERTEX_COLOR_BUFFER },
        );
    }
}
