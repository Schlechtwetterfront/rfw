import { WGLLineRenderer } from '../src/renderers-webgl/lines';
import { WGLTextRenderer } from '../src/renderers-webgl/text';
import { WGLTexturedMeshBatchRenderer } from '../src/renderers-webgl/textured-mesh';
import { WGLDriver } from '../src/rendering-webgl';

export class DefaultWGLRenderBundle {
    readonly mesh: WGLTexturedMeshBatchRenderer;
    readonly text: WGLTextRenderer;
    readonly line: WGLLineRenderer;

    constructor(driver: WGLDriver) {
        this.mesh = new WGLTexturedMeshBatchRenderer(driver);

        this.text = new WGLTextRenderer(driver);

        this.line = new WGLLineRenderer(driver);
    }
}
