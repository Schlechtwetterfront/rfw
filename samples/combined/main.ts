import '../assets/styles.css';

import FONT_DATA from '../assets/NotoSans-Regular.json';
import FONT_TEX_URL from '../assets/NotoSans-Regular.png';

import { Vec2 } from '../../src/math';
import { Rect } from '../../src/math/shapes';
import { LineBatcher } from '../../src/renderers/lines';
import { TextBatcher } from '../../src/renderers/text';
import {
    MeshBatcher,
    TexturedMaterial,
} from '../../src/renderers/textured-mesh';
import { WGLDriver } from '../../src/rendering-webgl';
import { Mesh } from '../../src/rendering/mesh';
import { LineObject } from '../../src/scene/line';
import { MeshObject } from '../../src/scene/mesh';
import { TextObject } from '../../src/scene/text';
import { BMFont, createFontFromBMFont } from '../../src/text/bmfont';
import { usePanAndZoom } from '../interaction';
import { SampleApp, buildAMesh, setupWGL } from '../shared';

// const LOREM = `lag`;
const LOREM = `Nulla tempora fugit omnis sit voluptatem. Temporibus ipsum dolore autem beatae. Ex voluptatem placeat vel et. Quidem sed officiis ad eveniet dolorem. Et qui vero vitae sit iste numquam non. Autem sapiente deleniti ut optio vel qui repellat.

Dignissimos perferendis odio a fugiat debitis. Hic ducimus porro consectetur. Et impedit omnis et eos. Deserunt omnis perferendis odio sequi ab sit ullam beatae.

Quae sed veniam iure vel. Voluptatibus enim id modi ratione atque. Et unde quos voluptatum magni amet voluptatum est. Perferendis possimus voluptatem hic quia. Maxime ut quis molestiae sunt non ipsum. Voluptate sit itaque optio quasi accusamus non voluptates.

Delectus aspernatur ut et voluptatem quas ut ducimus sit. Iure totam aut ratione porro. Quis ut nisi consectetur laborum ipsum ut. Repellendus dolore sint eum delectus quibusdam laborum officiis rem. Quod consequuntur consequatur necessitatibus ut mollitia. Accusantium impedit aliquid eos.

Occaecati non ut incidunt tempore. Laboriosam nulla eos necessitatibus rerum commodi velit. Maiores distinctio odit sint impedit eligendi facilis fugiat. Odio sunt sint facilis quis esse possimus. Accusantium architecto modi et est laboriosam neque.`;

const BOUNDS = new Rect(-600, -400, 1200, 800);

const Z_UI = 10;

const FIGURE_ORIGIN = Vec2.from(BOUNDS).add(432, 16);
const FIGURE_WIDTH = BOUNDS.width - 432 - 16;
const FIGURE_HEIGHT = 200;
const FIGURE2_ORIGIN = FIGURE_ORIGIN.clone().add(0, FIGURE_HEIGHT + 48);

class App extends SampleApp {
    private readonly globalMeshBatches = new MeshBatcher<MeshObject>({
        maxTextureCount: this.driver.textures.maxTextureCount,
        changeTracker: this.changeTracker,
    });
    private readonly figureMeshBatches = new MeshBatcher<MeshObject>({
        maxTextureCount: this.driver.textures.maxTextureCount,
        changeTracker: this.changeTracker,
    });

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

    private lorem!: TextObject;
    private numbers!: TextObject;

    private graphLine!: LineObject;
    private graphPoints!: Vec2[];

    private aMesh!: Mesh;

    constructor(canvas: HTMLCanvasElement, driver: WGLDriver) {
        super(canvas, driver);

        canvas.addEventListener('click', e => {
            if (!e.ctrlKey) {
                return;
            }

            const pos = new Vec2(e.clientX, e.clientY);

            // projectViewportToScene(pos, this.camera);

            const a = new MeshObject({
                mesh: this.aMesh,
                material: new TexturedMaterial(this.driver.textures.white),
                position: pos,
                scale: 5,
            });

            this.transforms.change(a);
            this.globalMeshBatches.add(a);
        });
    }

    override async initialize() {
        await super.initialize();

        const fontTex = await this.textures.addFromURL(FONT_TEX_URL);

        const font = createFontFromBMFont(FONT_DATA as BMFont, [fontTex]);

        this.aMesh = buildAMesh();

        let rotatingA: MeshObject;

        // Mesh
        {
            // Rotating A
            {
                rotatingA = new MeshObject({
                    mesh: this.aMesh,
                    material: new TexturedMaterial(this.driver.textures.white),
                    x: 64,
                    y: 80,
                    z: Z_UI,
                    scale: 5,
                });

                this.globalMeshBatches.add(rotatingA);
                this.transforms.change(rotatingA);
            }

            // Figure meshes
            {
                const cols = FIGURE_WIDTH / 40 + 1;
                const rows = FIGURE_HEIGHT / 40 + 1;

                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const a = new MeshObject({
                            mesh: this.aMesh,
                            material: new TexturedMaterial(
                                this.driver.textures.white,
                            ),
                            position: FIGURE2_ORIGIN.clone().add(
                                c * 40,
                                r * 40,
                            ),
                            scale: 2,
                        });

                        this.figureMeshBatches.add(a);
                        this.transforms.change(a);
                    }
                }
            }
        }

        // Lines
        {
            const bounds = new LineObject({
                points: [
                    Vec2.from(BOUNDS),
                    Vec2.from(BOUNDS).add(BOUNDS.width, 0),
                    Vec2.from(BOUNDS).add(BOUNDS.width, BOUNDS.height),
                    Vec2.from(BOUNDS).add(0, BOUNDS.height),
                ],
                closed: true,
            });

            this.lineBatches.add(bounds);
            this.transforms.change(bounds);

            const figure = new LineObject({
                points: [
                    FIGURE_ORIGIN,
                    FIGURE_ORIGIN.clone().add(FIGURE_WIDTH, 0),
                    FIGURE_ORIGIN.clone().add(FIGURE_WIDTH, FIGURE_HEIGHT),
                    FIGURE_ORIGIN.clone().add(0, FIGURE_HEIGHT),
                ],
                closed: true,
                style: { dashSize: 4, gapSize: 4 },
            });

            this.lineBatches.add(figure);
            this.transforms.change(figure);

            this.graphPoints = [...new Array(480).keys()].map(
                i => new Vec2((i / 480) * FIGURE_WIDTH, 0),
            );

            this.graphLine = new LineObject({
                position: FIGURE_ORIGIN.clone().add(0, FIGURE_HEIGHT / 2),
                points: this.graphPoints,
            });

            this.lineBatches.add(this.graphLine);
            this.transforms.change(this.graphLine);

            const figure2 = new LineObject({
                points: [
                    FIGURE2_ORIGIN,
                    FIGURE2_ORIGIN.clone().add(FIGURE_WIDTH, 0),
                    FIGURE2_ORIGIN.clone().add(FIGURE_WIDTH, FIGURE_HEIGHT),
                    FIGURE2_ORIGIN.clone().add(0, FIGURE_HEIGHT),
                ],
                closed: true,
                style: { dashSize: 4, gapSize: 4 },
            });

            this.lineBatches.add(figure2);
            this.transforms.change(figure2);
        }

        // Text
        {
            // Other
            {
                this.lorem = new TextObject({
                    font,
                    text: LOREM,
                    position: Vec2.from(BOUNDS).add(16),
                    width: 400,
                    style: { size: 16 },
                });

                this.textBatches.add(this.lorem);
                this.transforms.change(this.lorem);

                const caption1 = new TextObject({
                    font,
                    text: 'Et unde quos voluptatum magni amet voluptatum est',
                    position: Vec2.from(FIGURE_ORIGIN).add(
                        0,
                        FIGURE_HEIGHT + 4,
                    ),
                    width: FIGURE_WIDTH,
                    style: { size: 14 },
                });

                this.textBatches.add(caption1);
                this.transforms.change(caption1);

                const caption2 = new TextObject({
                    font,
                    text: 'Iure totam aut ratione porro',
                    position: Vec2.from(FIGURE2_ORIGIN).add(
                        0,
                        FIGURE_HEIGHT + 4,
                    ),
                    width: FIGURE_WIDTH,
                    style: { size: 14 },
                });

                this.textBatches.add(caption2);
                this.transforms.change(caption2);

                const centered = new TextObject({
                    font,
                    text: 'Laboriosam nulla eos necessitatibus rerum commodi velit. Maiores distinctio odit sint impedit eligendi facilis fugiat. Odio sunt sint facilis quis esse possimus. Accusantium architecto modi et est laboriosam neque.',
                    position: Vec2.from(caption2.transform.position).add(
                        FIGURE_WIDTH / 2,
                        64,
                    ),
                    width: 600,
                    style: { size: 24, align: 'center' },
                    anchor: new Vec2(0.5, 0),
                });

                this.textBatches.add(centered);
                this.transforms.change(centered);

                this.numbers = new TextObject({
                    font,
                    text: '',
                    position: new Vec2(BOUNDS.right - 8, BOUNDS.bottom - 8),
                    width: FIGURE_WIDTH,
                    style: {
                        size: 32,
                        align: 'end',
                    },
                    anchor: new Vec2(1, 1),
                });

                this.textBatches.add(this.numbers);
                this.transforms.change(this.numbers);
            }
        }

        {
            let offset = 0;
            let digits = 0;

            this.tickers.add(({ elapsedMilliseconds: milliseconds }) => {
                const newDegrees =
                    rotatingA.transform.degrees + (milliseconds / 5000) * 360;

                rotatingA.transform.degrees = newDegrees % 360;
                this.globalMeshBatches.change(rotatingA);
                this.transforms.change(rotatingA);

                offset =
                    (offset + (milliseconds / 32) * Math.PI) %
                    (2 * Math.PI * 20);

                for (let i = 0; i < 480; i++) {
                    const r = (i + offset) / 20;
                    const y = (Math.sin(r) * (FIGURE_HEIGHT - 8)) / 2;

                    this.graphPoints[i]!.y = y;
                }

                this.graphLine.points = this.graphPoints;

                this.lineBatches.change(this.graphLine);

                digits = (digits + milliseconds / 1000) % 10;

                this.numbers.text = '123456789'.slice(0, Math.floor(digits));
                this.textBatches.change(this.numbers);
            });
        }
    }

    override render(): void {
        super.render();

        this.renderers.mesh.render(
            this.figureMeshBatches.finalize(),

            this.camera,
        );

        this.renderers.mesh.render(this.globalMeshBatches.finalize());

        this.renderers.text.render(this.textBatches.finalize(), this.camera);
        this.renderers.text.render(this.globalTextBatches.finalize());

        this.renderers.line.render(this.lineBatches.finalize(), this.camera);
    }
}

void main();

async function main() {
    const { driver, canvasEl, diagEl } = await setupWGL();

    const app = new App(canvasEl, driver);

    app.addDiagTicker(diagEl);

    usePanAndZoom(canvasEl, app.camera);

    await app.initializeAndStart();
}
