import { ReadOnlyVec2, Vec2 } from '../math';

/**
 * Applies a {@link HTMLCanvasElement | canvas element's} actual size to its `width` and `height`
 * properties to ensure correct render dimensions.
 */
export class CanvasResizer {
    private readonly resizeObserver: ResizeObserver;
    private readonly _dimensions = Vec2.zero();
    private _resize = true;

    /** Current dimensions. */
    get dimensions(): ReadOnlyVec2 {
        return this._dimensions;
    }

    constructor(private readonly canvas: HTMLCanvasElement) {
        this.resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.target !== this.canvas) {
                    continue;
                }

                const devicePixelRatio = window.devicePixelRatio;

                let width: number | undefined;
                let height: number | undefined;

                if (entry.devicePixelContentBoxSize?.length) {
                    width = entry.devicePixelContentBoxSize[0]!.inlineSize;
                    height = entry.devicePixelContentBoxSize[0]!.blockSize;
                } else {
                    width =
                        entry.contentBoxSize[0]!.inlineSize * devicePixelRatio;
                    height =
                        entry.contentBoxSize[0]!.blockSize * devicePixelRatio;
                }

                const { x, y } = this._dimensions;

                if (width !== x || height !== y) {
                    this._dimensions.set(width, height);
                    this._resize = true;
                }
            }
        });

        this.resizeObserver.observe(canvas);
    }

    /**
     * Update canvas' `width` and `height` properties if its size changed.
     * @returns `true` if resized
     */
    resize(): boolean {
        if (this._resize) {
            this.canvas.width = Math.max(1, this._dimensions.x);
            this.canvas.height = Math.max(1, this._dimensions.y);

            this._resize = false;

            return true;
        }

        return false;
    }

    /**
     * Observe the resizer's canvas for size changes. Default state of the resizer after initialization.
     */
    observe() {
        this.resizeObserver.observe(this.canvas);
    }

    /**
     * Disconnect the resizer from its canvas, further size changes will not be observed.
     *
     * @remarks
     * Call {@link CanvasResizer.observe} to re-connect.
     */
    disconnect() {
        this.resizeObserver.disconnect();
    }
}
