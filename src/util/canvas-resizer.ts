import { ReadOnlyVec2, Vec2 } from '../math';

export class CanvasResizer {
    private readonly resizeObserver: ResizeObserver;
    private readonly _dimensions = Vec2.ZERO;
    private resize = true;

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
                    this.resize = true;
                }
            }
        });

        this.resizeObserver.observe(canvas);
    }

    maybeResize(): boolean {
        if (this.resize) {
            this.canvas.width = Math.max(1, this._dimensions.x);
            this.canvas.height = Math.max(1, this._dimensions.y);

            this.resize = false;

            return true;
        }

        return false;
    }

    disconnect() {
        this.resizeObserver.disconnect();
    }
}
