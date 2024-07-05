import { Mat2D } from '../../math';
import { roundUpPowerOfTwo } from '../../math/util';
import { BYTES_PER_VERTEX } from '../../renderers/textured-mesh';
import { WGLBatchedRenderer } from '../../rendering-webgl/batched-renderer';
import { WGLDriver } from '../../rendering-webgl/driver';
import {
    bindMultiTexture,
    buildMultiTextureSamplingShaders,
    getUniformLocations,
} from '../../rendering-webgl/shaders';
import { setVertexAttributes } from '../../rendering-webgl/util/vertex-attributes';
import { RenderBatch } from '../../rendering/batching';
import { Camera2D } from '../../rendering/camera2d';
import { TextureHandle, getMaxTextures } from '../../rendering/textures';
import { assert } from '../../util/assert';
import FRAG_TEMPLATE from './textured-mesh-batch.template.frag?raw';
import VERT_SRC from './textured-mesh-batch.vert?raw';

export interface TexturedMeshRenderBatch extends RenderBatch {
    readonly vertexCount: number;

    readonly textureCount: number;
    readonly textures: readonly TextureHandle[];
}

export interface WGLTexturedMeshBatchRendererProgramData {
    program: WebGLProgram;
    projectionLocation: WebGLUniformLocation;
    samplerLocation: WebGLUniformLocation;
    samplerUnits: Int32Array;
}

const PROJECTION_MAT = Mat2D.identity();
const PROJECTION_ARRAY = new Float32Array(6);

export class WGLTexturedMeshBatchRenderer extends WGLBatchedRenderer<TexturedMeshRenderBatch> {
    protected programs: WGLTexturedMeshBatchRendererProgramData[] = [];

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

    override async uninitialize(): Promise<void> {
        await super.uninitialize();

        this.programs.length = 0;
    }

    render(batches: readonly TexturedMeshRenderBatch[], camera?: Camera2D) {
        const { gl } = this;

        const textureCount = roundUpPowerOfTwo(getMaxTextures(batches));

        this.prepareRenderPass(textureCount, camera);
        this.prepareShader(textureCount, camera);

        this.upload(batches, batch => {
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

    protected override initializeAttributes(buffers: WebGLBuffer[]) {
        assert(buffers.length === 1, 'Batched mesh renderer takes one buffer');

        const { gl } = this;

        gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers[0]!);

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
