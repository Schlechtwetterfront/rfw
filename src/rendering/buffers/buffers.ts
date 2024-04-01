import { ChangeTrackedStorage } from './storage';

/**
 * A buffer-like with change tracking.
 */
export interface WriteBuffer extends ChangeTrackedStorage {
    /** Actual buffer. */
    readonly buffer: ArrayBuffer;
}
