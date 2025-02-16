import { RenderContextLifeCycleHandler } from '.';
import { ReadonlyVec2, Vec2, Vec2Like } from '../math';
import { RenderDiagnostics } from './diagnostics';
import { Projections } from './projection/projections';
import { RenderContext } from './render-context';
import { DriverTextures } from './textures';

export interface RenderTarget {
    readonly dimensions: ReadonlyVec2;
}

export class CanvasRenderTarget implements RenderTarget {
    private readonly _dimensions: Vec2;

    readonly dimensions: ReadonlyVec2;

    constructor(dimensions: Vec2Like) {
        this._dimensions = Vec2.from(dimensions);
        this.dimensions = this._dimensions;
    }

    setCanvasDimensions(dimensions: Vec2Like): void {
        this._dimensions.copyFrom(dimensions);
    }
}

/**
 * Driver for a concrete rendering backend (e.g., WebGL).
 *
 * @category Rendering
 */
export interface RenderDriver {
    /** Diagnostics like frame time. */
    readonly diagnostics: RenderDiagnostics;

    /** Driver-specific texture manager. */
    readonly textures: DriverTextures;

    /** Projections. */
    readonly projections: Projections;

    /** Context. */
    readonly context: RenderContext;

    readonly renderTarget: RenderTarget;

    useRenderTarget(renderTarget: RenderTarget | 'canvas'): void;

    setCanvasDimensions(dimensions: Vec2Like): void;

    /**
     * Call to prepare rendering a frame.
     * @returns `false` if preparation failed and rendering should not happen. Can be caused by WebGL context loss.
     */
    prepareFrame(): boolean;
    /**
     * Finalize rendering for a frame.
     */
    finalizeFrame(): void;

    /**
     * Initialize the renderer and any {@link RenderContextLifeCycleHandler | context handlers}.
     */
    initialize(): Promise<void>;

    /**
     * Register a new handler to be called on life cycle events.
     * @param handler - Handler
     */
    addLifeCycleHandler<H extends RenderContextLifeCycleHandler>(
        handler: H,
    ): void;
    /**
     * Remove a handler.
     * @param handler - Handler
     */
    removeLifeCycleHandler(handler: RenderContextLifeCycleHandler): boolean;
}
