import { Mat2D, Mat2DLike, ReadOnlyMat2D } from './mat2d';
import {
    ReadOnlyTransform2D,
    Transform2D,
    Transform2DLike,
} from './transform2d';

/**
 * A {@link Transform2D} representing a transform in some local space (e.g., parented in a scene
 * graph).
 */
export interface LocalTransform2DLike extends Transform2DLike {
    readonly worldMatrix: Mat2DLike;
}

export interface ReadOnlyLocalTransform2D extends ReadOnlyTransform2D {
    readonly worldMatrix: ReadOnlyMat2D;

    composeWorld(parent?: LocalTransform2DLike): void;
}

/**
 * A {@link Transform2D} representing a transform in some local space (e.g., parented in a scene
 * graph).
 *
 * Has an additional {@link LocalTransform2D.worldMatrix} composed via {@link LocalTransform2D.composeWorld}.
 */
export class LocalTransform2D
    extends Transform2D
    implements ReadOnlyLocalTransform2D
{
    readonly worldMatrix = Mat2D.IDENTITY;

    composeWorld(parent?: LocalTransform2DLike): void {
        this.compose();

        this.worldMatrix.copyFrom(this.matrix);

        if (parent) {
            this.worldMatrix.multiplyMat(parent.worldMatrix);
        }
    }

    override asReadOnly(): ReadOnlyLocalTransform2D {
        return this;
    }
}
