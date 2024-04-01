import { RenderDriver, RenderMode } from '../rendering';
import { ChangeTracker } from './change-tracking';
import { Tickers } from './tickers';

/**
 * Base application.
 */
export abstract class App<G extends RenderDriver> {
    private initialized = false;
    private _renderMode: RenderMode;

    private animationFrameID?: number;

    get renderMode() {
        return this._renderMode;
    }
    set renderMode(renderMode: RenderMode) {
        this._renderMode = renderMode;

        this.changeTracker.registerChange();
    }

    constructor(
        public readonly driver: G,
        renderMode: RenderMode = 'always',
        public readonly changeTracker = new ChangeTracker(),
        public readonly tickers = new Tickers(),
    ) {
        this._renderMode = renderMode;
    }

    /**
     * Initialize all systems and start the app loop.
     */
    async initializeAndStart(): Promise<void> {
        await this.initialize();

        this.start();
    }

    /**
     * Initialize all systems.
     */
    async initialize(): Promise<void> {
        await this.driver.initialize();

        this.initialized = true;
    }

    /**
     * Start app loop.
     *
     * @remarks
     * {@link initialize} must be called first.
     */
    start(): void {
        if (!this.initialized) {
            throw new Error('App is not initialized');
        }

        let lastTimestamp: number | undefined;

        const tick = (timestamp: number) => {
            this.tickers.tick(timestamp);

            let elapsed = 0;

            if (lastTimestamp !== undefined) {
                elapsed = timestamp - lastTimestamp;
            }

            this.tick(elapsed);

            const render =
                this.changeTracker.changed || this.renderMode === 'always';

            if (render) {
                if (this.driver.prepareFrame()) {
                    this.render();
                    this.driver.finalizeFrame();
                }

                this.changeTracker.reset();
            }

            this.animationFrameID = window.requestAnimationFrame(tick);
        };

        this.animationFrameID = window.requestAnimationFrame(tick);
    }

    /**
     * Called for every tick. A tick does not equal a render.
     * @param elapsed - Elapsed time in milliseconds.
     * @remarks
     * This should only contain app-management code, actual logic should be put into tickers.
     */
    protected abstract tick(elapsed: number): void;

    /**
     * Called when the app decides a render is needed. Depends on {@link renderMode}.
     *
     * @remarks
     * This should only contain actual rendering code. Any logic should be put into tickers.
     */
    protected abstract render(): void;

    /**
     * Stop the app loop.
     */
    stop(): void {
        if (this.animationFrameID) {
            window.cancelAnimationFrame(this.animationFrameID);
        }
    }
}
