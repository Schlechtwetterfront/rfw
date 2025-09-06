/* eslint-disable no-constant-condition */
import '../assets/styles.css';

import {
    Color,
    MeshBatchEntry,
    MeshBatcher,
    MeshObject,
    TexturedMaterial,
    WGLDriver,
} from '../../src';
import { spawnInGrid } from '../generation';
import { usePanAndZoom } from '../interaction';
import { SampleApp, buildAMesh, setupWGL } from '../shared';

interface MeshEntity {
    mesh: MeshObject;
    entry?: MeshBatchEntry;
}

export class MeshApp extends SampleApp {
    private readonly batcher = new MeshBatcher(this.changeTracker);

    constructor(canvas: HTMLCanvasElement, driver: WGLDriver) {
        super(canvas, driver);
    }

    override async initialize(): Promise<void> {
        await super.initialize();

        this.batcher.setMaximums(this.driver.textures.maxTextureCount);

        const meshEntities: MeshEntity[] = [];

        const mesh = buildAMesh();

        // Mesh
        if (true) {
            const total = spawnInGrid(20, 20, 1200, 800, (i, x, y, tt) => {
                const hue = (i / tt) * 360;

                const ms = {
                    mesh: new MeshObject({
                        mesh,
                        material: new TexturedMaterial(
                            this.driver.textures.white,
                            Color.fromHSV(hue),
                        ),
                        x: x - 600,
                        y: 800 - y - 400,
                    }),
                };

                meshEntities.push(ms);
            });

            meshEntities.forEach(t => {
                t.entry = this.batcher.add(t.mesh);
                this.transforms.change(t.mesh);
            });

            this.tickers.add(() => {
                const index = Math.floor(Math.random() * total);

                const { mesh, entry } = meshEntities[index]!;

                if (mesh.transform.scale.y < 0) {
                    mesh.transform.scale.y = 1;
                    mesh.material.color.setHSV((index / total) * 360, 1, 1);
                } else {
                    mesh.transform.scale.y = -1;
                    mesh.material.color.setHSV(
                        ((total - index) / total) * 360,
                        1,
                        1,
                    );
                }

                this.transforms.change(mesh);
                this.batcher.change(entry!);
            });
        }
    }

    override render(): void {
        super.render();

        this.renderers.mesh.render(this.batcher.finalize(), this.camera);
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
