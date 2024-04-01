import '../assets/styles.css';

import BUNNY_WHITE_TEX_URL from '../assets/bunny-white.png';
import BUNNY_TEX_URL from '../assets/bunny.png';

import { Vec2 } from '../../src/math';
import { Rect } from '../../src/math/shapes';
import { lerp } from '../../src/math/util';
import { TextBatcher } from '../../src/renderers/text';
import {
    MeshBatcher,
    TexturedMaterial,
} from '../../src/renderers/textured-mesh';
import { WGLDriver } from '../../src/rendering-webgl';
import { Mesh, Vertex } from '../../src/rendering/mesh';
import { buildTriangulatedMesh } from '../../src/rendering/mesh/earcut';
import { TextureHandle } from '../../src/rendering/textures';
import { Group, MeshObject, MeshOptions } from '../../src/scene';
import { usePanAndZoom } from '../interaction';
import { SampleApp, setupWGL } from '../shared';

const BOUNDS = new Rect(-600, -400, 1200, 800);
const GRAVITY = 50;
const BUNNY_DEQUEUE_PER_SECOND = 10_000;
const SQUISH_DURATION = 0.66;
const SQUISH_SCALE = 0.5;

class BunnyObject extends MeshObject {
    readonly movementPerSecond: Vec2;
    readonly remainingSquishDuration = new Vec2(
        SQUISH_DURATION,
        SQUISH_DURATION,
    );

    constructor(options: MeshOptions) {
        super(options);

        this.movementPerSecond = new Vec2(
            Math.random() * 400 - 200,
            40 + Math.random() * 160,
        );
    }
}

class BunnyMarkApp extends SampleApp {
    private readonly globalTextBatches = new TextBatcher({
        maxTextureCount: this.driver.textures.maxTextureCount,
        changeTracker: this.changeTracker,
    });

    private meshBatches = new MeshBatcher({
        maxTextureCount: this.driver.textures.maxTextureCount,
        changeTracker: this.changeTracker,
    });

    private bunnyTex!: TextureHandle;
    private bunnyTexWhite!: TextureHandle;
    private bunnyMesh!: Mesh;
    private bunnyMaterial!: TexturedMaterial;
    private bunnyMaterialWhite!: TexturedMaterial;

    private bunnyGroup = new Group();
    private bunnyQueue: BunnyObject[] = [];
    private bunnies: BunnyObject[] = [];

    constructor(canvas: HTMLCanvasElement, driver: WGLDriver) {
        super(canvas, driver);
    }

    override async initialize() {
        await super.initialize();

        this.bunnyTex = await this.textures.addFromURL(BUNNY_TEX_URL, {
            label: 'bunny',
        });
        this.bunnyTexWhite = await this.textures.addFromURL(
            BUNNY_WHITE_TEX_URL,
            { label: 'bunny white' },
        );
        this.bunnyMesh = buildTriangulatedMesh([
            new Vertex(new Vec2(-12.5, -16), new Vec2(0, 0)),
            new Vertex(new Vec2(12.5, -16), new Vec2(1, 0)),
            new Vertex(new Vec2(12.5, 16), new Vec2(1, 1)),
            new Vertex(new Vec2(-12.5, 16), new Vec2(0, 1)),
        ]);
        this.bunnyMaterial = new TexturedMaterial(this.bunnyTex);
        this.bunnyMaterialWhite = new TexturedMaterial(this.bunnyTexWhite);

        this.tickers.add(({ elapsedSeconds: seconds }) => {
            // Dequeue bunnies
            const bunnyCountToDequeue = Math.min(
                Math.floor(seconds * BUNNY_DEQUEUE_PER_SECOND),
                this.bunnyQueue.length,
            );

            for (let i = 0; i < bunnyCountToDequeue; i++) {
                const bunny = this.bunnyQueue.shift()!;

                this.bunnies.push(bunny);
                this.bunnyGroup.add(bunny);
                this.meshBatches.add(bunny);
            }

            // Move bunnies
            const { bunnies } = this;

            const bunnyCount = bunnies.length;

            for (let i = 0; i < bunnyCount; i++) {
                const bunny = bunnies[i]!;

                const { movementPerSecond, remainingSquishDuration } = bunny;
                const { position, scale } = bunny.transform;

                position.x += movementPerSecond.x * seconds;
                position.y += movementPerSecond.y * seconds;
                movementPerSecond.y += GRAVITY * seconds;

                remainingSquishDuration
                    .subtract(seconds)
                    .clamp(0, SQUISH_DURATION);

                scale.x = lerp(
                    SQUISH_SCALE,
                    1,
                    (SQUISH_DURATION - remainingSquishDuration.x) /
                        SQUISH_DURATION,
                );
                scale.y = lerp(
                    SQUISH_SCALE,
                    1,
                    (SQUISH_DURATION - remainingSquishDuration.y) /
                        SQUISH_DURATION,
                );

                if (position.x < BOUNDS.left) {
                    movementPerSecond.x *= -1;
                    position.x = BOUNDS.left;

                    remainingSquishDuration.x = SQUISH_DURATION;
                    scale.x = SQUISH_SCALE;
                } else if (position.x > BOUNDS.right) {
                    movementPerSecond.x *= -1;
                    position.x = BOUNDS.right;

                    remainingSquishDuration.x = SQUISH_DURATION;
                    scale.x = SQUISH_SCALE;
                }

                if (position.y < BOUNDS.top) {
                    movementPerSecond.y = 0;
                    position.y = BOUNDS.top;

                    remainingSquishDuration.y = SQUISH_DURATION;
                    scale.y = SQUISH_SCALE;
                } else if (position.y > BOUNDS.bottom) {
                    movementPerSecond.y *= -0.85;
                    position.y = BOUNDS.bottom;

                    if (Math.random() > 0.5) {
                        movementPerSecond.y -= Math.random() * 80;
                    }

                    remainingSquishDuration.y = SQUISH_DURATION;
                    scale.y = SQUISH_SCALE;
                }

                this.meshBatches.change(bunny);
            }

            this.transforms.change(this.bunnyGroup);
        });
    }

    addBunnies(count: number) {
        for (let i = 0; i < count; i++) {
            const bunny = new BunnyObject({
                mesh: this.bunnyMesh,
                material:
                    Math.random() > 0.5
                        ? this.bunnyMaterialWhite
                        : this.bunnyMaterial,
            });

            this.bunnyQueue.push(bunny);
        }
    }

    protected override getDiagText(): string {
        return super.getDiagText() + ` | ${this.bunnies.length} bunnies`;
    }

    override render(): void {
        super.render();

        this.renderers.mesh.render(this.meshBatches.finalize(), this.camera);

        this.renderers.text.render(this.globalTextBatches.finalize());
    }
}

void main();

async function main() {
    const { driver, canvasEl, diagEl } = await setupWGL();

    const formEl = document.getElementById('form') as HTMLFormElement;
    const inputEl = document.getElementById('count') as HTMLInputElement;

    const app = new BunnyMarkApp(canvasEl, driver);

    app.addDiagTicker(diagEl);

    formEl.addEventListener('submit', e => {
        e.preventDefault();

        const count = parseInt(inputEl.value);

        if (!isNaN(count) && count) {
            app.addBunnies(count);
        }
    });

    usePanAndZoom(canvasEl, app.camera);

    await app.initializeAndStart();
}
