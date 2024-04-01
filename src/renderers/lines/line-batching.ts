import { LineLike } from '.';
import { ChangeTracker } from '../../app/change-tracking';
import {
    BatchEntry,
    BatchStorage,
    BatchStorageFactory,
    SizedBatcher,
} from '../../rendering/batching';
import { ByteBuffers } from '../../rendering/buffers';
import { buildLineBatchStorage } from './line-buffer-manager';

export type LineBatchStorage = BatchStorage<BatchEntry<LineLike>> & ByteBuffers;

export interface LineBatcherOptions {
    maxSegmentCount?: number;
    batchStorageFactory?: BatchStorageFactory<
        BatchEntry<LineLike>,
        LineBatchStorage
    >;
    changeTracker: ChangeTracker;
}

export class LineBatcher extends SizedBatcher<LineLike, LineBatchStorage> {
    constructor(options: LineBatcherOptions) {
        super({
            maxSize: options.maxSegmentCount,
            batchStorageFactory:
                options.batchStorageFactory ?? buildLineBatchStorage,
            changeTracker: options?.changeTracker,
        });
    }
}
