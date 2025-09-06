import FONT_DATA from '../assets/NotoSans-Regular.json';
import FONT_TEX_URL from '../assets/NotoSans-Regular.png';

import {
    BMFont,
    buildTriangulatedMesh,
    Color,
    createFontFromBMFont,
    Font,
    LineBatcher,
    MeshBatchEntry,
    MeshBatcher,
    MeshObject,
    MeshOptions,
    QuadTree,
    QuadTreeEntry,
    Rect,
    RectLike,
    TextBatcher,
    TextObject,
    TexturedMaterial,
    vec,
    Vec2,
    Vec2Like,
    Vertex,
    WGLDriver,
} from '../../src';
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

    entry?: MeshBatchEntry;

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
    private readonly textBatcher = new TextBatcher(this.changeTracker);
    private readonly lineBatcher = new LineBatcher(this.changeTracker);
    private readonly meshBatcher = new MeshBatcher(this.changeTracker);

    private quadTree: QuadTree<RenderModeObject>;

    private entities: RenderModeObject[] = [];

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

        this.textBatcher.setMaximums(this.driver.textures.maxTextureCount);
        this.lineBatcher.setMaximums(64_000);
        this.meshBatcher.setMaximums(this.driver.textures.maxTextureCount);

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

            this.textBatcher.add(title);
            this.transforms.change(title);

            const subtitle = new TextObject({
                font: this.font,
                style: { size: 16 },
                text: 'Hover over rects to recolor them and trigger a render',
                position: new Vec2(-600 + title.layout.width + 24, 400),
                anchor: new Vec2(0, 1),
                z: 10,
            });

            this.textBatcher.add(subtitle);
            this.transforms.change(subtitle);
        }

        this.tickers.add(() => {
            const overlaps = this.quadTree.filter(
                e => e.containsPoint(this.sceneMouse),
                r => r.containsPoint(this.sceneMouse),
            );

            for (let i = 0; i < this.entities.length; i++) {
                const entity = this.entities[i]!;

                if (entity.highlighted !== overlaps.has(entity)) {
                    entity.highlighted = overlaps.has(entity);

                    this.meshBatcher.change(entity.entry!);
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

        this.renderers.line.render(this.lineBatcher.finalize(), this.camera);
        this.renderers.mesh.render(this.meshBatcher.finalize(), this.camera);
        this.renderers.text.render(this.textBatcher.finalize(), this.camera);
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

        const entity = new RenderModeObject(rect, {
            mesh: MESH,
            material: new TexturedMaterial(
                this.textures.white,
                RECT_COLOR.clone(),
            ),
            position: pos,
            scale: 2 * d,
        });

        this.quadTree.add(entity);
        this.entities.push(entity);

        this.transforms.change(entity);
        entity.entry = this.meshBatcher.add(entity);
    }
}
