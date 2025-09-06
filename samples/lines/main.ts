/* eslint-disable no-constant-condition */
import '../assets/styles.css';

import { Color, LineBatcher, LineObject, Vec2 } from '../../src';
import { getSinePoints, spawnInGrid } from '../generation';
import { usePanAndZoom } from '../interaction';
import { SampleApp, setupWGL } from '../shared';

export class LinesApp extends SampleApp {
    private readonly batcher = new LineBatcher(this.changeTracker);

    override async initialize(): Promise<void> {
        await super.initialize();

        this.batcher.setMaximums(24_000);

        const lines: LineObject[] = [];

        // Lines
        if (true) {
            lines.push(
                new LineObject({
                    x: -600,
                    y: 400,
                    style: {
                        color: Color.fromHSV(90),
                        dashSize: 2,
                        gapSize: 4,
                    },
                    points: [...getSinePoints(8, 32, 16, 1200, 800)],
                }),

                new LineObject({
                    x: -600,
                    y: 340,
                    style: {
                        color: Color.fromHSV(180),
                        thickness: 2,
                        dashSize: 4,
                        gapSize: 12,
                    },
                    points: [...getSinePoints(8, 64, 32, 1200, 800)],
                }),

                new LineObject({
                    x: -600,
                    y: 280,
                    style: {
                        color: Color.fromHSV(270),
                        thickness: 4,
                        dashSize: 24,
                        gapSize: 8,
                    },
                    points: [...getSinePoints(8, 128, 64, 1200, 800)],
                }),
            );
        }

        if (true) {
            spawnInGrid(800, 8, 800, 600, (i, x, y, tt) => {
                const line = new LineObject({
                    x: x - 400,
                    y: y - 200,
                    style: { color: Color.fromHSV((i / tt) * 360) },
                    points: [...getSinePoints(8, 32, 8, 1000, 800)],
                });

                lines.push(line);
            });
        }

        if (true) {
            lines.push(
                new LineObject({
                    x: -600,
                    y: 200,
                    style: {
                        color: Color.fromHSV(100),
                        thickness: 12,
                        alignment: 1,
                    },
                    closed: true,
                    points: [
                        new Vec2(0, 0),
                        new Vec2(100, 0),
                        new Vec2(100, 100),
                        new Vec2(0, 100),
                    ],
                }),
            );

            const a = new Vec2(0, 0);
            const b = new Vec2(1, 0).rotateDegrees(30).multiply(100);
            const c = b.clone().rotateDegrees(120).addVec(b);

            lines.push(
                new LineObject({
                    x: -600,
                    y: 100,
                    style: {
                        color: Color.fromHSV(100),
                        thickness: 12,
                        alignment: 1,
                    },
                    closed: true,
                    points: [a, b, c],
                }),
            );
        }

        lines.forEach(l => {
            this.batcher.add(l);
            this.transforms.change(l);
        });
    }

    override render(): void {
        super.render();

        this.renderers.line.render(this.batcher.finalize(), this.camera);
    }
}

void main();

async function main() {
    const { driver, canvasEl, diagEl } = await setupWGL();

    const app = new LinesApp(canvasEl, driver);

    app.addDiagTicker(diagEl);

    usePanAndZoom(canvasEl, app.camera);

    await app.initializeAndStart();
}
