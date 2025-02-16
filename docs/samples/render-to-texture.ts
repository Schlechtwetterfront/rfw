import {
    arcAtDegrees,
    buildTriangulatedMesh,
    CanvasApp,
    Color,
    LineBatcher,
    LineObject,
    linePath,
    MeshBatcher,
    MeshObject,
    pointAt,
    TexturedMaterial,
    TextureHandle,
    vec,
    Vertex,
    WGLDriver,
    WGLLineRenderer,
    WGLRenderTarget,
    WGLTexturedMeshBatchRenderer,
} from '../../src';

const BACKGROUND_COLOR = Color.fromHexString('#111');
const TARGET_BACKGROUND_COLOR = Color.fromHexString('#444');

const DIMENSIONS = vec(420, 420);

const TARGET_MESH = buildTriangulatedMesh([
    new Vertex(vec(-100, 100), vec(0, 0)),
    new Vertex(vec(100, 100), vec(1, 0)),
    new Vertex(vec(100, -100), vec(1, 1)),
    new Vertex(vec(-100, -100), vec(0, 1)),
]);

const LINE_PATH = linePath(
    pointAt(0, 0),
    arcAtDegrees(0, 0, 200, 0, 360, { interval: 10, intervalKind: 'distance' }),
).build();

export class RenderToTextureApp extends CanvasApp<WGLDriver> {
    private readonly meshRenderer = new WGLTexturedMeshBatchRenderer(
        this.driver,
    );
    private readonly lineRenderer = new WGLLineRenderer(this.driver);

    private readonly meshBatches = new MeshBatcher({
        maxTextureCount: this.driver.textures.maxTextureCount,
        changeTracker: this.changeTracker,
    });
    private readonly lineBatches = new LineBatcher({
        changeTracker: this.changeTracker,
    });

    private readonly lineObject = new LineObject({
        points: LINE_PATH,
        style: {
            color: Color.white(),
            thickness: 2,
        },
    });

    private targetTexture!: TextureHandle;

    private targetObject!: MeshObject;

    private renderTarget!: WGLRenderTarget;

    constructor(canvas: HTMLCanvasElement, driver: WGLDriver) {
        super(canvas, driver, 'always');

        canvas.addEventListener('mousemove', e => {
            const p = vec(e.offsetX, e.offsetY);

            this.driver.projections.projectDOMPointToScene(p, this.camera);

            this.lineObject.transform.radians = p.radians;

            this.transforms.change(this.lineObject);
            this.lineBatches.change(this.lineObject);
        });
    }

    override async initialize(): Promise<void> {
        await super.initialize();

        this.targetTexture = await this.driver.textures.addEmpty(DIMENSIONS, {
            filter: 'linear',
            wrap: 'clamp',
        });

        this.targetObject = new MeshObject({
            x: 200,
            mesh: TARGET_MESH,
            material: new TexturedMaterial(this.targetTexture),
        });

        this.transforms.change(this.lineObject);
        this.transforms.change(this.targetObject);

        this.meshBatches.add(this.targetObject);
        this.lineBatches.add(this.lineObject);

        this.renderTarget = this.driver.createRenderTarget(this.targetTexture);
    }

    protected override render(): void {
        super.render();

        this.driver.useRenderTarget(this.renderTarget);

        this.driver.clear(TARGET_BACKGROUND_COLOR);

        const lines = this.lineBatches.finalize();

        this.lineRenderer.render(lines, this.camera);

        this.driver.useRenderTarget('canvas');

        this.driver.clear(BACKGROUND_COLOR);

        this.lineRenderer.render(lines, this.camera);

        this.meshRenderer.render(this.meshBatches.finalize(), this.camera);
    }
}
