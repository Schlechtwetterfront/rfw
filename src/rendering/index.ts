export * from './diagnostics';
export * from './render-context';
export * from './render-driver';

export const MAX_Z = 1000;

export interface ResourceOptions {
    label?: string;
}

/**
 * When to render.
 *
 * - `always`: Try to render as fast as the browser allows (on each animation frame).
 * - `onChange`: Only render when the {@link ChangeTracker} of the app has registered a change.
 */
export type RenderMode = 'always' | 'onChange';

/**
 * This interface`s methods are called when the render context gets initialized/uninitialized. This
 * may happen at any point (when the browser loses context of the device/context).
 */
export interface RenderContextLifeCycleHandler {
    /**
     * Initialize any rendering resources associated with this handler. E.g., compile shaders, create
     * textures.
     *
     * @remarks
     * Rendering will only continue when all handler's `initialize` promises have resolved.
     */
    initialize(): Promise<void>;

    /**
     * Uninitialize any rendering resources associated with this handler. E.g., delete shaders.
     */
    uninitialize(): Promise<void>;
}

export type CanvasLike = HTMLCanvasElement | OffscreenCanvas;
