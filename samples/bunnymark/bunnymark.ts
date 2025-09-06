import BUNNY_WHITE_TEX_URL from '../assets/bunny-white.png';
import BUNNY_TEX_URL from '../assets/bunny.png';

import {
    buildTriangulatedMesh,
    Group,
    Mesh,
    MeshBatchEntry,
    MeshBatcher,
    MeshObject,
    MeshOptions,
    Rect,
    TexturedMaterial,
    TextureHandle,
    Vec2,
    Vertex,
    WGLDriver,
} from '../../src';
import { SampleApp } from '../shared';

const GRAVITY = 90;
const BUNNY_DEQUEUE_PER_SECOND = 10_000;

class BunnyObject extends MeshObject {
    readonly movementPerSecond: Vec2;

    entry?: MeshBatchEntry;

    constructor(options: MeshOptions) {
        super(options);

        this.movementPerSecond = new Vec2(
            Math.random() * 400 - 200,
            40 + Math.random() * 160,
        );
    }
}

export class BunnyMarkApp extends SampleApp {
    private meshBatcher = new MeshBatcher(this.changeTracker);

    private bunnyTex!: TextureHandle;
    private bunnyTexWhite!: TextureHandle;
    private bunnyMesh!: Mesh;
    private bunnyMaterial!: TexturedMaterial;
    private bunnyMaterialWhite!: TexturedMaterial;

    private bunnyGroup = new Group();
    private bunnyQueue: BunnyObject[] = [];
    private bunnies: BunnyObject[] = [];

    constructor(
        private readonly bounds: Rect,
        canvas: HTMLCanvasElement,
        driver: WGLDriver,
    ) {
        super(canvas, driver);
    }

    override async initialize() {
        await super.initialize();

        this.meshBatcher.setMaximums(this.driver.textures.maxTextureCount);

        this.bunnyTex = await this.textures.addFromURL(BUNNY_TEX_URL, {
            label: 'bunny',
        });
        this.bunnyTexWhite = await this.textures.addFromURL(
            BUNNY_WHITE_TEX_URL,
            { label: 'bunny white' },
        );
        this.bunnyMesh = buildTriangulatedMesh([
            new Vertex(new Vec2(12.5, 16), new Vec2(1, 0)),
            new Vertex(new Vec2(-12.5, 16), new Vec2(0, 0)),
            new Vertex(new Vec2(-12.5, -16), new Vec2(0, 1)),
            new Vertex(new Vec2(12.5, -16), new Vec2(1, 1)),
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
                bunny.entry = this.meshBatcher.add(bunny);
            }

            // Move bunnies
            const { bunnies } = this;

            const bunnyCount = bunnies.length;

            for (let i = 0; i < bunnyCount; i++) {
                const bunny = bunnies[i]!;

                const { movementPerSecond } = bunny;
                const { position } = bunny.transform;

                position.x -= movementPerSecond.x * seconds;
                position.y -= movementPerSecond.y * seconds;
                movementPerSecond.y += GRAVITY * seconds;

                if (position.x < this.bounds.x) {
                    movementPerSecond.x *= -1;
                    position.x = this.bounds.x;
                } else if (position.x > this.bounds.right) {
                    movementPerSecond.x *= -1;
                    position.x = this.bounds.right;
                }

                if (position.y > this.bounds.top) {
                    movementPerSecond.y = 0;
                    position.y = this.bounds.top;
                } else if (position.y < this.bounds.y) {
                    movementPerSecond.y *= -0.85;
                    position.y = this.bounds.y;

                    if (Math.random() > 0.5) {
                        movementPerSecond.y -= Math.random() * 80;
                    }
                }

                this.meshBatcher.change(bunny.entry!);
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

        this.renderers.mesh.render(this.meshBatcher.finalize(), this.camera);
    }
}
