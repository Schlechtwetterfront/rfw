import {
    RenderContextLifeCycleHandler,
    ResourceOptions,
} from '../../rendering';
import { DriverTextures, TextureHandle } from '../../rendering/textures';
import { ManualPromise } from '../../util/promises';
import { WGLDriver } from '../driver';
import { setTextureParameters } from './util';

const WHITE_PIXEL = new Uint8Array([255, 255, 255, 255]);

export class WGLTextures
    implements DriverTextures, RenderContextLifeCycleHandler
{
    private gl: WebGL2RenderingContext;
    private _maxTextureCount = 1;

    private initPromise = new ManualPromise();

    private textures = new WeakMap<TextureHandle, WebGLTexture>();

    readonly white = new TextureHandle('empty');

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

    async addFromImageBitmapSource(
        source: ImageBitmapSource,
        options?: {
            imageBitmapOptions?: ImageBitmapOptions;
            resourceOptions?: ResourceOptions;
        },
    ): Promise<TextureHandle> {
        const imageBitmap = await createImageBitmap(
            source,
            options?.imageBitmapOptions,
        );

        return this.addFromImageBitmap(imageBitmap, options?.resourceOptions);
    }

    addFromImageBitmap(
        imageBitmap: ImageBitmap,
        options?: ResourceOptions,
    ): Promise<TextureHandle> {
        const tex = this.createTexture(false);

        this.uploadImageSource(tex, imageBitmap);

        const handle = new TextureHandle(options?.label);

        this.textures.set(handle, tex);

        return Promise.resolve(handle);
    }

    setFromImageBitmap(
        handle: TextureHandle,
        imageBitmap: ImageBitmap,
    ): Promise<void> {
        const tex = this.createTexture(false);

        this.uploadImageSource(tex, imageBitmap);

        this.textures.set(handle, tex);

        return Promise.resolve();
    }

    uploadImageSource(tex: WebGLTexture, source: TexImageSource): void {
        const { gl } = this;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            source,
        );
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    createTexture(fillWithDefaults = false): WebGLTexture {
        const { gl } = this;

        const tex = gl.createTexture();

        if (!tex) {
            throw new Error('Failed to create texture');
        }

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);

        if (fillWithDefaults) {
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
            );
        }

        setTextureParameters(gl, {
            filter: 'linear',
            wrap: 'clamp',
        });

        gl.bindTexture(gl.TEXTURE_2D, null);

        return tex;
    }

    private init() {
        this._maxTextureCount = this.gl.getParameter(
            this.gl.MAX_TEXTURE_IMAGE_UNITS,
        ) as number;

        this.textures.set(this.white, this.createTexture(true));
    }
}
