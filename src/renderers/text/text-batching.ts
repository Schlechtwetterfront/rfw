import { FontTextureIndexProvider, TextLike } from '.';
import { ChangeTracker } from '../../app/change-tracking';
import {
    Batch,
    BatchEntry,
    BatchEntryChange,
    BatchStorage,
    BatchStorageFactory,
    Batcher,
    createBatchEntry,
    resetBatchEntry,
} from '../../rendering/batching';
import { ByteBuffers } from '../../rendering/buffers';
import { TextureHandle } from '../../rendering/textures';
import { Font } from '../../text';
import { Pool } from '../../util/pool';
import { RefCounts } from '../../util/ref-counts';
import { buildTextBatchStorage } from './text-buffer-manager';

export interface TextBatchEntry extends BatchEntry<TextLike> {
    font?: Font;
}

export class TextBatch
    extends Batch<TextLike, TextBatchEntry, TextBatchStorage>
    implements FontTextureIndexProvider
{
    private readonly cachedTextures: TextureHandle[] = [];
    private readonly fonts = new RefCounts<Font>();

    private textureCountBeforeChanges = 0;

    pageOffsetsChanged = false;

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

    override add(entry: TextBatchEntry): void {
        if (!entry.font) {
            throw new Error(`No texture for ${entry}`);
        }

        if (this.fonts.add(entry.font) === 1) {
            this.updateCachedTextures();
        }

        super.add(entry);
    }

    override update(): void {
        const textureCount = this.textureCount;
        const textureIndicesChanged =
            this.textureCountBeforeChanges > textureCount;

        if (textureIndicesChanged) {
            this.rebuild();
        } else {
            super.update();
        }
    }

    protected override onDelete(entry: TextBatchEntry): void {
        this.fonts.delete(entry.font!);

        super.onDelete(entry);
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

export interface TextBatchStorage
    extends BatchStorage<TextBatchEntry>,
        ByteBuffers {
    textureIndexProvider?: FontTextureIndexProvider;
}

export type TextBatchStorageFactory = BatchStorageFactory<
    TextBatchEntry,
    TextBatchStorage
>;

export interface TextBatcherOptions {
    maxTextureCount: number;
    maxGlyphCount?: number;
    batchStorageFactory?: TextBatchStorageFactory;
    changeTracker: ChangeTracker;
}

const DEFAULT_MAX_GLYPH_COUNT = 16_000;

export class TextBatcher extends Batcher<TextLike, TextBatchEntry, TextBatch> {
    private readonly storageFactory: TextBatchStorageFactory;

    public readonly maxTextureCount: number;

    public readonly maxGlyphCount: number;

    constructor(options: TextBatcherOptions) {
        const maxSize = options.maxGlyphCount ?? DEFAULT_MAX_GLYPH_COUNT;

        const entryPool = new Pool({
            create: () => {
                return createBatchEntry<TextLike, TextBatchEntry>({
                    font: undefined,
                });
            },
            reset: e => {
                resetBatchEntry(e);

                e.font = undefined;
            },
        });

        const batchPool = new Pool<TextBatch>({
            create: () => {
                const storage = this.storageFactory(maxSize);

                const batch = new TextBatch(storage, entryPool);

                storage.textureIndexProvider = batch;

                return batch;
            },
            reset: b => b.clear(),
        });

        super(maxSize, entryPool, batchPool, options.changeTracker);

        this.storageFactory =
            options.batchStorageFactory ?? buildTextBatchStorage;

        this.maxTextureCount = options.maxTextureCount;
        this.maxGlyphCount = maxSize;
    }

    /** @inheritdoc */
    add(object: TextLike): this {
        if (this.has(object)) {
            return this;
        }

        const entry = this.entryPool.take();

        entry.object = object;
        entry.size = entry.newSize = object.layout.glyphCount;
        entry.font = object.font;

        this.addEntryQueued(entry);

        return this;
    }

    protected override changeEntry(
        batch: TextBatch | undefined,
        entry: TextBatchEntry,
        object: TextLike,
    ): void {
        const fontChanged = object.font !== entry.font;
        const sizeChanged = object.layout.glyphCount !== entry.size;
        const sizeDiff = object.layout.glyphCount - entry.size;

        entry.font = object.font;
        entry.newSize = object.layout.glyphCount;

        if (!batch) {
            return;
        }

        if (fontChanged && sizeChanged) {
            if (!batch.hasFont(object.font)) {
                batch.change(entry, BatchEntryChange.DELETE);

                this.add(object);
            } else if (
                sizeDiff > 0 &&
                batch.glyphCount + sizeDiff > this.maxGlyphCount
            ) {
                batch.change(entry, BatchEntryChange.DELETE);

                this.add(object);
            } else {
                batch.change(entry, BatchEntryChange.SIZE_DECREASE);
            }
        } else if (fontChanged) {
            if (!batch.hasFont(object.font)) {
                batch.change(entry, BatchEntryChange.DELETE);

                this.add(object);
            }
        } else if (sizeChanged) {
            if (
                sizeDiff > 0 &&
                batch.glyphCount + sizeDiff > this.maxGlyphCount
            ) {
                batch.change(entry, BatchEntryChange.DELETE);

                this.add(object);
            } else {
                batch.change(entry, BatchEntryChange.SIZE_DECREASE);
            }
        } else {
            batch.change(entry, BatchEntryChange.CONTENT);
        }
    }

    protected override addToBatch(
        batch: TextBatch,
        entry: TextBatchEntry,
    ): void {
        batch.add(entry);
    }

    protected override canBatchInclude(
        batch: TextBatch,
        entry: TextBatchEntry,
    ): boolean {
        if (
            (batch.textureCount + entry.font!.pageCount >
                this.maxTextureCount &&
                !batch.hasFont(entry.font!)) ||
            batch.glyphCount + entry.size > this.maxGlyphCount
        ) {
            return false;
        }

        return true;
    }
}
