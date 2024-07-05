import { TexturedMeshLike } from '.';
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
import { TextureHandle, TextureIndexProvider } from '../../rendering/textures';
import { Pool } from '../../util/pool';
import { RefCounts } from '../../util/ref-counts';
import { buildMeshBatchStorage } from './mesh-buffer-manager';

/** @category Rendering */
export interface MeshBatchEntry<O> extends BatchEntry<O> {
    texture?: TextureHandle;
    changeState: 'initial' | 'position' | 'all' | 'none';
}

/** @category Rendering */
export class MeshBatch<O>
    extends Batch<O, MeshBatchEntry<O>, MeshBatchStorage<O>>
    implements TextureIndexProvider
{
    private readonly _textures = new RefCounts<TextureHandle>();

    private textureCountBeforeChanges = 0;

    get textureCount() {
        return this._textures.size;
    }

    get textures() {
        return this._textures.refs;
    }

    get vertexCount() {
        return this.size;
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

    override add(entry: MeshBatchEntry<O>): void {
        if (!entry.texture) {
            throw new Error(`No texture for ${entry}`);
        }

        this._textures.add(entry.texture);

        super.add(entry);
    }

    override update(): void {
        const textureCount = this._textures.size;
        const textureIndicesChanged =
            this.textureCountBeforeChanges > textureCount;

        if (textureIndicesChanged) {
            this.rebuild();
        } else {
            super.update();
        }
    }

    protected override onDelete(entry: MeshBatchEntry<O>): void {
        this._textures.delete(entry.texture!);

        super.onDelete(entry);
    }

    override clear(): void {
        super.clear();

        this._textures.clear();
    }
}

/** @category Rendering */
export interface MeshBatchStorage<O>
    extends BatchStorage<MeshBatchEntry<O>>,
        ByteBuffers {
    textureIndexProvider?: TextureIndexProvider;
}

/** @category Rendering */
export type MeshBatchStorageFactory<O extends TexturedMeshLike> =
    BatchStorageFactory<MeshBatchEntry<O>, MeshBatchStorage<O>>;

/** @category Rendering */
export interface MeshBatcherOptions<O extends TexturedMeshLike> {
    maxTextureCount: number;
    maxVertexCount?: number;
    batchStorageFactory?: MeshBatchStorageFactory<O>;
    changeTracker: ChangeTracker;
}

const DEFAULT_MAX_VERTEX_COUNT = 64_000;

/** @category Rendering */
export class MeshBatcher<O extends TexturedMeshLike> extends Batcher<
    O,
    MeshBatchEntry<O>,
    MeshBatch<O>
> {
    private readonly storageFactory: MeshBatchStorageFactory<O>;

    public readonly maxTextureCount: number;

    public readonly maxVertexCount: number;

    constructor(options: MeshBatcherOptions<O>) {
        const maxSize = options.maxVertexCount ?? DEFAULT_MAX_VERTEX_COUNT;

        const entryPool = new Pool({
            create: () => {
                return createBatchEntry<O, MeshBatchEntry<O>>({
                    texture: undefined,
                    changeState: 'initial',
                });
            },
            reset: e => {
                resetBatchEntry(e);

                e.texture = undefined;
                e.changeState = 'initial';
            },
        });

        const batchPool = new Pool({
            create: () => {
                const storage = this.storageFactory(maxSize);

                const batch = new MeshBatch(storage, entryPool);

                storage.textureIndexProvider = batch;

                return batch;
            },
            reset: b => b.clear(),
        });

        super(maxSize, entryPool, batchPool, options.changeTracker);

        this.storageFactory =
            options.batchStorageFactory ?? buildMeshBatchStorage;

        this.maxTextureCount = options.maxTextureCount;
        this.maxVertexCount = maxSize;
    }

    /** @inheritdoc */
    add(object: O): this {
        if (this.has(object)) {
            return this;
        }

        const entry = this.entryPool.take();

        entry.object = object;
        entry.size = entry.newSize = object.mesh.triangulatedVertexCount;
        entry.texture = object.material.texture;

        this.addEntryQueued(entry);

        return this;
    }

    protected override changeEntry(
        batch: MeshBatch<O> | undefined,
        entry: MeshBatchEntry<O>,
        object: O,
    ): void {
        const texChanged = object.material.texture !== entry.texture;
        const sizeChanged = object.mesh.triangulatedVertexCount !== entry.size;
        const diff = object.mesh.triangulatedVertexCount - entry.size;

        entry.texture = object.material.texture;
        entry.newSize = object.mesh.triangulatedVertexCount;

        if (!batch) {
            return;
        }

        if (texChanged && sizeChanged) {
            if (!batch.hasTexture(object.material.texture)) {
                batch.change(entry, BatchEntryChange.DELETE);

                this.add(object);
            } else if (
                diff > 0 &&
                batch.vertexCount + diff > this.maxVertexCount
            ) {
                batch.change(entry, BatchEntryChange.DELETE);

                this.add(object);
            } else {
                batch.change(entry, BatchEntryChange.SIZE_DECREASE);
            }
        } else if (texChanged) {
            if (!batch.hasTexture(object.material.texture)) {
                batch.change(entry, BatchEntryChange.DELETE);

                this.add(object);
            }
        } else if (sizeChanged) {
            if (diff > 0 && batch.vertexCount + diff > this.maxVertexCount) {
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
        batch: MeshBatch<O>,
        entry: MeshBatchEntry<O>,
    ): void {
        batch.add(entry);
    }

    protected override canBatchInclude(
        batch: MeshBatch<O>,
        entry: MeshBatchEntry<O>,
    ): boolean {
        if (
            (batch.textureCount === this.maxTextureCount &&
                !batch.hasTexture(entry.texture!)) ||
            batch.vertexCount + entry.size > this.maxVertexCount
        ) {
            return false;
        }

        return true;
    }
}
