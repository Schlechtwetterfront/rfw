import { RenderContextLifeCycleHandler } from '../rendering';
import { RenderBatch } from '../rendering/batching';
import { WGLDriver } from './driver';
import { VAOWithBuffers, createVAOAndBuffers } from './util/vao-with-buffers';

export abstract class WGLBatchedRenderer<B extends RenderBatch = RenderBatch>
    implements RenderContextLifeCycleHandler
{
    protected readonly gl: WebGL2RenderingContext;
    protected batchData = new WeakMap<B, VAOWithBuffers>();

    constructor(protected readonly driver: WGLDriver) {
        this.gl = driver.gl;

        driver.addLifeCycleHandler(this);
    }

    initialize(): Promise<void> {
        return Promise.resolve();
    }

    uninitialize(): Promise<void> {
        this.batchData = new WeakMap();

        return Promise.resolve();
    }

    protected renderBatches(
        batches: readonly B[],
        renderBatch?: (batch: B) => void,
    ) {
        const { gl } = this;

        const batchCount = batches.length;

        for (let i = 0; i < batchCount; i++) {
            const batch = batches[i]!;

            let data = this.batchData.get(batch);

            let initObjects = false;
            let uploadedData = false;

            if (!data) {
                initObjects = true;

                // WebGL buffers will be created directly with the data
                uploadedData = true;

                data = createVAOAndBuffers(this.gl, batch.storage.buffers);

                this.batchData.set(batch, data);
            }

            gl.bindVertexArray(data.vao);

            if (initObjects) {
                this.initializeAttributes(data.buffers);
            }

            if (!uploadedData) {
                const bufferCount = batch.storage.buffers.length;

                for (let i = 0; i < bufferCount; i++) {
                    const buffer = batch.storage.buffers[i]!;

                    if (buffer.changedByteLength === 0) {
                        continue;
                    }

                    gl.bindBuffer(gl.ARRAY_BUFFER, data.buffers[i]!);

                    gl.bufferSubData(
                        gl.ARRAY_BUFFER,
                        buffer.changedFromByte,
                        buffer.arrayBufferView,
                        buffer.changedFromByte,
                        buffer.changedByteLength,
                    );
                }
            }

            renderBatch?.(batch);

            gl.bindVertexArray(null);

            this.driver.diagnostics.drawCalls.count();
        }
    }

    protected renderBatch(batch: B): void {}

    protected abstract initializeAttributes(buffers: WebGLBuffer[]): void;
}
