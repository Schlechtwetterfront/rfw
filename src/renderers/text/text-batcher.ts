import { FontTextureIndexProvider, TextLike } from '.';
import { Batch, BatchEntry, Batcher } from '../../rendering/batching';
import { TextureHandle } from '../../rendering/textures';
import { Font } from '../../text';
import { Pool, RefCounts } from '../../util';
import { TextBatchStorage } from './text-batch-storage';

/** @category Rendering - Text */
export class TextBatchEntry extends BatchEntry<TextLike> {
    font?: Font;

    override reset(): void {
        super.reset();

        this.font = undefined;
    }
}

/** @category Rendering - Text */
export class TextBatch
    extends Batch<TextLike, TextBatchEntry>
    implements FontTextureIndexProvider
{
    private readonly cachedTextures: TextureHandle[] = [];
    private readonly fonts = new RefCounts<Font>();

    textureOrderChanged = false;

    get textureCount() {
        let total = 0;

        for (let i = 0; i < this.fonts.size; i++) {
            total += this.fonts.refs[i]!.pageCount;
        }

        return total;
    }

    get textures(): readonly TextureHandle[] {
        return this.cachedTextures;
    }

    get glyphCount() {
        return this.size;
    }

    storage?: TextBatchStorage;

    hasFont(font: Font): boolean {
        return this.fonts.has(font);
    }

    getTextureIndex(font: Font): number | undefined {
        let offset = 0;

        for (let i = 0; i < this.fonts.size; i++) {
            const f = this.fonts.refs[i]!;

            if (f === font) {
                return offset;
            }

            offset += f.pageCount;
        }

        return undefined;
    }

    override addEntry(entry: TextBatchEntry): this {
        if (!entry.font) {
            throw new Error(`No texture for ${entry}`);
        }

        if (this.fonts.add(entry.font) === 1) {
            this.updateCachedTextures();
        }

        return super.addEntry(entry);
    }

    override onDeleteEntry(entry: TextBatchEntry): void {
        const index = this.fonts.indexOf(entry.font!);

        // If removing a texture that is not last, all texture indices after that change.
        const changesTextureIndices =
            index !== undefined && index < this.fonts.size - 1;

        const count = this.fonts.delete(entry.font!);

        if (count === 0 && changesTextureIndices) {
            this.textureOrderChanged = true;
        }

        super.onDeleteEntry(entry);
    }

    override clear(): void {
        super.clear();

        this.fonts.clear();
        this.cachedTextures.length = 0;
    }

    private updateCachedTextures() {
        this.cachedTextures.length = 0;

        for (let i = 0; i < this.fonts.size; i++) {
            this.cachedTextures.push(...this.fonts.refs[i]!.pages);
        }
    }
}

/** @category Rendering - Text */
export const DEFAULT_MAX_GLYPH_COUNT = 16_000;

/** @category Rendering - Text */
export class TextBatcher extends Batcher<TextLike, TextBatchEntry, TextBatch> {
    protected readonly entryPool = new Pool({
        create: () => new TextBatchEntry(),
        reset: e => e.reset(),
    });

    protected readonly batchPool = new Pool({
        create: () => new TextBatch(),
    });

    protected maximums?: { maxTextureCount: number; maxGlyphCount: number };

    get maxTextureCount() {
        return this.maximums?.maxTextureCount;
    }

    get maxGlyphCount() {
        return this.maximums?.maxGlyphCount;
    }

    setMaximums(maxTextureCount: number, maxGlyphCount?: number): void {
        maxGlyphCount ??= DEFAULT_MAX_GLYPH_COUNT;

        const hasBatches = this.batches.length > 0;

        if (hasBatches && this.maximums) {
            throw new Error(
                'Batcher already built batches. Clear batches built with previous maximums before changing thresholds.',
            );
        }

        this.maximums = { maxTextureCount, maxGlyphCount };
    }

    protected override applyBatchChanges(batch: TextBatch): void {
        batch.storage?.buffer.clearChange();

        super.applyBatchChanges(batch);

        batch.textureOrderChanged = false;
    }

    protected override createBatch(): TextBatch {
        return this.batchPool.take();
    }

    protected override discardBatch(batch: TextBatch): void {
        this.clearBatch(batch);

        this.batchPool.return(batch);
    }

    protected override shouldRebuildBatch(batch: TextBatch): boolean {
        if (super.shouldRebuildBatch(batch)) {
            return true;
        }

        return batch.textureOrderChanged;
    }

    protected override canAddToBatch(
        entry: TextBatchEntry,
        batch: TextBatch,
        additionalSize?: number,
    ): boolean {
        if (
            batch.textureCount + entry.font!.pageCount >=
                this.maxTextureCount! &&
            !batch.hasFont(entry.font!)
        ) {
            return false;
        }

        if (typeof additionalSize === 'number') {
            return batch.glyphCount + additionalSize <= this.maxGlyphCount!;
        }

        if (batch.glyphCount + entry.size > this.maxGlyphCount!) {
            return false;
        }

        return true;
    }

    protected override createEntry(object: TextLike): TextBatchEntry {
        const entry = this.entryPool.take();

        entry.object = object;
        entry.size = entry.newSize = object.layout.glyphCount;
        entry.font = object.font;

        return entry;
    }

    protected override discardEntry(entry: TextBatchEntry): void {
        this.entryPool.return(entry);
    }

    protected override applyEntryChange(
        entry: TextBatchEntry,
        batch: TextBatch,
        offset: number,
    ): void {
        this.ensureBatchStorage(batch);

        batch.storage!.update(entry, offset);

        super.applyEntryChange(entry, batch, offset);
    }

    protected override changeEntry(
        entry: TextBatchEntry,
        batch: TextBatch | undefined,
    ): void {
        const object = entry.object!;

        const fontChanged = object.font !== entry.font;

        entry.font = object.font;
        entry.newSize = object.layout.glyphCount;

        if (!batch) {
            return;
        }

        if (fontChanged && !batch.hasFont(entry.font)) {
            entry.checkCapacity = true;
        }
    }

    protected override copyWithinStorage(
        batch: TextBatch,
        target: number,
        start: number,
        end: number,
    ): void {
        this.ensureBatchStorage(batch);

        batch.storage!.buffer.copyWithin(target, start, end);
    }

    private ensureBatchStorage(batch: TextBatch) {
        if (batch.storage) {
            return;
        }

        if (!this.maximums) {
            throw new Error('Thresholds must be initialized.');
        }

        batch.storage = new TextBatchStorage(
            this.maximums.maxGlyphCount,
            batch,
        );
    }
}
