import { LineLike } from '.';
import { Batch, BatchEntry, SizedBatcher } from '../../rendering/batching';
import { Pool } from '../../util';
import { LineBatchStorage } from './line-batch-storage';

/** @category Rendering - Lines */
export class LineBatch extends Batch<LineLike> {
    storage?: LineBatchStorage;
}

/** @category Rendering - Lines */
export class LineBatcher extends SizedBatcher<LineLike> {
    protected readonly batchPool = new Pool({
        create: () => new LineBatch(),
    });

    protected override createBatch(): LineBatch {
        return this.batchPool.take();
    }

    protected override discardBatch(batch: LineBatch): void {
        this.clearBatch(batch);

        this.batchPool.return(batch);
    }

    protected override applyEntryChange(
        entry: BatchEntry<LineLike>,
        batch: LineBatch,
        offset: number,
    ): void {
        this.ensureBatchStorage(batch);

        batch.storage?.update(entry, offset);

        super.applyEntryChange(entry, batch, offset);
    }

    protected override copyWithinStorage(
        batch: LineBatch,
        target: number,
        start: number,
        end: number,
    ): void {
        this.ensureBatchStorage(batch);

        batch.storage?.buffer.copyWithin(target, start, end);
    }

    private ensureBatchStorage(batch: LineBatch) {
        if (batch.storage) {
            return;
        }

        if (!this.maximums) {
            throw new Error('Thresholds must be initialized.');
        }

        batch.storage = new LineBatchStorage(this.maximums.maxSize);
    }
}
