import { LocalTransform2DLike } from '../../math';
import { SizedObject } from '../../scene';
import { LineSegment, LineStyle } from '../../scene/line';
import { BYTE_SIZE, FLOAT_SIZE } from '../../util/sizes';
export * from './line-batching';
export * from './line-buffer-manager';

/** @category Rendering */
export const BYTES_PER_LINE_SEGMENT =
    FLOAT_SIZE * 2 + // Before
    FLOAT_SIZE * 2 + // Start
    FLOAT_SIZE * 2 + // End
    FLOAT_SIZE * 2 + // After
    FLOAT_SIZE + // Z
    FLOAT_SIZE + // Thickness
    FLOAT_SIZE + // Alignment
    FLOAT_SIZE + // Dash size
    FLOAT_SIZE + // Gap size
    FLOAT_SIZE + // Distance start
    FLOAT_SIZE + // Distance end
    BYTE_SIZE * 4; // Color

/** @category Rendering */
export interface LineLike extends SizedObject {
    readonly segmentCount: number;
    readonly segments: readonly LineSegment[];
    readonly style: LineStyle;
    readonly transform: LocalTransform2DLike;
}
