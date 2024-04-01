import { roundUpPowerOfTwo } from '../../math/util';
import { BYTES_PER_GLYPH_VERTEX } from '../../renderers/text';
import { WGLBatchedRenderer } from '../../rendering-webgl/batched-renderer';
import { WGLDriver } from '../../rendering-webgl/driver';
import {
    bindMultiTextureOneSampler,
    buildMultiTextureSamplingAndSizeShaders,
} from '../../rendering-webgl/shaders';
import { RenderBatch } from '../../rendering/batching';
import { Camera2D } from '../../rendering/camera2d';
import { getUseOnceClipProjectionArray } from '../../rendering/projection';
import { TextureHandle, getMaxTextures } from '../../rendering/textures';
import { assert, assertDefined } from '../../util/assert';
import { BYTE_SIZE, FLOAT_SIZE } from '../../util/sizes';
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

export class WGLTextRenderer extends WGLBatchedRenderer<TextRenderBatch> {
    private programs: ProgramData[] = [];
    private sampler?: WebGLSampler;

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
            const projectionLocation = gl.getUniformLocation(
                program,
                'u_projection',
            );

            assertDefined(
                projectionLocation,
                'No location for projection uniform',
            );

            const samplerLocation = gl.getUniformLocation(program, 'u_sampler');

            assertDefined(samplerLocation, 'No location for sampler uniform');

            const samplerUnits = new Int32Array(i.textureCount);
            samplerUnits.forEach((_, i) => (samplerUnits[i] = i));

            return {
                program,
                projectionLocation,
                samplerLocation,
                samplerUnits,
            };
        });

        this.sampler = gl.createSampler()!;

        gl.samplerParameteri(this.sampler, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.samplerParameteri(this.sampler, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.samplerParameteri(this.sampler, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.samplerParameteri(this.sampler, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
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

        gl.uniformMatrix3x2fv(
            projectionLocation,
            false,
            getUseOnceClipProjectionArray(this.driver.dimensions, camera),
        );
    }

    protected override initializeAttributes(buffers: WebGLBuffer[]): void {
        assert(buffers.length === 1, 'Batched text rendere takes one buffer');

        const { gl } = this;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[0]!);

        // Pos
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(
            0,
            3,
            gl.FLOAT,
            false,
            BYTES_PER_GLYPH_VERTEX,
            0,
        );

        // UV
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(
            1,
            2,
            gl.FLOAT,
            false,
            BYTES_PER_GLYPH_VERTEX,
            3 * FLOAT_SIZE,
        );

        // Color
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(
            2,
            4,
            gl.UNSIGNED_BYTE,
            true,
            BYTES_PER_GLYPH_VERTEX,
            3 * FLOAT_SIZE + 2 * FLOAT_SIZE,
        );

        // Screen pixel range
        gl.enableVertexAttribArray(3);
        gl.vertexAttribPointer(
            3,
            1,
            gl.FLOAT,
            false,
            BYTES_PER_GLYPH_VERTEX,
            3 * FLOAT_SIZE + 2 * FLOAT_SIZE + 4 * BYTE_SIZE,
        );

        // Texture ID
        gl.enableVertexAttribArray(4);
        gl.vertexAttribIPointer(
            4,
            1,
            gl.INT,
            BYTES_PER_GLYPH_VERTEX,
            3 * FLOAT_SIZE + 2 * FLOAT_SIZE + 4 * BYTE_SIZE + FLOAT_SIZE,
        );
    }
}
