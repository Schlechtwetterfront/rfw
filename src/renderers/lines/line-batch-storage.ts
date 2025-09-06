import { BYTES_PER_LINE_SEGMENT, LineLike } from '.';
import { Vec2 } from '../../math';
import { zToDepth } from '../../rendering';
import { BatchEntry } from '../../rendering/batching';
import { ByteBuffer, ElementByteBufferManager } from '../../rendering/buffers';
import { FLOAT_SIZE } from '../../util/sizes';

/** @category Rendering - Lines */
export interface LineBatchBuffers {
    readonly buffer: ByteBuffer;
}

const TEMP_VEC = Vec2.zero();

/** @category Rendering - Lines */
export class LineBatchStorage {
    private readonly float32View: Float32Array;

    readonly buffer: ElementByteBufferManager;

    constructor(maxSize: number) {
        const buffer = new ElementByteBufferManager(
            maxSize,
            BYTES_PER_LINE_SEGMENT,
        );

        this.buffer = buffer;

        this.float32View = new Float32Array(buffer.arrayBuffer);
    }

    update(entry: BatchEntry<LineLike>, segmentOffset: number): void {
        const {
            float32View: f32View,
            buffer,
            buffer: { uint8View: u8View },
        } = this;

        const object = entry.object!;

        const segmentCount = object.segmentCount;

        buffer.markChanged(segmentOffset, segmentOffset + segmentCount);

        const posVec = TEMP_VEC;

        const wt = object.transform.worldMatrix;
        const z = zToDepth(object.transform.z);

        const lineStyle = object.style;

        const segments = object.segments;

        let distance = 0;

        for (let i = 0; i < segmentCount; i++) {
            const { before, start, end, after, length } = segments[i]!;

            let j = ((i + segmentOffset) * BYTES_PER_LINE_SEGMENT) / FLOAT_SIZE;

            // Before
            {
                posVec.copyFrom(before).multiplyMat(wt);

                f32View[j++] = posVec.x;
                f32View[j++] = posVec.y;
            }

            // Start
            {
                posVec.copyFrom(start).multiplyMat(wt);

                f32View[j++] = posVec.x;
                f32View[j++] = posVec.y;
            }

            // End
            {
                posVec.copyFrom(end).multiplyMat(wt);

                f32View[j++] = posVec.x;
                f32View[j++] = posVec.y;
            }

            // After
            {
                posVec.copyFrom(after).multiplyMat(wt);

                f32View[j++] = posVec.x;
                f32View[j++] = posVec.y;
            }

            // Z
            f32View[j++] = z;

            // Thickness
            f32View[j++] = lineStyle.thickness;

            // Alignment
            f32View[j++] = lineStyle.alignment;

            // Dash size
            f32View[j++] = lineStyle.dashSize;

            // Gap size
            f32View[j++] = lineStyle.gapSize;

            // Distance start
            f32View[j++] = distance;

            // Distance end
            f32View[j++] = length;

            // Color
            lineStyle.color.copyToRGBA(u8View, j * FLOAT_SIZE);

            distance += length;
        }
    }
}
