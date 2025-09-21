import {
    arcAtDegrees,
    BatchEntry,
    buildRectPoints,
    buildSquarePoints,
    CanvasApp,
    Circle,
    Color,
    LineBatcher,
    LineLike,
    LineObject,
    linePath,
    QuadTree,
    Rect,
    TimeSampler,
    vec,
    Vec2,
    WGLDriver,
    WGLLineBatchRenderer,
} from '../../src';

const TEMP_VEC = Vec2.zero();

const BACKGROUND_COLOR = Color.fromHexString('#ffffffff');
const RECT_COLOR = Color.fromHexString('#43b427ff');
const RECT_COLOR_INTERSECTED = Color.fromHexString('#ff2478ff');
const QUAD_COLOR = Color.fromHexString('#f78c28ff');

interface Entity {
    line: LineObject;
    entry?: BatchEntry<LineLike>;
}

export class QuadTreeApp extends CanvasApp<WGLDriver> {
    private readonly lineRenderer = new WGLLineBatchRenderer(this.driver);

    private readonly lineBatcher = new LineBatcher(this.changeTracker);
    private readonly globalLineBatcher = new LineBatcher(this.changeTracker);

    private quadTreeEntries = new Map<Rect, Entity>();
    private quadEntities: Entity[] = [];
    private quadTree: QuadTree<Rect>;
    private cursor!: Entity;

    private viewportMouse = vec();
    private sceneMouse = new Circle(0, 0, 24);

    private intersectionTime = new TimeSampler('intersections');

    private readonly bounds = new Rect(-300, -150, 600, 300);

    constructor(canvas: HTMLCanvasElement, driver: WGLDriver) {
        super(canvas, driver);

        this.quadTree = new QuadTree<Rect>(this.bounds.clone(), 4, 4);

        canvas.addEventListener('mousemove', e => {
            this.updateMouse(e.offsetX, e.offsetY);
        });

        canvas.addEventListener('click', e => {
            if (e.ctrlKey && !e.altKey) {
                const pos = this.driver.projections.projectDOMPointToScene(
                    new Vec2(e.offsetX, e.offsetY),
                    this.camera,
                );

                this.addRect(pos.x, pos.y);
            }

            const del = !e.ctrlKey && e.altKey;
            const delSpatial = e.ctrlKey && e.altKey;

            if (del || delSpatial) {
                this.updateMouse(e.offsetX, e.offsetY);

                const intersections = this.intersections(this.sceneMouse);

                for (const intersection of intersections.values) {
                    if (del) this.quadTree.delete(intersection, true);
                    else if (delSpatial)
                        this.quadTree.deleteSpatial(intersection, true);

                    const entity = this.quadTreeEntries.get(intersection);

                    if (entity) {
                        this.quadTreeEntries.delete(intersection);
                        this.lineBatcher.delete(entity.entry!);
                    }
                }
            }
        });
    }

    override async initialize() {
        await super.initialize();

        this.lineBatcher.setMaximums(64_000);
        this.globalLineBatcher.setMaximums(64_000);

        this.cursor = {
            line: new LineObject({
                points: linePath(arcAtDegrees(0, 0, 24)).build(),
                style: { color: Color.BLACK, thickness: 1 },
            }),
        };
        this.cursor.entry = this.globalLineBatcher.add(this.cursor.line);
    }

    protected override tick(elapsed: number): void {
        super.tick(elapsed);

        this.quadEntities.forEach(o => this.lineBatcher.delete(o.entry!));
        this.quadEntities.length = 0;

        for (const quad of this.quadTree.quads()) {
            const pos = TEMP_VEC.copyFrom(quad.bounds);

            const entity = {
                line: new LineObject({
                    points: buildRectPoints(
                        pos.x,
                        pos.y,
                        quad.bounds.width,
                        quad.bounds.height,
                    ),
                    closed: true,
                    style: {
                        color: QUAD_COLOR,
                        thickness: 2,
                    },
                }),
            } as Entity;

            this.quadEntities.push(entity);

            entity.entry = this.lineBatcher.add(entity.line);

            this.transforms.change(entity.line);
        }

        this.quadTreeEntries.forEach(e => {
            e.line.style.color = RECT_COLOR;
            this.lineBatcher.change(e.entry!);
        });

        this.intersectionTime.start();
        const intersects = this.intersections(this.sceneMouse);
        this.intersectionTime.finish();

        intersects.values.forEach(r => {
            const entity = this.quadTreeEntries.get(r)!;
            entity.line.style.color = RECT_COLOR_INTERSECTED;
            this.lineBatcher.change(entity.entry!);
        });

        this.cursor.line.transform.position.copyFrom(this.viewportMouse);
        this.transforms.change(this.cursor.line);
        this.globalLineBatcher.change(this.cursor.entry!);
    }

    override render(): void {
        super.render();

        this.driver.useRenderTarget('canvas');

        this.driver.clear(BACKGROUND_COLOR);

        this.lineRenderer.render(this.lineBatcher.finalize(), this.camera);
        this.lineRenderer.render(this.globalLineBatcher.finalize());
    }

    private updateMouse(x: number, y: number) {
        const point = this.driver.projections.projectDOMPointToViewport(
            vec(x, y),
        );

        this.viewportMouse.copyFrom(point);

        this.driver.projections.projectViewportPointToScene(point, this.camera);

        this.sceneMouse.copyCenterFrom(point);
    }

    private intersections(circle: Circle) {
        return this.quadTree.filter(
            e => circle.intersectsRect(e),
            q => circle.intersectsRect(q),
        );
    }

    addRects(count: number): void {
        for (let i = 0; i < count; i++) {
            const x =
                Math.random() * this.quadTree.bounds.width +
                this.quadTree.bounds.x;
            const y =
                Math.random() * this.quadTree.bounds.height +
                this.quadTree.bounds.y;

            this.addRect(x, y);
        }
    }

    addRect(x: number, y: number) {
        const d = Math.random() * 12 + 4;

        const pos = new Vec2(Math.floor(x - d), Math.floor(y - d));

        const rect = Rect.fromPoint(pos, 2 * d, 2 * d);
        this.quadTree.add(rect);

        const entity = {
            line: new LineObject({
                points: buildSquarePoints(0, 0, 2 * d),
                closed: true,
                position: pos,
                style: { thickness: 2, color: RECT_COLOR },
            }),
        } as Entity;

        this.quadTreeEntries.set(rect, entity);

        this.transforms.change(entity.line);
        entity.entry = this.lineBatcher.add(entity.line);
    }
}
