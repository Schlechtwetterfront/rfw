/** @category Utility */
export interface FetchImageBitmapOptions {
    requestInit?: RequestInit;
    imageBitmapOptions?: ImageBitmapOptions;
}

/** @category Utility */
export async function fetchImageBitmap(
    url: RequestInfo | URL,
    options?: FetchImageBitmapOptions,
): Promise<ImageBitmap> {
    const result = await fetch(url, options?.requestInit);

    const blob = await result.blob();

    return await createImageBitmap(blob, {
        colorSpaceConversion: 'none',
        ...options?.imageBitmapOptions,
    });
}
