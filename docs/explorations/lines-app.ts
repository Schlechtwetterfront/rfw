import {
    BatchEntry,
    CanvasApp,
    Color,
    LineBatcher,
    LineLike,
    LineObject,
    vec,
    Vec2,
    WGLDriver,
    WGLLineBatchRenderer,
} from '../../src';

const BACKGROUND_COLOR = Color.white();

export class LinesApp extends CanvasApp<WGLDriver> {
    private readonly lineRenderer = new WGLLineBatchRenderer(this.driver);

    private readonly lineBatches = new LineBatcher(this.changeTracker);

    private line!: LineObject;
    private lineEntry!: BatchEntry<LineLike>;

    override async initialize(): Promise<void> {
        await super.initialize();

        this.line = new LineObject({
            points: [vec(), vec(), vec(), vec()],
            style: {
                thickness: 2,
                color: Color.black(),
                dashSize: 4,
                gapSize: 8,
            },
        });

        this.transforms.change(this.line);
        this.lineEntry = this.lineBatches.add(this.line);
    }

    protected override render(): void {
        super.render();

        this.driver.useRenderTarget('canvas');

        this.driver.clear(BACKGROUND_COLOR);

        this.lineRenderer.render(this.lineBatches.finalize());
    }

    set(
        points: [Vec2, Vec2, Vec2, Vec2],
        alignment: number,
        thickness: number,
    ): void {
        this.line.points = points.map(p =>
            vec(p.x, this.driver.context.dimensions.y - p.y),
        );
        this.line.style = { alignment, thickness };

        this.lineBatches.change(this.lineEntry);
    }
}
