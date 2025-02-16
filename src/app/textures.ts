import { RenderContextLifeCycleHandler, ResourceOptions } from '../rendering';
import { DriverTextures, TextureHandle } from '../rendering/textures';
import { fetchImageBitmap } from '../util/image';

/**
 * Texture manager.
 *
 * Load textures from different sources and get {@link TextureHandle | texture handles} to use when
 * rendering.
 *
 * @remarks
 * This service keeps hold of all sources used to create textures. This allows restoring textures and
 * contents after a context-loss ({@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event}).
 *
 * @category App
 */
export class Textures implements RenderContextLifeCycleHandler {
    protected readonly textureSources = new Map<TextureHandle, ImageBitmap>();

    /**
     * 1x1 pixel white texture. To be used as placeholder/default texture.
     */
    get white() {
        return this.driverTextures.white;
    }

    /**
     *
     * @param driverTextures - The driver texture implementation.
     */
    constructor(protected readonly driverTextures: DriverTextures) {}

    /**
     * Fetch an `ImageBitmap` from the given URL and create a texture from it.
     * @param url - URL
     * @param options - Options for the `fetch` request/created resource
     * @returns Promise of the resulting {@link TextureHandle}
     */
    async addFromURL(
        url: Parameters<typeof fetchImageBitmap>['0'],
        resourceOptions?: ResourceOptions,
        options?: {
            fetchOptions?: RequestInit;
            imageBitmapOptions?: ImageBitmapOptions;
        },
    ): Promise<TextureHandle> {
        const imageBitmap = await fetchImageBitmap(url, options);

        return await this.addFromImageBitmap(imageBitmap, resourceOptions);
    }

    /**
     * Create a texture directly from an `ImageBitmap`.
     * @param imageBitmap - Image bitmap
     * @param resourceOptions - Options for the created resource
     * @returns Promise of the resulting {@link TextureHandle}
     */
    async addFromImageBitmap(
        imageBitmap: ImageBitmap,
        resourceOptions?: ResourceOptions,
    ): Promise<TextureHandle> {
        const handle = await this.driverTextures.addFromImageBitmap(
            imageBitmap,
            resourceOptions,
        );

        this.textureSources.set(handle, imageBitmap);

        return handle;
    }

    /**
     * Delete the source for the given handle. Does not remove the texture itself.
     * @param handle - Handle to remove the source for
     * @returns `true` if a source was removed
     */
    deleteSource(handle: TextureHandle): boolean {
        return this.textureSources.delete(handle);
    }

    async initialize(): Promise<void> {
        await this.driverTextures.initialized;

        await Promise.all(
            [...this.textureSources].map(([h, s]) =>
                this.driverTextures.setFromImageBitmap(h, s),
            ),
        );
    }

    uninitialize(): Promise<void> {
        return Promise.resolve();
    }
}
