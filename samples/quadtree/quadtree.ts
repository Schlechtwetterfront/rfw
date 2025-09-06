/* eslint-disable no-constant-condition */
import FONT_DATA from '../assets/NotoSans-Regular.json';
import FONT_TEX_URL from '../assets/NotoSans-Regular.png';

import {
    BatchEntry,
    BMFont,
    buildRectPoints,
    buildSquarePoints,
    Color,
    createFontFromBMFont,
    Font,
    LineBatcher,
    LineLike,
    LineObject,
    QuadTree,
    Rect,
    TextBatcher,
    TextObject,
    TimeSampler,
    vec,
    Vec2,
    WGLDriver,
} from '../../src';
import { SampleApp } from '../shared';

const TEMP_VEC = Vec2.zero();
const RECT_COLOR = new Color(1, 1, 1);
const RECT_COLOR_INTERSECTED = new Color(0, 1, 0);

interface Entity {
    line: LineObject;
    entry?: BatchEntry<LineLike>;
}

export class QuadTreeApp extends SampleApp {
    private readonly textBatcher = new TextBatcher(this.changeTracker);

    private readonly lineBatcher = new LineBatcher(this.changeTracker);
    private readonly globalLineBatcher = new LineBatcher(this.changeTracker);

    private font!: Font;

    private quadTreeEntries = new Map<Rect, Entity>();
    private quadEntities: Entity[] = [];
    private quadTree: QuadTree<Rect>;
    private cursor!: Entity;

    private viewportMouse = new Rect(0, 0, 24, 24);
    private sceneMouse = Rect.zero();

    private intersectionTime = new TimeSampler('intersections');

    constructor(
        private readonly bounds: Rect,
        private readonly text: boolean,
        canvas: HTMLCanvasElement,
        driver: WGLDriver,
    ) {
        super(canvas, driver, 'always');

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

            if (!e.ctrlKey && e.altKey) {
                this.updateMouse(e.offsetX, e.offsetY);

                const intersections = this.quadTree.intersections(
                    this.sceneMouse,
                );

                for (const intersection of intersections.values) {
                    this.quadTree.delete(intersection, true);

                    const entity = this.quadTreeEntries.get(intersection);

                    if (entity) {
                        this.quadTreeEntries.delete(intersection);
                        this.lineBatcher.delete(entity.entry!);
                    }
                }
            } else if (e.ctrlKey && e.altKey) {
                this.updateMouse(e.offsetX, e.offsetY);

                const intersections = this.quadTree.intersections(
                    this.sceneMouse,
                );

                for (const intersection of intersections.values) {
                    this.quadTree.deleteSpatial(intersection, true);

                    const entity = this.quadTreeEntries.get(intersection);

                    if (entity) {
                        this.quadTreeEntries.delete(intersection);
                        this.lineBatcher.delete(entity.entry!);
                    }
                }
            }
        });

        canvas.addEventListener('keyup', e => {
            if (e.key === 'r') {
                this.camera.tiltDegrees(90);
            }
        });
    }

    private updateMouse(x: number, y: number) {
        const viewportMouse = this.driver.projections.projectDOMPointToViewport(
            vec(x, y),
        );

        this.viewportMouse.copyCenterFrom(viewportMouse);

        this.sceneMouse.copyFrom(this.viewportMouse);

        this.driver.projections.projectViewportRectToScene(
            this.sceneMouse,
            this.camera,
        );
    }

    override async initialize() {
        await super.initialize();

        this.textBatcher.setMaximums(this.driver.textures.maxTextureCount);
        this.lineBatcher.setMaximums(64_000);
        this.globalLineBatcher.setMaximums(64_000);

        const fontTex = await this.textures.addFromURL(FONT_TEX_URL);

        this.font = createFontFromBMFont(FONT_DATA as BMFont, [fontTex]);

        this.cursor = {
            line: new LineObject({
                points: buildSquarePoints(0, 0, 24),
                closed: true,
                style: { color: new Color(1, 1, 0), thickness: 2 },
            }),
        };
        this.cursor.entry = this.globalLineBatcher.add(this.cursor.line);

        if (this.text) {
            const title = new TextObject({
                font: this.font,
                style: { size: 32 },
                text: 'Quad tree sample',
                position: vec(this.bounds.x, this.bounds.top),
                anchor: vec(0, 1),
            });
            this.textBatcher.add(title);
            this.transforms.change(title);
            const subtitle = new TextObject({
                font: this.font,
                style: { size: 16 },
                text: 'Use CTRL+Click to add, ALT+Click to remove',
                position: vec(-600 + title.layout.width + 24, 400),
                anchor: vec(0, 1),
            });
            this.textBatcher.add(subtitle);
            this.transforms.change(subtitle);
        }
    }

    protected override getDiagText(): string {
        return (
            super.getDiagText() +
            ` | ${this.intersectionTime.average.toFixed(3)}ms intersection test`
        );
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
                }),
            } as Entity;

            this.quadEntities.push(entity);

            entity.entry = this.lineBatcher.add(entity.line);

            this.transforms.change(entity.line);
        }

        if (true) {
            this.quadTreeEntries.forEach(e => {
                if (
                    e.line.style.color.equalsColorWithAlpha(
                        RECT_COLOR_INTERSECTED,
                    )
                ) {
                    e.line.style.color.copyFrom(RECT_COLOR);
                    this.lineBatcher.change(e.entry!);
                }
            });

            this.intersectionTime.start();
            const intersects = this.quadTree.intersections(this.sceneMouse);
            this.intersectionTime.finish();

            intersects.values.forEach(r => {
                const entity = this.quadTreeEntries.get(r)!;
                entity.line.style.color.copyFrom(RECT_COLOR_INTERSECTED);
                this.lineBatcher.change(entity.entry!);
            });
        }

        this.cursor.line.transform.position.copyFrom(this.viewportMouse);
        this.transforms.change(this.cursor.line);
        this.globalLineBatcher.change(this.cursor.entry!);
    }

    override render(): void {
        super.render();

        this.renderers.line.render(this.lineBatcher.finalize(), this.camera);
        this.renderers.line.render(this.globalLineBatcher.finalize());
        this.renderers.text.render(this.textBatcher.finalize(), this.camera);
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
                style: { thickness: 2 },
            }),
        } as Entity;

        this.quadTreeEntries.set(rect, entity);

        this.transforms.change(entity.line);
        entity.entry = this.lineBatcher.add(entity.line);
    }
}
