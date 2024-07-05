import { Mat2D, Mat2DLike, ReadonlyMat2D } from './mat2d';
import {
    ReadonlyTransform2D,
    Transform2D,
    Transform2DLike,
} from './transform2d';

/**
 * A {@link Transform2D} representing a transform in some local space (e.g., parented in a scene
 * graph).
 *
 * @category Math
 */
export interface LocalTransform2DLike extends Transform2DLike {
    readonly worldMatrix: Mat2DLike;
}

/** @category Math */
export interface ReadonlyLocalTransform2D extends ReadonlyTransform2D {
    readonly worldMatrix: ReadonlyMat2D;

    composeWorld(parent?: LocalTransform2DLike): void;
}

/**
 * A {@link Transform2D} representing a transform in some local space (e.g., parented in a scene
 * graph).
 *
 * Has an additional {@link LocalTransform2D.worldMatrix} composed via {@link LocalTransform2D.composeWorld}.
 *
 * @category Math
 */
export class LocalTransform2D
    extends Transform2D
    implements ReadonlyLocalTransform2D
{
    readonly worldMatrix = Mat2D.identity();

    composeWorld(parent?: LocalTransform2DLike): void {
        this.compose();

        if (parent) {
            this.worldMatrix
                .copyFrom(parent.worldMatrix)
                .multiplyMat(this.matrix);
        } else {
            this.worldMatrix.copyFrom(this.matrix);
        }
    }

    override asReadonly(): ReadonlyLocalTransform2D {
        return this;
    }
}
