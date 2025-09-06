import { spawnInGrid } from '../../samples/generation';
import { buildAMesh } from '../../samples/shared';
import {
    CanvasApp,
    Color,
    MeshColorBatchEntry,
    MeshColorBatcher,
    MeshObject,
    TexturedMaterial,
    WGLDriver,
    WGLTexturedMeshColorBatchRenderer,
} from '../../src';

const BACKGROUND_COLOR = Color.fromHexString('#111');

interface Entity {
    mesh: MeshObject;
    entry?: MeshColorBatchEntry;
}

export class MultipleBuffersApp extends CanvasApp<WGLDriver> {
    private readonly meshRenderer = new WGLTexturedMeshColorBatchRenderer(
        this.driver,
    );

    private readonly meshBatches = new MeshColorBatcher(this.changeTracker);

    constructor(canvas: HTMLCanvasElement, driver: WGLDriver) {
        super(canvas, driver, 'always');
    }

    override async initialize(): Promise<void> {
        await super.initialize();

        this.meshBatches.setMaximums(this.driver.textures.maxTextureCount);

        const meshEntities: Entity[] = [];

        const mesh = buildAMesh();

        const total = spawnInGrid(60, 60, 688, 344, (i, x, y, tt) => {
            const ms = {
                mesh: new MeshObject({
                    mesh,
                    material: new TexturedMaterial(
                        this.driver.textures.white,
                        new Color(0.8, 0.8, 0.8),
                    ),
                    x: x - 304,
                    y: y - 117,
                    scale: 2,
                }),
            } as Entity;

            meshEntities.push(ms);
        });

        meshEntities.forEach(e => {
            e.entry = this.meshBatches.add(e.mesh);
            this.transforms.change(e.mesh);
        });

        this.tickers.add(() => {
            const index = Math.floor(Math.random() * total);

            const m = meshEntities[index]!;

            m.mesh.material.color.setHSV(
                Math.random() * 360,
                1 - Math.random() * 0.5,
                1 - Math.random() * 0.5,
            );

            m.entry!.onlyColorChanged = true;

            this.meshBatches.change(m.entry!);
        });
    }

    protected override render(): void {
        super.render();

        this.driver.useRenderTarget('canvas');

        this.driver.clear(BACKGROUND_COLOR);

        this.meshRenderer.render(this.meshBatches.finalize(), this.camera);
    }
}
