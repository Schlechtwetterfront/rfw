import { Mat2D } from '../../math';
import { roundUpPowerOfTwo } from '../../math/util';
import { BYTES_PER_GLYPH_VERTEX } from '../../renderers/text';
import { WGLBatchedRenderer } from '../../rendering-webgl/batched-renderer';
import { WGLDriver } from '../../rendering-webgl/driver';
import {
    bindMultiTextureOneSampler,
    buildMultiTextureSamplingAndSizeShaders,
    getUniformLocations,
} from '../../rendering-webgl/shaders';
import { setSamplerParameters } from '../../rendering-webgl/textures';
import { setVertexAttributes } from '../../rendering-webgl/util/vertex-attributes';
import { RenderBatch } from '../../rendering/batching';
import { Camera2D } from '../../rendering/camera2d';
import { TextureHandle, getMaxTextures } from '../../rendering/textures';
import { assert } from '../../util/assert';
import FRAG_TEMPLATE from './text.template.frag?raw';
import VERT_SRC from './text.vert?raw';

interface TextRenderBatch extends RenderBatch {
    readonly glyphCount: number;

    readonly textureCount: number;
    readonly textures: readonly TextureHandle[];
}

interface ProgramData {
    program: WebGLProgram;
    projectionLocation: WebGLUniformLocation;
    samplerLocation: WebGLUniformLocation;
    samplerUnits: Int32Array;
}

const PROJECTION_MAT = Mat2D.identity();
const PROJECTION_ARRAY = new Float32Array(6);

export class WGLTextRenderer extends WGLBatchedRenderer<TextRenderBatch> {
    protected programs: ProgramData[] = [];
    protected sampler?: WebGLSampler;

    constructor(driver: WGLDriver) {
        super(driver);
    }

    override async initialize() {
        await super.initialize();

        const { gl } = this;

        const shaderInfos = await buildMultiTextureSamplingAndSizeShaders(
            this.driver.shaders,
            'text',
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

        this.sampler = gl.createSampler()!;

        setSamplerParameters(gl, this.sampler, {
            wrap: 'clamp',
            filter: 'linear',
        });
    }

    override async uninitialize(): Promise<void> {
        await super.uninitialize();

        const { gl } = this;

        this.programs.length = 0;

        if (this.sampler) {
            gl.deleteSampler(this.sampler);

            this.sampler = undefined;
        }
    }

    render(batches: readonly TextRenderBatch[], camera?: Camera2D) {
        const { gl } = this;

        const textureCount = roundUpPowerOfTwo(getMaxTextures(batches));

        this.prepareRenderPass(textureCount, camera);
        this.prepareShader(textureCount, camera);

        this.renderBatches(batches, batch => {
            bindMultiTextureOneSampler(
                gl,
                this.driver.textures,
                textureCount,
                batch.textures,
                this.sampler!,
            );

            gl.drawArrays(gl.TRIANGLES, 0, batch.glyphCount * 6);

            this.driver.diagnostics.triangles.count(batch.glyphCount * 2);
        });
    }

    protected prepareRenderPass(textureCount: number, camera?: Camera2D) {
        const { gl } = this;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
        gl.depthMask(false);
    }

    protected prepareShader(textureCount: number, camera?: Camera2D) {
        if (!this.sampler || !this.programs.length) {
            throw new Error('Renderer not initialized');
        }

        const { gl } = this;

        const { program, projectionLocation, samplerLocation, samplerUnits } =
            this.programs[Math.log2(textureCount)]!;

        gl.useProgram(program);
        gl.uniform1iv(samplerLocation, samplerUnits);

        this.driver.projections
            .getClipProjection(camera, PROJECTION_MAT)
            .copyTo3x2(PROJECTION_ARRAY);

        gl.uniformMatrix3x2fv(projectionLocation, false, PROJECTION_ARRAY);
    }

    protected override initializeAttributes(buffers: WebGLBuffer[]): void {
        assert(buffers.length === 1, 'Batched text rendere takes one buffer');

        const { gl } = this;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[0]!);

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
                // Screen pixel range
                {
                    size: 1,
                    type: 'float',
                },
                // Texture ID
                {
                    size: 1,
                    type: 'int',
                },
            ],
            { stride: BYTES_PER_GLYPH_VERTEX },
        );
    }
}
