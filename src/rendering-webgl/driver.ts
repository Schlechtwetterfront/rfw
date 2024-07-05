import { ColorLike } from '../colors';
import { Vec2Like } from '../math';
import {
    CanvasLike,
    RenderContextLifeCycleHandler,
    RenderDiagnostics,
    RenderDriver,
} from '../rendering';
import {
    DefaultProjections,
    Projections,
} from '../rendering/projection/projections';
import {
    DefaultRenderContext,
    RenderContext,
} from '../rendering/render-context';
import { WGLShaders } from './shaders';
import { WGLTextures } from './textures/textures';

const DEFAULT_CONTEXT_ATTRS = {
    alpha: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
} satisfies WebGLContextAttributes;

/**
 * @category Rendering - WebGL
 */
export class WGLDriver implements RenderDriver {
    private lifeCycleHandlers = new Set<RenderContextLifeCycleHandler>();
    private contextOK = true;

    readonly textures: WGLTextures;
    readonly shaders: WGLShaders;

    constructor(
        canvas: CanvasLike,
        public readonly gl: WebGL2RenderingContext,
        public readonly context: RenderContext,
        public readonly projections: Projections,
        public readonly diagnostics = new RenderDiagnostics(),
    ) {
        this.textures = new WGLTextures(this);
        this.shaders = new WGLShaders(this);

        canvas.addEventListener(
            'webglcontextlost',
            e => {
                e.preventDefault();

                console.warn(
                    `WebGL context lost (${
                        (e as WebGLContextEvent).statusMessage
                    })`,
                );

                void this.uninitialize();
            },
            false,
        );

        canvas.addEventListener(
            'webglcontextrestored',
            e => {
                e.preventDefault();

                console.warn(
                    `WebGL context restored (${
                        (e as WebGLContextEvent).statusMessage
                    }), trying to restore render state...`,
                );

                void this.initialize().then(() => (this.contextOK = true));
            },
            false,
        );
    }

    prepareFrame() {
        const { gl } = this;

        this.diagnostics.frameTime.finish();

        if (gl.isContextLost()) {
            this.contextOK = false;
            return false;
        }

        if (!this.contextOK) {
            return false;
        }

        this.diagnostics.frameTime.start();

        this.diagnostics.actualFrameTime.start();

        return true;
    }

    finalizeFrame() {
        this.diagnostics.actualFrameTime.finish();
        this.diagnostics.drawCalls.finish();
        this.diagnostics.triangles.finish();
    }

    clearViewport(color: ColorLike, dimensions?: Vec2Like): void {
        dimensions ??= this.context.dimensions;

        const { gl } = this;

        gl.viewport(0, 0, dimensions.x, dimensions.y);

        gl.clearColor(color.r, color.g, color.b, color.a);

        gl.clear(
            gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT,
        );
    }

    addLifeCycleHandler<H extends RenderContextLifeCycleHandler>(
        handler: H,
    ): void {
        this.lifeCycleHandlers.add(handler);
    }

    removeLifeCycleHandler(handler: RenderContextLifeCycleHandler): boolean {
        return this.lifeCycleHandlers.delete(handler);
    }

    async initialize(): Promise<void> {
        await Promise.all([
            this.textures.initialize(),
            this.shaders.initialize(),
            ...[...this.lifeCycleHandlers].map(h => h.initialize()),
        ]);
    }

    async uninitialize(): Promise<void> {
        await Promise.all([
            this.textures.uninitialize(),
            this.shaders.uninitialize(),
            [...this.lifeCycleHandlers].map(h => h.uninitialize()),
        ]);
    }

    static fromCanvas(
        canvas: CanvasLike,
        options?: {
            projectionsFactory?: (context: RenderContext) => Projections;
            contextAttrs?: WebGLContextAttributes;
        },
    ): Promise<WGLDriver> {
        const gl = canvas.getContext('webgl2', {
            ...DEFAULT_CONTEXT_ATTRS,
            ...options?.contextAttrs,
        });

        if (!gl) {
            throw new Error('webgl2 context not supported');
        }

        const dpr = window.devicePixelRatio;

        let initialWidth = canvas.width;
        let initialHeight = canvas.height;

        if (canvas instanceof HTMLCanvasElement) {
            const clientRect = canvas.getBoundingClientRect();
            initialWidth = clientRect.width * dpr;
            initialHeight = clientRect.height * dpr;
        }

        const context = new DefaultRenderContext({
            x: initialWidth,
            y: initialHeight,
        });

        const projections =
            options?.projectionsFactory?.(context) ??
            new DefaultProjections(context);

        const manager = new this(canvas, gl, context, projections);

        return Promise.resolve(manager);
    }
}
