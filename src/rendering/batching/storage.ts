import { ObjectStorage } from '../buffers';

/**
 * A generic batch storage. Changes to entries in batches will be applied to the storage.
 *
 * A storage is buffer-like and thus has methods like {@link BatchStorage.copyWithin}.
 */
export interface BatchStorage<O> extends ObjectStorage<O> {}

export type BatchStorageFactory<
    O,
    S extends BatchStorage<O> = BatchStorage<O>,
> = (maxSize: number) => S;
