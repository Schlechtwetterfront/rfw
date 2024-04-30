import { CanvasApp } from '../src/app';
import { Color } from '../src/colors';
import { Vec2 } from '../src/math';
import { RenderMode } from '../src/rendering';
import { WGLDriver } from '../src/rendering-webgl';
import { Vertex, buildTriangulatedMesh } from '../src/rendering/mesh';
import { DefaultWGLRenderBundle } from './webgl-render-bundle';

const BACKGROUND_COLOR = new Color(0.15, 0.15, 0.15);

export abstract class SampleApp extends CanvasApp<WGLDriver> {
    protected readonly renderers: DefaultWGLRenderBundle;

    constructor(
        canvas: HTMLCanvasElement,
        driver: WGLDriver,
        renderMode: RenderMode = 'always',
    ) {
        super(canvas, driver, renderMode);

        this.renderers = new DefaultWGLRenderBundle(driver);
    }

    addDiagTicker(el: HTMLElement) {
        this.tickers.add(_ => {
            el.innerText = this.getDiagText();
        }, '6fps');
    }

    protected getDiagText() {
        const { frameTime, actualFrameTime, drawCalls, triangles } =
            this.driver.diagnostics;

        return `${frameTime.perSecond.toFixed(
            0,
        )} FPS (${actualFrameTime.average.toFixed(
            3,
        )}ms) | ${drawCalls.average.toFixed(0)} draw calls | ${
            triangles.last
        } tris`;
    }

    protected override render(): void {
        super.render();

        this.driver.clearViewport(BACKGROUND_COLOR);
    }
}

export async function setupWGL() {
    const canvasEl = document.getElementById('canvas') as HTMLCanvasElement;
    const canvasRect = canvasEl.getBoundingClientRect();

    const diagEl = document.getElementById('diag') as HTMLElement;

    const driver = await WGLDriver.fromCanvas(canvasEl);

    return { driver, canvasEl, canvasRect, diagEl };
}

export function buildAMesh() {
    return buildTriangulatedMesh(
        [
            new Vertex(new Vec2(-5, -8)),
            new Vertex(new Vec2(0, -4)),
            new Vertex(new Vec2(3, -7)),
            new Vertex(new Vec2(4, -6)),
            new Vertex(new Vec2(0, -2)),
            new Vertex(new Vec2(-5, -6)),
            //
            new Vertex(new Vec2(5, -5)),
            new Vertex(new Vec2(6, -4)),
            new Vertex(new Vec2(3, -1)),
            new Vertex(new Vec2(6, 3)),
            new Vertex(new Vec2(7, 9)),
            new Vertex(new Vec2(5, 9)),
            new Vertex(new Vec2(4, 3)),
            new Vertex(new Vec2(1, -1)),
            //
            new Vertex(new Vec2(-2, -2)),
            new Vertex(new Vec2(-1, -1)),
            new Vertex(new Vec2(-2, 3)),
            new Vertex(new Vec2(1, 3)),
            new Vertex(new Vec2(1, 4)),
            new Vertex(new Vec2(-2, 5)),
            new Vertex(new Vec2(-3, 9)),
            new Vertex(new Vec2(-6, 8)),
            new Vertex(new Vec2(-4, 4)),
        ],
        [6, 14],
    );
}
