import { BYTES_PER_LINE_SEGMENT, LineLike } from '.';
import { Vec2 } from '../../math';
import { MAX_Z } from '../../rendering';
import { BatchEntry, BatchStorageFactory } from '../../rendering/batching';
import {
    ElementByteBufferManager,
    ElementByteBuffersManager,
} from '../../rendering/buffers';
import { FLOAT_SIZE } from '../../util/sizes';

export const buildLineBatchStorage: BatchStorageFactory<
    BatchEntry<LineLike>,
    LineBufferManager
> = (maxSize: number) => {
    return new LineBufferManager(maxSize);
};

const TEMP_VEC = Vec2.ZERO;

export class LineBufferManager extends ElementByteBuffersManager<
    BatchEntry<LineLike>
> {
    private buffer: ElementByteBufferManager;

    private readonly f32View: Float32Array;

    constructor(maxSize: number) {
        const buffer = new ElementByteBufferManager(
            maxSize,
            BYTES_PER_LINE_SEGMENT,
        );

        super([buffer]);

        this.buffer = buffer;

        this.f32View = new Float32Array(buffer.arrayBuffer);
    }

    override update(entry: BatchEntry<LineLike>, segmentOffset: number): void {
        const {
            f32View,
            buffer,
            buffer: { u8View },
        } = this;

        const object = entry.object!;

        const segmentCount = object.segmentCount;

        buffer.markChanged(segmentOffset, segmentCount);

        const posVec = TEMP_VEC;

        const wt = object.transform.worldMatrix;
        const z = object.transform.z / MAX_Z;

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
