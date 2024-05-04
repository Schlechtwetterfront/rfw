import { RenderContextLifeCycleHandler } from '.';
import { RenderDiagnostics } from './diagnostics';
import { Projections } from './projection/projections';
import { RenderContext } from './render-context';
import { DriverTextures } from './textures';

/**
 * Driver for a concrete rendering backend (e.g., WebGL).
 */
export interface RenderDriver {
    /** Diagnostics like frame time. */
    readonly diagnostics: RenderDiagnostics;

    /** Driver-specific texture manager. */
    readonly textures: DriverTextures;

    /** Projections/ */
    readonly projections: Projections;

    /** Context. */
    readonly context: RenderContext;

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
