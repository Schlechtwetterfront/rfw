import {
    arcAtDegrees,
    buildTriangulatedMesh,
    Camera2D,
    CanvasApp,
    Color,
    LineBatcher,
    LineObject,
    linePath,
    Material,
    MeshBatchEntry,
    MeshBatcher,
    MeshObject,
    TextureHandle,
    vec,
    Vertex,
    WGLDriver,
    WGLLineBatchRenderer,
    WGLMeshBatchRenderer,
    WGLRenderTarget,
} from '../../src';

const BACKGROUND_COLOR = Color.WHITE;
const TARGET_BACKGROUND_COLOR = Color.WHITE;

const DIMENSIONS = vec(220, 220);

const TARGET_MESH = buildTriangulatedMesh([
    new Vertex(vec(-220, 220), vec(0, 0)),
    new Vertex(vec(220, 220), vec(1, 0)),
    new Vertex(vec(220, -220), vec(1, 1)),
    new Vertex(vec(-220, -220), vec(0, 1)),
]);

const CIRCLE = linePath(
    arcAtDegrees(0, 0, 100, 0, 360, { interval: 10, intervalKind: 'distance' }),
).build();

function buildHand(base: number, length: number) {
    return buildTriangulatedMesh(
        Vertex.createVerticesFromPositions(
            vec(0, -base),
            vec(base, 0),
            vec(0, length),
            vec(-base, 0),
        ),
    );
}

export class RenderToTextureApp extends CanvasApp<WGLDriver> {
    private readonly meshRenderer = new WGLMeshBatchRenderer(this.driver);
    private readonly lineRenderer = new WGLLineBatchRenderer(this.driver);

    private readonly meshBatches = new MeshBatcher(this.changeTracker);
    private readonly clockLines = new LineBatcher(this.changeTracker);
    private readonly clockMeshes = new MeshBatcher<MeshObject>(
        this.changeTracker,
    );

    private readonly clockLineObject = new LineObject({
        points: CIRCLE,
        style: {
            color: Color.BLACK,
            thickness: 4,
        },
    });

    private minutesEntry?: MeshBatchEntry<MeshObject>;
    private hoursEntry?: MeshBatchEntry<MeshObject>;

    private targetTexture!: TextureHandle;

    private renderTarget!: WGLRenderTarget;

    private readonly zoomedCamera = new Camera2D();

    constructor(canvas: HTMLCanvasElement, driver: WGLDriver) {
        super(canvas, driver);

        canvas.addEventListener('mousemove', e => {
            const p = vec(e.offsetX, e.offsetY);

            this.driver.projections.projectDOMPointToScene(p, this.camera);

            const time =
                360 - (p.degrees < 90 ? p.degrees - 90 : 270 + p.degrees);
            const totalSeconds = ((12 * 60 * 60) / 360) * time;
            const totalMinutes = totalSeconds / 60;
            const minutes = totalMinutes % 60;
            const hours = totalMinutes / 60;

            this.minutesEntry!.object!.transform.degrees =
                -(minutes / 60) * 360;
            this.hoursEntry!.object!.transform.degrees = -(hours / 12) * 360;

            this.transforms.change(this.minutesEntry!.object!);
            this.transforms.change(this.hoursEntry!.object!);

            this.clockMeshes.change(this.minutesEntry!);
            this.clockMeshes.change(this.hoursEntry!);
        });
    }

    override async initialize(): Promise<void> {
        await super.initialize();

        this.camera.pan(200, -200);

        this.clockLines.setMaximums(64_000);
        this.clockMeshes.setMaximums(this.driver.textures.maxTextureCount);
        this.meshBatches.setMaximums(this.driver.textures.maxTextureCount);

        this.targetTexture = await this.driver.textures.addEmpty(DIMENSIONS, {
            filter: 'linear',
            wrap: 'clamp',
        });

        const minutes = new MeshObject({
            mesh: buildHand(8, 80),
            material: new Material(this.driver.textures.white, Color.BLACK),
        });

        const hours = new MeshObject({
            mesh: buildHand(8, 60),
            material: new Material(this.driver.textures.white, Color.BLACK),
        });

        this.minutesEntry = this.clockMeshes.add(minutes);
        this.hoursEntry = this.clockMeshes.add(hours);

        this.clockLines.add(this.clockLineObject);

        const renderTargetObject = new MeshObject({
            x: 316,
            y: -316,
            mesh: TARGET_MESH,
            material: new Material(this.targetTexture),
        });

        this.meshBatches.add(renderTargetObject);

        this.transforms.change(minutes);
        this.transforms.change(hours);
        this.transforms.change(this.clockLineObject);
        this.transforms.change(renderTargetObject);

        this.renderTarget = this.driver.createRenderTarget(this.targetTexture);
    }

    protected override render(): void {
        super.render();

        this.driver.useRenderTarget(this.renderTarget);

        this.driver.clear(TARGET_BACKGROUND_COLOR);

        const lines = this.clockLines.finalize();
        const clockMeshes = this.clockMeshes.finalize();

        this.lineRenderer.render(lines, this.zoomedCamera);
        this.meshRenderer.render(clockMeshes, this.zoomedCamera);

        this.driver.useRenderTarget('canvas');

        this.driver.clear(BACKGROUND_COLOR);

        this.lineRenderer.render(lines, this.camera);
        this.meshRenderer.render(clockMeshes, this.camera);

        this.meshRenderer.render(this.meshBatches.finalize(), this.camera);
    }
}
