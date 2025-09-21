import '../assets/styles.css';

import BUNNY_WHITE_TEX_URL from '../assets/bunny-white.png';
import BUNNY_TEX_URL from '../assets/bunny.png';

import {
    buildTriangulatedMesh,
    Material,
    Mesh,
    MeshBatcher,
    MeshObject,
    TextureHandle,
    Vec2,
    Vertex,
    WGLDriver,
} from '../../src';
import { usePanAndZoom } from '../interaction';
import { SampleApp, setupWGL } from '../shared';

export class RestoreApp extends SampleApp {
    private readonly batcher: MeshBatcher<MeshObject>;

    private contextExtension?: WEBGL_lose_context;

    private bunnyTex!: TextureHandle;
    private bunnyTexWhite!: TextureHandle;
    private bunnyMesh!: Mesh;

    private bunnies: MeshObject[] = [];

    constructor(canvas: HTMLCanvasElement, driver: WGLDriver) {
        super(canvas, driver);

        this.batcher = new MeshBatcher<MeshObject>(this.changeTracker);
    }

    override async initialize(): Promise<void> {
        await super.initialize();

        this.batcher.setMaximums(this.driver.textures.maxTextureCount);

        this.bunnyTex = await this.textures.addFromURL(BUNNY_TEX_URL);
        this.bunnyTexWhite =
            await this.textures.addFromURL(BUNNY_WHITE_TEX_URL);
        this.bunnyMesh = buildTriangulatedMesh([
            new Vertex(new Vec2(-12.5, 16), new Vec2(0, 0)),
            new Vertex(new Vec2(12.5, 16), new Vec2(1, 0)),
            new Vertex(new Vec2(12.5, -16), new Vec2(1, 1)),
            new Vertex(new Vec2(-12.5, -16), new Vec2(0, 1)),
        ]);

        {
            const b1 = new MeshObject({
                mesh: this.bunnyMesh,
                material: new Material(this.bunnyTex),
                x: -120,
                scale: 10,
            });

            this.bunnies.push(b1);
            this.batcher.add(b1);
            this.transforms.change(b1);
        }

        {
            const b2 = new MeshObject({
                mesh: this.bunnyMesh,
                material: new Material(this.bunnyTexWhite),
                x: 120,
                scale: 10,
            });

            this.bunnies.push(b2);
            this.batcher.add(b2);
            this.transforms.change(b2);
        }
    }

    protected override render(): void {
        super.render();

        this.renderers.mesh.render(this.batcher.finalize(), this.camera);
    }

    loseContext() {
        this.contextExtension =
            this.driver.gl.getExtension('WEBGL_lose_context') ?? undefined;

        if (!this.contextExtension) {
            alert('WEBGL_lose_context extensions does not exist');
            return;
        }

        this.contextExtension.loseContext();
    }

    restoreContext() {
        this.contextExtension?.restoreContext();
    }
}

void main();

async function main() {
    const { driver, canvasEl, diagEl } = await setupWGL();

    const app = new RestoreApp(canvasEl, driver);

    app.addDiagTicker(diagEl);

    document.getElementById('lose')!.addEventListener('click', () => {
        console.log('Losing context...');
        app.loseContext();
    });

    document.getElementById('restore')!.addEventListener('click', () => {
        console.log('Restoring context...');
        app.restoreContext();
    });

    usePanAndZoom(canvasEl, app.camera);

    await app.initializeAndStart();
}
