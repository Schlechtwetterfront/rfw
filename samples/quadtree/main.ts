/* eslint-disable no-constant-condition */
import '../assets/styles.css';

import FONT_DATA from '../assets/NotoSans-Regular.json';
import FONT_TEX_URL from '../assets/NotoSans-Regular.png';

import { Color } from '../../src/colors';
import { Vec2 } from '../../src/math';
import { Rect } from '../../src/math/shapes';
import {
    buildRectPoints,
    buildSquarePoints,
} from '../../src/math/shapes/builder';
import { LineBatcher } from '../../src/renderers/lines';
import { TextBatcher } from '../../src/renderers/text';
import { WGLDriver } from '../../src/rendering-webgl';
import { LineObject } from '../../src/scene/line';
import { TextObject } from '../../src/scene/text';
import { Font } from '../../src/text';
import { BMFont, createFontFromBMFont } from '../../src/text/bmfont';
import { TimeSampler } from '../../src/util/measuring';
import { Quad, QuadTree } from '../../src/util/quad-tree';
import { usePanAndZoom } from '../interaction';
import { SampleApp, setupWGL } from '../shared';

const TEMP_VEC = Vec2.zero();
const RECT_COLOR = new Color(1, 1, 1);
const RECT_COLOR_INTERSECTED = new Color(0, 1, 0);

class QuadObject {
    constructor(
        readonly line: LineObject,
        readonly text: TextObject,
    ) {}
}

class QuadTreeApp extends SampleApp {
    private readonly textBatches = new TextBatcher({
        maxTextureCount: this.driver.textures.maxTextureCount,
        changeTracker: this.changeTracker,
    });
    private readonly globalTextBatches = new TextBatcher({
        maxTextureCount: this.driver.textures.maxTextureCount,
        changeTracker: this.changeTracker,
    });

    private readonly lineBatches = new LineBatcher({
        changeTracker: this.changeTracker,
    });
    private readonly globalLineBatches = new LineBatcher({
        changeTracker: this.changeTracker,
    });

    private font!: Font;

    private quadTreeEntries = new Map<Rect, LineObject>();
    private quadEntities = new Map<Quad, QuadObject>();
    private quadTree = new QuadTree<Rect>(
        { x: -600, y: -400, width: 1200, height: 800 },
        4,
        4,
    );
    private cursor!: LineObject;

    private mouse = new Rect(0, 0, 24, 24);
    private sceneMouse = Rect.zero();

    private intersectionTime = new TimeSampler('intersections');

    constructor(canvas: HTMLCanvasElement, driver: WGLDriver) {
        super(canvas, driver, 'always');

        canvas.addEventListener('mousemove', e => {
            this.updateMouse(e.clientX, e.clientY);
        });

        canvas.addEventListener('click', e => {
            if (e.ctrlKey) {
                const pos = this.driver.projections.projectPointToScene(
                    new Vec2(e.clientX, e.clientY),
                    this.camera,
                );

                this.addRect(pos.x, pos.y);
            }

            if (e.altKey) {
                this.updateMouse(e.clientX, e.clientY);

                const intersections = this.quadTree.intersections(
                    this.sceneMouse,
                );

                for (const entry of intersections.values) {
                    this.quadTree.delete(entry);

                    const line = this.quadTreeEntries.get(entry);

                    if (line) {
                        this.quadTreeEntries.delete(entry);
                        this.lineBatches.delete(line);
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
        this.mouse.x = x - 12;
        this.mouse.y = y - 12;

        this.sceneMouse.copyFrom(this.mouse);

        this.driver.projections.projectRectToScene(
            this.sceneMouse,
            this.camera,
        );
    }

    override async initialize() {
        await super.initialize();

        const fontTex = await this.textures.addFromURL(FONT_TEX_URL);

        this.font = createFontFromBMFont(FONT_DATA as BMFont, [fontTex]);

        this.cursor = new LineObject({
            points: buildSquarePoints(0, 0, 24),
            closed: true,
            style: { color: new Color(1, 1, 0), thickness: 2 },
        });
        this.globalLineBatches.add(this.cursor);

        {
            const title = new TextObject({
                font: this.font,
                style: { size: 32 },
                text: 'Quad tree sample',
                position: new Vec2(-600, 400),
                anchor: new Vec2(0, 1),
            });

            this.textBatches.add(title);
            this.transforms.change(title);

            const subtitle = new TextObject({
                font: this.font,
                style: { size: 16 },
                text: 'Use CTRL+Click to add, ALT+Click to remove',
                position: new Vec2(-600 + title.layout.width + 24, 400),
                anchor: new Vec2(0, 1),
            });

            this.textBatches.add(subtitle);
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

        for (const quad of this.quadTree.quads()) {
            let object = this.quadEntities.get(quad);

            if (!object) {
                const pos = TEMP_VEC.copyFrom(quad.bounds);

                object = new QuadObject(
                    new LineObject({
                        points: buildRectPoints(
                            pos.x,
                            pos.y,
                            quad.bounds.width,
                            quad.bounds.height,
                        ),
                        closed: true,
                    }),
                    new TextObject({
                        position: pos.clone().add(8, 0),
                        text: quad.entryCount.toString(),
                        font: this.font,
                        z: 10,
                    }),
                );
                this.quadEntities.set(quad, object);

                this.lineBatches.add(object.line);
                this.textBatches.add(object.text);
                this.transforms.change(object.line);
                this.transforms.change(object.text);
            }

            const newText = quad.isSubdivided()
                ? ''
                : quad.entryCount.toString();

            if (newText !== object.text.text) {
                object.text.text = newText;
                this.textBatches.change(object.text);
            }
        }

        if (true) {
            this.quadTreeEntries.forEach(l => {
                if (
                    l.style.color.equalsColorWithAlpha(RECT_COLOR_INTERSECTED)
                ) {
                    l.style.color.copyFrom(RECT_COLOR);
                    this.lineBatches.change(l);
                }
            });

            this.intersectionTime.start();
            const intersects = this.quadTree.intersections(this.sceneMouse);
            this.intersectionTime.finish();

            intersects.values.forEach(r => {
                const line = this.quadTreeEntries.get(r)!;
                line.style.color.copyFrom(RECT_COLOR_INTERSECTED);
                this.lineBatches.change(line);
            });
        }

        this.cursor.transform.position.copyFrom(this.mouse);
        this.transforms.change(this.cursor);
        this.globalLineBatches.change(this.cursor);
    }

    override render(): void {
        super.render();

        this.renderers.line.render(this.lineBatches.finalize(), this.camera);
        this.renderers.line.render(this.globalLineBatches.finalize());
        this.renderers.text.render(this.textBatches.finalize(), this.camera);
        this.renderers.text.render(this.globalTextBatches.finalize());
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

        const quad = new LineObject({
            points: buildSquarePoints(0, 0, 2 * d),
            closed: true,
            position: pos,
            style: { thickness: 2 },
        });

        this.quadTreeEntries.set(rect, quad);

        this.transforms.change(quad);
        this.lineBatches.add(quad);
    }
}

void main();

async function main() {
    const { driver, canvasEl, diagEl } = await setupWGL();

    const formEl = document.getElementById('form') as HTMLFormElement;
    const inputEl = document.getElementById('count') as HTMLInputElement;

    const app = new QuadTreeApp(canvasEl, driver);

    app.addDiagTicker(diagEl);

    formEl.addEventListener('submit', e => {
        e.preventDefault();

        const count = parseInt(inputEl.value);

        if (!isNaN(count) && count) {
            app.addRects(count);
        }
    });

    usePanAndZoom(canvasEl, app.camera);

    await app.initializeAndStart();
}
