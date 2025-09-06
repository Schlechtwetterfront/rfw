import { Batch, BatchEntry } from '../../rendering/batching';
import { TextureHandle, TextureIndexProvider } from '../../rendering/textures';
import { RefCounts } from '../../util';

/** @category Rendering - Textured */
export interface TexturedBatchEntry<O> extends BatchEntry<O> {
    texture?: TextureHandle;
}

/** @category Rendering - Textured */
export abstract class TexturedBatch<O, E extends TexturedBatchEntry<O>>
    extends Batch<O, E>
    implements TextureIndexProvider
{
    private readonly _textures = new RefCounts<TextureHandle>();

    textureOrderChanged = false;

    get textureCount() {
        return this._textures.size;
    }

    get textures() {
        return this._textures.refs;
    }

    hasTexture(tex: TextureHandle): boolean {
        return this._textures.has(tex);
    }

    getTextureIndex(tex: TextureHandle): number | undefined {
        for (let i = 0; i < this._textures.size; i++) {
            if (this._textures.refs[i] === tex) {
                return i;
            }
        }

        return undefined;
    }

    override addEntry(entry: E): this {
        if (!entry.texture) {
            throw new Error(`No texture for ${entry}`);
        }

        this._textures.add(entry.texture);

        return super.addEntry(entry);
    }

    override onDeleteEntry(entry: E): void {
        const index = this._textures.indexOf(entry.texture!);

        // If removing a texture that is not last, all texture indices after that change.
        const changesTextureIndices =
            index !== undefined && index < this._textures.size - 1;

        const count = this._textures.delete(entry.texture!);

        if (count === 0 && changesTextureIndices) {
            this.textureOrderChanged = true;
        }

        super.onDeleteEntry(entry);
    }

    override clear(): void {
        super.clear();

        this._textures.clear();
    }
}
