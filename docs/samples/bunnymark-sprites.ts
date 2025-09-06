import BUNNY_WHITE_TEX_URL from '../../samples/assets/bunny-white.png';
import BUNNY_TEX_URL from '../../samples/assets/bunny.png';

import { SampleApp } from '../../samples/shared';
import {
    Group,
    Rect,
    SpriteBatchEntry,
    SpriteBatcher,
    TexturedMaterial,
    TextureHandle,
    Vec2,
    WGLDriver,
    WGLSpriteBatchRenderer,
} from '../../src';
import { SpriteObject, SpriteOptions } from '../../src/scene/sprite';

const GRAVITY = 90;
const BUNNY_DEQUEUE_PER_SECOND = 10_000;

class BunnyObject extends SpriteObject {
    readonly movementPerSecond: Vec2;

    entry?: SpriteBatchEntry;

    constructor(options: SpriteOptions) {
        super(options);

        this.movementPerSecond = new Vec2(
            Math.random() * 400 - 200,
            40 + Math.random() * 160,
        );
    }
}

export class SpriteBunnyMarkApp extends SampleApp {
    private readonly spriteRenderer = new WGLSpriteBatchRenderer(this.driver);

    private readonly spriteBatcher = new SpriteBatcher(this.changeTracker);

    private bunnyTex!: TextureHandle;
    private bunnyTexWhite!: TextureHandle;
    private bunnyMaterial!: TexturedMaterial;
    private bunnyMaterialWhite!: TexturedMaterial;

    private bunnyGroup = new Group();
    private bunnyQueue: BunnyObject[] = [];
    private bunnies: BunnyObject[] = [];

    private readonly bounds = Rect.from(
        { x: 0, y: 0, width: 688, height: 344 },
        true,
    );

    constructor(canvas: HTMLCanvasElement, driver: WGLDriver) {
        super(canvas, driver, 'always');
    }

    override async initialize(): Promise<void> {
        await super.initialize();

        this.spriteBatcher.setMaximums(this.driver.textures.maxTextureCount);

        this.bunnyTex = await this.textures.addFromURL(BUNNY_TEX_URL, {
            label: 'bunny',
        });
        this.bunnyTexWhite = await this.textures.addFromURL(
            BUNNY_WHITE_TEX_URL,
            { label: 'bunny white' },
        );
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
                bunny.entry = this.spriteBatcher.add(bunny);
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

                this.spriteBatcher.change(bunny.entry!);
            }

            this.transforms.change(this.bunnyGroup);
        });
    }

    addBunnies(count: number) {
        for (let i = 0; i < count; i++) {
            const bunny = new BunnyObject({
                material:
                    Math.random() > 0.5
                        ? this.bunnyMaterialWhite
                        : this.bunnyMaterial,
                textureRegion: new Rect(0, 0, 25, 32),
            });

            this.bunnyQueue.push(bunny);
        }
    }

    protected override getDiagText(): string {
        return super.getDiagText() + ` | ${this.bunnies.length} bunnies`;
    }

    protected override render(): void {
        super.render();

        this.spriteRenderer.render(this.spriteBatcher.finalize(), this.camera);
    }
}
