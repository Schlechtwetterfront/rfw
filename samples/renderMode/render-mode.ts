import FONT_DATA from '../assets/NotoSans-Regular.json';
import FONT_TEX_URL from '../assets/NotoSans-Regular.png';

import { Color } from '../../src/colors';
import { vec, Vec2, Vec2Like } from '../../src/math';
import { Rect, RectLike } from '../../src/math/shapes';
import { LineBatcher } from '../../src/renderers/lines';
import { TextBatcher } from '../../src/renderers/text';
import {
    MeshBatcher,
    TexturedMaterial,
} from '../../src/renderers/textured-mesh';
import { WGLDriver } from '../../src/rendering-webgl';
import { Vertex } from '../../src/rendering/mesh';
import { buildTriangulatedMesh } from '../../src/rendering/mesh/earcut';
import { MeshObject, MeshOptions } from '../../src/scene';
import { TextObject } from '../../src/scene/text';
import { Font } from '../../src/text';
import { BMFont, createFontFromBMFont } from '../../src/text/bmfont';
import { QuadTree, QuadTreeEntry } from '../../src/util/quad-tree';
import { SampleApp } from '../shared';

const RECT_COLOR = new Color(1, 1, 1, 0.5);
const RECT_COLOR_INTERSECTED = new Color(0, 1, 0, 0.5);

const MESH = buildTriangulatedMesh([
    Vertex.fromCoordinates(0, 0),
    Vertex.fromCoordinates(0, 1),
    Vertex.fromCoordinates(1, 1),
    Vertex.fromCoordinates(1, 0),
]);

class RenderModeObject extends MeshObject implements QuadTreeEntry {
    private _highlighted = false;

    get highlighted() {
        return this._highlighted;
    }
    set highlighted(v: boolean) {
        this._highlighted = v;

        this.material.color.copyFrom(v ? RECT_COLOR_INTERSECTED : RECT_COLOR);
    }

    constructor(
        public bounds: Rect,
        options: MeshOptions,
    ) {
        super(options);
    }

    containsPoint(point: Vec2Like): boolean {
        return this.bounds.containsPoint(point);
    }

    intersectsRect(rect: RectLike): boolean {
        return this.bounds.intersectsRect(rect);
    }
}

export class RenderModeApp extends SampleApp {
    private readonly textBatches = new TextBatcher({
        maxTextureCount: this.driver.textures.maxTextureCount,
        changeTracker: this.changeTracker,
    });

    private readonly lineBatches = new LineBatcher({
        changeTracker: this.changeTracker,
    });

    private readonly meshBatches = new MeshBatcher({
        maxTextureCount: this.driver.textures.maxTextureCount,
        changeTracker: this.changeTracker,
    });

    private quadTree: QuadTree<RenderModeObject>;

    private entries: RenderModeObject[] = [];

    private font!: Font;

    private mouse = new Rect(0, 0, 24, 24);
    private sceneMouse = Vec2.zero();

    private renderCount = 0;

    constructor(
        private readonly bounds: Rect,
        private readonly text: boolean,
        canvas: HTMLCanvasElement,
        driver: WGLDriver,
    ) {
        super(canvas, driver, 'onChange');

        this.quadTree = new QuadTree<RenderModeObject>(
            this.bounds.clone(),
            4,
            4,
        );

        canvas.addEventListener('mousemove', e => {
            this.updateMouse(e.offsetX, e.offsetY);
        });
    }

    private updateMouse(x: number, y: number) {
        this.mouse.copyPositionFrom(
            this.driver.projections.projectDOMPointToViewport(vec(x, y)),
        );

        this.sceneMouse.copyFrom(this.mouse);

        this.driver.projections.projectViewportPointToScene(
            this.sceneMouse,
            this.camera,
        );
    }

    override async initialize() {
        await super.initialize();

        const fontTex = await this.textures.addFromURL(FONT_TEX_URL);

        this.font = createFontFromBMFont(FONT_DATA as BMFont, [fontTex]);

        if (this.text) {
            const title = new TextObject({
                font: this.font,
                style: { size: 32 },
                text: 'Render Mode Sample',
                position: new Vec2(-600, 400),
                anchor: new Vec2(0, 1),
                z: 10,
            });

            this.textBatches.add(title);
            this.transforms.change(title);

            const subtitle = new TextObject({
                font: this.font,
                style: { size: 16 },
                text: 'Hover over rects to recolor them and trigger a render',
                position: new Vec2(-600 + title.layout.width + 24, 400),
                anchor: new Vec2(0, 1),
                z: 10,
            });

            this.textBatches.add(subtitle);
            this.transforms.change(subtitle);
        }

        this.tickers.add(() => {
            const overlaps = this.quadTree.filter(
                e => e.containsPoint(this.sceneMouse),
                r => r.containsPoint(this.sceneMouse),
            );

            for (let i = 0; i < this.entries.length; i++) {
                const entry = this.entries[i]!;

                if (entry.highlighted !== overlaps.has(entry)) {
                    entry.highlighted = overlaps.has(entry);

                    this.meshBatches.change(entry);
                }
            }
        });

        this.addMultiple(100);
    }

    protected override getDiagText(): string {
        return super.getDiagText(false) + ` | ${this.renderCount} renders`;
    }

    override render(): void {
        this.renderCount++;

        super.render();

        this.renderers.line.render(this.lineBatches.finalize(), this.camera);
        this.renderers.mesh.render(this.meshBatches.finalize(), this.camera);
        this.renderers.text.render(this.textBatches.finalize(), this.camera);
    }

    addMultiple(count: number): void {
        for (let i = 0; i < count; i++) {
            const x =
                Math.random() * this.quadTree.bounds.width +
                this.quadTree.bounds.x;
            const y =
                Math.random() * this.quadTree.bounds.height +
                this.quadTree.bounds.y;

            this.add(x, y);
        }
    }

    add(x: number, y: number) {
        const d = Math.random() * 12 + 4;

        const pos = new Vec2(Math.floor(x), Math.floor(y));

        const rect = Rect.fromPoint(pos, 2 * d, 2 * d);

        const obj = new RenderModeObject(rect, {
            mesh: MESH,
            material: new TexturedMaterial(
                this.textures.white,
                RECT_COLOR.clone(),
            ),
            position: pos,
            scale: 2 * d,
        });

        this.quadTree.add(obj);
        this.entries.push(obj);

        this.transforms.change(obj);
        this.meshBatches.add(obj);
    }
}
