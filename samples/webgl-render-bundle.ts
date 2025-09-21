import { WGLLineBatchRenderer } from '../src/renderers-webgl/lines';
import { WGLMeshBatchRenderer } from '../src/renderers-webgl/mesh';
import { WGLTextRenderer } from '../src/renderers-webgl/text';
import { WGLDriver } from '../src/rendering-webgl';

export class DefaultWGLRenderBundle {
    readonly mesh: WGLMeshBatchRenderer;
    readonly text: WGLTextRenderer;
    readonly line: WGLLineBatchRenderer;

    constructor(driver: WGLDriver) {
        this.mesh = new WGLMeshBatchRenderer(driver);

        this.text = new WGLTextRenderer(driver);

        this.line = new WGLLineBatchRenderer(driver);
    }
}
