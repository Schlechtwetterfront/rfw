import { ColorLike } from '../colors';
import { Vec2Like } from '../math';
import {
    CanvasLike,
    CanvasRenderTarget,
    RenderContextLifeCycleHandler,
    RenderDiagnostics,
    RenderDriver,
    RenderTarget,
} from '../rendering';
import {
    DefaultProjections,
    Projections,
} from '../rendering/projection/projections';
import {
    DefaultRenderContext,
    RenderContext,
} from '../rendering/render-context';
import { TextureHandle } from '../rendering/textures';
import { WGLShaders } from './shaders';
import { createDepthTexture } from './textures';
import { WGLTextures } from './textures/textures';

const DEFAULT_CONTEXT_ATTRS = {
    alpha: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
} satisfies WebGLContextAttributes;

export class WGLRenderTarget implements RenderTarget {
    get dimensions() {
        return this.colorTextureHandle.dimensions;
    }

    constructor(
        public readonly framebuffer: WebGLFramebuffer,
        public readonly depthTexture: WebGLTexture,
        public readonly colorTextureHandle: TextureHandle,
    ) {}
}

/**
 * @category Rendering - WebGL
 */
export class WGLDriver implements RenderDriver {
    private lifeCycleHandlers = new Set<RenderContextLifeCycleHandler>();
    private contextOK = true;

    private canvasRenderTarget: CanvasRenderTarget;
    private otherRenderTarget?: RenderTarget;

    readonly textures: WGLTextures;
    readonly shaders: WGLShaders;

    get renderTarget() {
        return this.otherRenderTarget ?? this.canvasRenderTarget;
    }

    constructor(
        canvas: CanvasLike,
        public readonly gl: WebGL2RenderingContext,
        public readonly context: RenderContext,
        public readonly projections: Projections,
        public readonly diagnostics = new RenderDiagnostics(),
    ) {
        this.textures = new WGLTextures(this);
        this.shaders = new WGLShaders(this);

        this.canvasRenderTarget = new CanvasRenderTarget(context.dimensions);

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

    setCanvasDimensions(dimensions: Vec2Like): void {
        this.canvasRenderTarget.setCanvasDimensions(dimensions);
    }

    createRenderTarget(textureHandle: TextureHandle): WGLRenderTarget {
        const { gl } = this;

        const tex = this.textures.get(textureHandle);

        if (!tex) {
            throw new Error(`No texture for handle ${textureHandle.label}`);
        }

        const framebuffer = gl.createFramebuffer();

        const depthTex = createDepthTexture(gl, textureHandle.dimensions);

        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            tex,
            0,
        );

        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D,
            depthTex,
            0,
        );

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return new WGLRenderTarget(framebuffer, depthTex, textureHandle);
    }

    useRenderTarget(renderTarget: RenderTarget | 'canvas') {
        const { gl } = this;

        if (renderTarget === 'canvas') {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            gl.viewport(
                0,
                0,
                this.canvasRenderTarget.dimensions.x,
                this.canvasRenderTarget.dimensions.y,
            );

            this.context.flipY = false;
            this.context.setDimensions(this.canvasRenderTarget.dimensions);

            return;
        }

        if (renderTarget instanceof CanvasRenderTarget) {
            throw new Error(
                "Use 'canvas' as argument to `setRenderTarget` instead of passing a CanvasRenderTarget",
            );
        }

        if (!(renderTarget instanceof WGLRenderTarget)) {
            throw new Error('WebGL drivere only supports `WGLRenderTarget`s');
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, renderTarget.framebuffer);

        gl.viewport(
            0,
            0,
            renderTarget.colorTextureHandle.dimensions.x,
            renderTarget.colorTextureHandle.dimensions.y,
        );

        this.context.flipY = true;
        this.context.setDimensions(renderTarget.dimensions);
    }

    clear(color: ColorLike): void {
        const { gl } = this;

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
