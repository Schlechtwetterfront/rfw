import { PI_2, TO_DEGREES, TO_RADIANS } from './constants';
import { Mat2D, Mat2DLike, ReadonlyMat2D } from './mat2d';
import { ReadonlyVec2, Vec2 } from './vec2';

/**
 * Two-dimensional transform (position, rotation, scale).
 *
 * @category Math
 */
export interface Transform2DLike {
    readonly matrix: ReadonlyMat2D;

    readonly position: ReadonlyVec2;
    readonly z: number;
    readonly scale: ReadonlyVec2;

    readonly radians: number;

    readonly degrees: number;
}

/** @category Math */
export interface ReadonlyTransform2D extends Transform2DLike {}

/**
 * Two-dimensional transform (position, rotation, scale).
 *
 * @category Math
 */
export class Transform2D implements ReadonlyTransform2D {
    /**
     * Matrix composed of the transform's position, rotation, and translation.
     *
     * Compose via {@link Transform2D.compose}.
     */
    readonly matrix = Mat2D.identity();

    /**
     * Position.
     */
    readonly position = Vec2.zero();

    /**
     * Z value (layer).
     */
    z = 0;

    /**
     * Scale.
     */
    readonly scale = Vec2.one();

    /**
     * Rotation in radians.
     */
    radians = 0;

    /**
     * Get rotation in degrees.
     */
    get degrees() {
        return this.radians * TO_DEGREES;
    }
    /**
     * Set rotation in degrees.
     */
    set degrees(degrees: number) {
        this.radians = degrees * TO_RADIANS;
    }

    copyFrom(other: Transform2DLike): this {
        this.position.copyFrom(other.position);
        this.scale.copyFrom(other.scale);
        this.radians = other.radians;

        return this;
    }

    compose(mat?: Mat2D): void {
        mat = mat ?? this.matrix;

        mat.makeIdentity()
            .scaleVec(this.scale)
            .rotateRadians(this.radians)
            .translateVec(this.position);
    }

    /**
     * Decompose `mat` (or this transform's matrix) into position, rotation, and scale.
     * @param mat - Optional, decompose from this matrix
     */
    decompose(mat?: Mat2DLike): void {
        mat = mat ?? this.matrix;

        const { a, b, c, d, tx, ty } = mat;

        const radians = Math.atan2(b, d);

        this.radians = radians < 0 ? radians + PI_2 : radians;

        this.scale.x = Math.sqrt(a ** 2 + c ** 2);
        this.scale.y = Math.sqrt(b ** 2 + d ** 2);

        this.position.x = tx;
        this.position.y = ty;
    }

    asReadonly(): ReadonlyTransform2D {
        return this;
    }
}
