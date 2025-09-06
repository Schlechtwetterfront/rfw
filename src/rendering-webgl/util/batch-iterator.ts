import { WithVAO } from './vao';

/** @category Rendering - WebGL */
export class WGLBatchIterationHandle<
    B extends object,
    D extends WithVAO = WithVAO,
> {
    batch?: B;
    vaoAndBuffers?: D;
    initializeAttributes = false;
    upload = true;

    constructor(
        private readonly gl: WebGL2RenderingContext,
        private readonly batchDataMap: WeakMap<B, D>,
    ) {}

    setVAOAndBuffers(vaoAndBuffers: D, uploadedData = true): void {
        const { batch, gl, batchDataMap } = this;

        this.vaoAndBuffers = vaoAndBuffers;

        gl.bindVertexArray(vaoAndBuffers.vao);

        this.initializeAttributes = true;
        this.upload = !uploadedData;

        if (batch) {
            batchDataMap.set(batch, vaoAndBuffers);
        }
    }

    reset(): void {
        this.batch = undefined;
        this.vaoAndBuffers = undefined;
        this.initializeAttributes = false;
        this.upload = true;
    }
}

/** @category Rendering - WebGL */
export class WGLBatchIterator<B extends object, D extends WithVAO = WithVAO> {
    private batchData = new WeakMap<B, D>();
    private handle?: WGLBatchIterationHandle<B, D>;

    private batches?: readonly B[];
    private index = -1;

    constructor(private readonly gl: WebGL2RenderingContext) {}

    getHandle(): WGLBatchIterationHandle<B, D> {
        if (!this.handle) {
            this.handle = new WGLBatchIterationHandle(this.gl, this.batchData);
        }

        return this.handle;
    }

    restart(batches: readonly B[]): void {
        this.batches = batches;

        this.index = -1;
    }

    next(
        handle: WGLBatchIterationHandle<B, D>,
    ): handle is WGLBatchIterationHandle<B, D> & { batch: B } {
        const { batches, gl } = this;

        handle.reset();

        if (!batches) {
            throw new Error('No batches');
        }

        gl.bindVertexArray(null);

        const index = ++this.index;

        if (index >= batches.length) {
            this.batches = undefined;
            this.index = -1;

            return false;
        }

        const batch = batches[index]!;
        handle.batch = batch;

        const vaoAndBuffers = this.batchData.get(batch);

        handle.vaoAndBuffers = vaoAndBuffers;
        handle.initializeAttributes = !vaoAndBuffers;

        if (vaoAndBuffers) {
            gl.bindVertexArray(vaoAndBuffers.vao);
        }

        return true;
    }

    clear(): void {
        this.batchData = new WeakMap();
    }
}
