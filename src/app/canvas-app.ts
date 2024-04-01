import { RenderDriver, RenderMode } from '../rendering';
import { Camera2D } from '../rendering/camera2d';
import { TransformPropagator } from '../scene';
import { CanvasResizer } from '../util/canvas-resizer';
import { App } from './app';
import { Textures } from './textures';

/**
 * An extended base {@link App}, that assumes some things (e.g., a canvas) and sets up some more
 * defaults.
 */
export abstract class CanvasApp<G extends RenderDriver> extends App<G> {
    protected readonly transforms = new TransformPropagator(this.changeTracker);

    protected readonly canvasResizer: CanvasResizer;

    readonly textures: Textures;

    readonly camera = new Camera2D({ changeTracker: this.changeTracker });

    constructor(
        canvas: HTMLCanvasElement,
        driver: G,
        renderMode: RenderMode = 'always',
    ) {
        super(driver, renderMode);

        this.canvasResizer = new CanvasResizer(canvas);

        this.textures = new Textures(driver.textures);

        driver.addLifeCycleHandler(this.textures);
    }

    /** @inheritdoc */
    protected override tick(elapsed: number): void {
        const resized = this.canvasResizer.maybeResize();

        if (resized) {
            this.driver.dimensions = this.canvasResizer.dimensions;

            this.changeTracker.registerChange();
        }
    }

    /** @inheritdoc */
    protected override render(): void {
        this.transforms.propagate();
    }
}
