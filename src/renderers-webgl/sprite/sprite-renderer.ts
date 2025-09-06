import { Mat2D, roundUpPowerOfTwo } from '../../math';
import { SPRITE_SIZES, SpriteBatchBuffers } from '../../renderers/sprite';
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
import FRAG_TEMPLATE_SRC from './sprite.template.frag?raw';
import VERT_SRC from './sprite.vert?raw';

/** @category Rendering - Sprites - WebGL */
export interface WGLSpriteRenderBatch {
    readonly size: number;

    readonly textureCount: number;
    readonly textures: readonly TextureHandle[];

    readonly storage?: SpriteBatchBuffers;
}

/** @category Rendering - Sprites - WebGL */
export interface WGLSpriteBatchRendererProgramData {
    program: WebGLProgram;
    projectionLocation: WebGLUniformLocation;
    samplerLocation: WebGLUniformLocation;
    samplerUnits: Int32Array;
}

const PROJECTION_MAT = Mat2D.identity();
const PROJECTION_ARRAY = new Float32Array(6);

/** @category Rendering - Sprites - WebGL */
export class WGLSpriteBatchRenderer implements RenderContextLifeCycleHandler {
    protected readonly gl: WebGL2RenderingContext;

    protected readonly batchIterator: WGLBatchIterator<
        WGLSpriteRenderBatch,
        VAOWithBuffers<SpriteBatchBuffers>
    >;

    protected programs: WGLSpriteBatchRendererProgramData[] = [];
    protected meshData?: { buffer: WebGLBuffer };

    constructor(protected readonly driver: WGLDriver) {
        this.gl = driver.gl;
        this.batchIterator = new WGLBatchIterator(this.gl);

        driver.addLifeCycleHandler(this);
    }

    async initialize() {
        const { gl } = this;

        const shaderInfos = await buildMultiTextureSamplingShaders(
            this.driver.shaders,
            'sprite',
            VERT_SRC,
            FRAG_TEMPLATE_SRC,
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

        this.meshData = {
            buffer: gl.createBuffer(),
        };

        gl.bindBuffer(gl.ARRAY_BUFFER, this.meshData.buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5]),
            gl.STATIC_DRAW,
        );
    }

    uninitialize(): Promise<void> {
        const { gl } = this;

        this.programs.length = 0;

        if (this.meshData) {
            gl.deleteBuffer(this.meshData.buffer);

            this.meshData = undefined;
        }

        this.batchIterator.clear();

        return Promise.resolve();
    }

    render(batches: readonly WGLSpriteRenderBatch[], camera?: Camera2D) {
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
                    }),
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

            gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, batch.size);

            this.driver.diagnostics.triangles.count(batch.size * 2);
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

        gl.bindBuffer(gl.ARRAY_BUFFER, this.meshData!.buffer);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        setVertexAttributes(
            gl,
            [
                // Mat 1
                {
                    size: 2,
                    type: 'float',
                },
                // Mat 2
                {
                    size: 2,
                    type: 'float',
                },
                // Mat 3
                {
                    size: 2,
                    type: 'float',
                },
                // Size
                {
                    size: 2,
                    type: 'float',
                },
                // Z
                {
                    size: 1,
                    type: 'float',
                },
                // Texture region
                {
                    size: 4,
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
            {
                index: 1,
                stride: SPRITE_SIZES.BYTES_PER_INSTANCE,
                divisor: 1,
            },
        );
    }
}
