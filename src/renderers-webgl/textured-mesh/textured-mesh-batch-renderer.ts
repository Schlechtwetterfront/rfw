import { roundUpPowerOfTwo } from '../../math/util';
import { BYTES_PER_VERTEX } from '../../renderers/textured-mesh';
import { WGLBatchedRenderer } from '../../rendering-webgl/batched-renderer';
import { WGLDriver } from '../../rendering-webgl/driver';
import {
    bindMultiTexture,
    buildMultiTextureSamplingShaders,
} from '../../rendering-webgl/shaders';
import { RenderBatch } from '../../rendering/batching';
import { Camera2D } from '../../rendering/camera2d';
import { getUseOnceClipProjectionArray } from '../../rendering/projection';
import { TextureHandle, getMaxTextures } from '../../rendering/textures';
import { assert, assertDefined } from '../../util/assert';
import { BYTE_SIZE, FLOAT_SIZE } from '../../util/sizes';
import FRAG_TEMPLATE from './textured-mesh-batch.template.frag?raw';
import VERT_SRC from './textured-mesh-batch.vert?raw';

interface TexturedMeshRenderBatch extends RenderBatch {
    readonly vertexCount: number;

    readonly textureCount: number;
    readonly textures: readonly TextureHandle[];
}

interface ProgramData {
    program: WebGLProgram;
    projectionLocation: WebGLUniformLocation;
    samplerLocation: WebGLUniformLocation;
    samplerUnits: Int32Array;
}

export class WGLTexturedMeshBatchRenderer extends WGLBatchedRenderer<TexturedMeshRenderBatch> {
    private programs: ProgramData[] = [];

    constructor(driver: WGLDriver) {
        super(driver);
    }

    override async initialize() {
        await super.initialize();

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
    }

    override async uninitialize(): Promise<void> {
        await super.uninitialize();

        this.programs.length = 0;
    }

    render(batches: readonly TexturedMeshRenderBatch[], camera?: Camera2D) {
        const { gl } = this;

        const textureCount = roundUpPowerOfTwo(getMaxTextures(batches));

        this.prepareRenderPass(textureCount, camera);
        this.prepareShader(textureCount, camera);

        this.renderBatches(batches, batch => {
            bindMultiTexture(
                gl,
                this.driver.textures,
                textureCount,
                batch.textures,
            );

            gl.drawArrays(gl.TRIANGLES, 0, batch.vertexCount);

            this.driver.diagnostics.triangles.count(batch.vertexCount / 3);
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
        assert(this.programs.length > 0, 'Renderer not initialized');

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

    protected override initializeAttributes(buffers: WebGLBuffer[]) {
        assert(buffers.length === 1, 'Batched mesh renderer takes one buffer');

        const { gl } = this;

        gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers[0]!);

        // Pos
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, BYTES_PER_VERTEX, 0);

        // UV
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(
            1,
            2,
            gl.FLOAT,
            false,
            BYTES_PER_VERTEX,
            3 * FLOAT_SIZE,
        );

        // Color
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(
            2,
            4,
            gl.UNSIGNED_BYTE,
            true,
            BYTES_PER_VERTEX,
            3 * FLOAT_SIZE + 2 * FLOAT_SIZE,
        );

        // Texture ID
        gl.enableVertexAttribArray(3);
        gl.vertexAttribIPointer(
            3,
            1,
            gl.INT,
            BYTES_PER_VERTEX,
            3 * FLOAT_SIZE + 2 * FLOAT_SIZE + 4 * BYTE_SIZE,
        );
    }
}
