import {
    arcAtDegrees,
    CanvasApp,
    Color,
    EntryOf,
    line,
    LineBatcher,
    LineObject,
    linePath,
    LineStyle,
    pointAt,
    WGLDriver,
    WGLLineBatchRenderer,
} from '../../src';

const BACKGROUND_COLOR = Color.fromHexString('#040841');
const PATTERN_COLOR = Color.fromHexString('#d4dcddff');
const PATTERN_COLOR_2 = Color.fromHexString('#d4dcdd55');

const LEN = 16;

const CORNER_PATTERN = linePath(
    pointAt(0, 0),
    line(LEN, 0),
    line(0, LEN * 2),
    line(LEN * 7, 0),
    line(0, LEN * 2),
    line(-LEN * 6, 0),
    line(0, -LEN * 4),
    line(LEN, 0),
    line(0, LEN * 3),
    line(LEN * 4, 0),
    line(0, LEN * 4.5),
).build();

const CORNER_PATTERNS = [
    { x: 204, y: -160, sx: 1, sy: 1, r: 0 },
    { x: 332, y: -32, sx: -1, sy: 1, r: -90 },
    { x: -204, y: 160, sx: -1, sy: -1, r: 0 },
    { x: -332, y: 32, sx: 1, sy: -1, r: -90 },
];

const CENTER_PATTERN_1 = linePath(
    pointAt(-LEN * 4.5, LEN * 0.5),
    line(LEN * 9, 0),
    line(0, -LEN),
    line(-LEN * 9, 0),
    line(0, LEN),
).build();

const CENTER_PATTERN_2 = linePath(
    pointAt(-LEN * 3.5, LEN * 3.5),
    line(LEN, 0),
    line(0, -LEN * 7),
    line(-LEN, 0),
    line(0, LEN),
    line(LEN * 7, 0),
    line(0, -LEN),
    line(-LEN, 0),
    line(0, LEN * 7),
    line(LEN, 0),
    line(0, -LEN),
    line(-LEN * 7, 0),
    line(0, LEN),
).build();

const CENTER_PATTERN_3 = linePath(
    pointAt(-LEN * 4.5, LEN * 4.5),
    line(LEN * 3, 0),
    line(0, -LEN * 9),
    line(-LEN * 3, 0),
    line(0, LEN * 3),
    line(LEN * 9, 0),
    line(0, -LEN * 3),
    line(-LEN * 3, 0),
    line(0, LEN * 9),
    line(LEN * 3, 0),
    line(0, -LEN * 3),
    line(-LEN * 9, 0),
    line(0, LEN * 3),
).build();

const CIRCLE_STYLE: Partial<LineStyle> = {
    thickness: 4,
    dashSize: 4,
    gapSize: 8,
    color: PATTERN_COLOR_2,
};

export class LineApp extends CanvasApp<WGLDriver> {
    private readonly lineRenderer = new WGLLineBatchRenderer(this.driver);

    private readonly lineBatcher = new LineBatcher(this.changeTracker);

    private readonly patterns: {
        entry: EntryOf<LineBatcher>;
        line: LineObject;
    }[] = [];

    override async initialize(): Promise<void> {
        await super.initialize();

        const add = (line: LineObject) => {
            const entry = this.lineBatcher.add(line);

            this.transforms.change(line);

            this.patterns.push({ line, entry });
        };

        this.lineBatcher.setMaximums(64_000);

        for (const pattern of CORNER_PATTERNS) {
            const line = new LineObject({
                x: pattern.x,
                y: pattern.y,
                degrees: pattern.r,
                points: CORNER_PATTERN,
                style: { thickness: 4, color: PATTERN_COLOR },
            });

            line.transform.scale.set(pattern.sx, pattern.sy);

            add(line);
        }

        add(
            new LineObject({
                degrees: 45,
                points: CENTER_PATTERN_1,
                closed: true,
                style: { thickness: 4, color: PATTERN_COLOR },
            }),
        );

        add(
            new LineObject({
                degrees: -45,
                points: CENTER_PATTERN_1,
                closed: true,
                style: { thickness: 4, color: PATTERN_COLOR },
            }),
        );

        add(
            new LineObject({
                degrees: 45,
                points: CENTER_PATTERN_2,
                closed: true,
                style: { thickness: 4, color: PATTERN_COLOR },
            }),
        );

        add(
            new LineObject({
                degrees: -45,
                points: CENTER_PATTERN_2,
                closed: true,
                style: { thickness: 4, color: PATTERN_COLOR },
            }),
        );

        add(
            new LineObject({
                degrees: 45,
                points: CENTER_PATTERN_3,
                closed: true,
                style: { thickness: 4, color: PATTERN_COLOR },
            }),
        );

        add(
            new LineObject({
                degrees: -45,
                points: CENTER_PATTERN_3,
                closed: true,
                style: { thickness: 4, color: PATTERN_COLOR },
            }),
        );

        add(
            new LineObject({
                points: linePath(arcAtDegrees(600, -172, 480, 180, 90)).build(),
                style: {
                    ...CIRCLE_STYLE,
                },
            }),
        );

        add(
            new LineObject({
                points: linePath(arcAtDegrees(600, -172, 460, 180, 90)).build(),
                style: {
                    ...CIRCLE_STYLE,
                },
            }),
        );

        add(
            new LineObject({
                points: linePath(arcAtDegrees(600, -172, 440, 180, 90)).build(),
                style: {
                    ...CIRCLE_STYLE,
                },
            }),
        );

        add(
            new LineObject({
                points: linePath(arcAtDegrees(0, 220, 480, 180, 270)).build(),
                style: {
                    ...CIRCLE_STYLE,
                },
            }),
        );

        add(
            new LineObject({
                points: linePath(arcAtDegrees(0, 220, 460, 180, 270)).build(),
                style: {
                    ...CIRCLE_STYLE,
                },
            }),
        );

        add(
            new LineObject({
                points: linePath(arcAtDegrees(0, 220, 440, 180, 270)).build(),
                style: {
                    ...CIRCLE_STYLE,
                },
            }),
        );
    }

    protected override render(): void {
        super.render();

        this.driver.useRenderTarget('canvas');

        this.driver.clear(BACKGROUND_COLOR);

        this.lineRenderer.render(this.lineBatcher.finalize(), this.camera);
    }
}
