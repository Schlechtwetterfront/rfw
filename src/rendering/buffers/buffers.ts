import { ChangeTrackedStorage } from './storage';

/**
 * A buffer-like with change tracking.
 *
 * @category Rendering - Buffers
 */
export interface WriteBuffer extends ChangeTrackedStorage {
    /** Actual buffer. */
    readonly buffer: ArrayBuffer;
}
