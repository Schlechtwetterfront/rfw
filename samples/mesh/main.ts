/* eslint-disable no-constant-condition */
import '../assets/styles.css';

import { Color } from '../../src/colors';
import {
    MeshBatcher,
    TexturedMaterial,
} from '../../src/renderers/textured-mesh';
import { WGLDriver } from '../../src/rendering-webgl';
import { MeshObject } from '../../src/scene/mesh';
import { spawnInGrid } from '../generation';
import { usePanAndZoom } from '../interaction';
import { SampleApp, buildAMesh, setupWGL } from '../shared';

export class MeshApp extends SampleApp {
    private readonly batches: MeshBatcher<MeshObject>;

    constructor(canvas: HTMLCanvasElement, driver: WGLDriver) {
        super(canvas, driver);

        this.batches = new MeshBatcher<MeshObject>({
            maxTextureCount: this.driver.textures.maxTextureCount,
            changeTracker: this.changeTracker,
        });
    }

    override async initialize(): Promise<void> {
        await super.initialize();

        const meshEntities: MeshObject[] = [];

        const mesh = buildAMesh();

        // Mesh
        if (true) {
            const total = spawnInGrid(20, 20, 1200, 800, (i, x, y, tt) => {
                const hue = (i / tt) * 360;

                const ms = new MeshObject({
                    mesh,
                    material: new TexturedMaterial(
                        this.driver.textures.white,
                        Color.fromHSV(hue),
                    ),
                    x: x - 600,
                    y: 800 - y - 400,
                });

                meshEntities.push(ms);
            });

            meshEntities.forEach(t => {
                this.batches.add(t);
                this.transforms.change(t);
            });

            this.tickers.add(() => {
                const index = Math.floor(Math.random() * total);

                const m = meshEntities[index]!;

                if (m.transform.scale.y < 0) {
                    m.transform.scale.y = 1;
                    m.material.color.setHSV((index / total) * 360, 1, 1);
                } else {
                    m.transform.scale.y = -1;
                    m.material.color.setHSV(
                        ((total - index) / total) * 360,
                        1,
                        1,
                    );
                }

                this.transforms.change(m);
                this.batches.change(m);
            });
        }
    }

    override render(): void {
        super.render();

        this.renderers.mesh.render(this.batches.finalize(), this.camera);
    }
}

void main();

async function main() {
    const { driver, canvasEl, diagEl } = await setupWGL();

    const app = new MeshApp(canvasEl, driver);

    app.addDiagTicker(diagEl);

    usePanAndZoom(canvasEl, app.camera);

    await app.initializeAndStart();
}
