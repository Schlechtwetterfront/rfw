import { vec, Vec2Like } from '../../math';
import { RenderContextLifeCycleHandler } from '../../rendering';
import {
    DriverTextures,
    TextureHandle,
    TextureOptions,
} from '../../rendering/textures';
import { ManualPromise } from '../../util/promises';
import { WGLDriver } from '../driver';
import {
    configureTexture,
    getImageSourceDimensions,
    setTextureParameters,
    TextureParams,
} from './util';

const WHITE_PIXEL = new Uint8Array([255, 255, 255, 255]);

/** @category Rendering - WebGL */
export class WGLTextures
    implements DriverTextures, RenderContextLifeCycleHandler
{
    private gl: WebGL2RenderingContext;
    private _maxTextureCount = 1;

    private initPromise = new ManualPromise();

    private textures = new WeakMap<TextureHandle, WebGLTexture>();

    readonly white = new TextureHandle(vec(1, 1), 'empty');

    get maxTextureCount() {
        return this._maxTextureCount;
    }

    get initialized() {
        return this.initPromise.current;
    }

    constructor(driver: WGLDriver) {
        this.gl = driver.gl;

        this.init();
    }

    initialize(): Promise<void> {
        this.init();

        this.initPromise.resolve();

        return Promise.resolve();
    }

    uninitialize(): Promise<void> {
        this.initPromise.reset();

        this.textures = new WeakMap();

        return Promise.resolve();
    }

    get(handle: TextureHandle): WebGLTexture | undefined {
        return this.textures.get(handle);
    }

    addEmpty(
        dimensions: Vec2Like,
        options?: TextureOptions,
    ): Promise<TextureHandle> {
        const { gl } = this;

        const tex = this.createTexture(options, () =>
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                dimensions.x,
                dimensions.y,
                0,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                null,
            ),
        );

        const handle = new TextureHandle(dimensions, options?.label);

        this.textures.set(handle, tex);

        return Promise.resolve(handle);
    }

    addFromImageBitmap(
        imageBitmap: ImageBitmap,
        options?: TextureOptions,
    ): Promise<TextureHandle> {
        const tex = this.createTexture(options);

        const handle = new TextureHandle(
            getImageSourceDimensions(imageBitmap),
            options?.label,
        );

        this.textures.set(handle, tex);

        this.uploadImageSource(handle, imageBitmap);

        return Promise.resolve(handle);
    }

    setFromImageBitmap(
        handle: TextureHandle,
        imageBitmap: ImageBitmap,
        options?: TextureParams,
    ): Promise<void> {
        const tex = this.createTexture(options);

        this.textures.set(handle, tex);

        this.uploadImageSource(handle, imageBitmap);

        return Promise.resolve();
    }

    uploadImageSource(handle: TextureHandle, source: TexImageSource): void {
        const { gl } = this;

        getImageSourceDimensions(source, handle.dimensions);

        const tex = this.get(handle);

        if (!tex) {
            throw new Error(`No texture for handle ${handle.label}`);
        }

        configureTexture(gl, tex, () =>
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                source,
            ),
        );
    }

    createTexture(
        params?: TextureParams,
        configure?: (tex: WebGLTexture) => void,
    ): WebGLTexture {
        const { gl } = this;

        const tex = gl.createTexture();

        configureTexture(gl, tex, () => {
            setTextureParameters(gl, {
                filter: 'linear',
                wrap: 'clamp',
                ...params,
            });

            configure?.(tex);
        });

        return tex;
    }

    private init() {
        const { gl } = this;

        this._maxTextureCount = this.gl.getParameter(
            gl.MAX_TEXTURE_IMAGE_UNITS,
        ) as number;

        // Default tex
        {
            const tex = this.createTexture({
                filter: 'linear',
                wrap: 'clamp',
            });

            this.textures.set(this.white, tex);

            configureTexture(gl, tex, () =>
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,
                    gl.RGBA,
                    1,
                    1,
                    0,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    WHITE_PIXEL,
                ),
            );
        }
    }
}
