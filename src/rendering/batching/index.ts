import { ByteBuffers } from '../buffers';

export * from './batch';
export * from './batcher';
export * from './entry';
export * from './sized';
export * from './storage';

/** @category Rendering - Batching */
export interface RenderBatch {
    readonly storage: ByteBuffers;
    readonly size: number;
}
