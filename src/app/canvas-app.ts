import { RenderDriver, RenderMode } from '../rendering';
import { Camera2D } from '../rendering/camera2d';
import { TransformPropagator } from '../scene';
import { CanvasResizer } from '../util/canvas-resizer';
import { App } from './app';
import { Textures } from './textures';

/**
 * An extended base {@link App}, that assumes some things (e.g., a canvas) and sets up some more
 * defaults.
 *
 * @category App
 */
export abstract class CanvasApp<G extends RenderDriver> extends App<G> {
    protected readonly canvasResizer: CanvasResizer;

    readonly transforms = new TransformPropagator(this.changeTracker);

    readonly textures: Textures;

    readonly camera: Camera2D;

    constructor(
        canvas: HTMLCanvasElement,
        driver: G,
        renderMode: RenderMode = 'always',
        camera?: Camera2D,
    ) {
        super(driver, renderMode);

        this.canvasResizer = new CanvasResizer(canvas);

        this.textures = new Textures(driver.textures);

        this.camera =
            camera ?? new Camera2D({ changeTracker: this.changeTracker });

        driver.addLifeCycleHandler(this.textures);
    }

    protected override tick(elapsed: number): void {
        const resized = this.canvasResizer.resize();

        if (resized) {
            this.driver.setCanvasDimensions(this.canvasResizer.dimensions);

            this.changeTracker.registerChange();
        }
    }

    protected override render(): void {
        this.transforms.propagate();
    }
}
