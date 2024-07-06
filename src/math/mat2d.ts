import { TO_RADIANS } from './constants';
import { Vec2Like } from './vec2';

/** @category Math */
export enum MAT_ORDER {
    COLUMN_MAJOR,
    ROW_MAJOR,
}

/**
 * 2D matrix of shape:
 *
 * a c tx
 * b d ty
 * 0 0 1
 *
 * @category Math
 */
export interface Mat2DLike {
    readonly a: number;
    readonly b: number;
    readonly c: number;
    readonly d: number;
    readonly tx: number;
    readonly ty: number;
}

/**
 * Read-only version of {@link Mat2D}.
 *
 * @category Math
 */
export interface ReadonlyMat2D extends Mat2DLike {
    equals(other: Mat2DLike, epsilon?: number): boolean;

    clone(): Mat2D;

    copyTo3x3(array: Float32Array, order?: MAT_ORDER): void;

    copyTo3x2(array: Float32Array, order?: MAT_ORDER): void;
}

/**
 * 2D matrix of shape:
 *
 * a c tx
 * b d ty
 * 0 0 1
 *
 * @remarks
 *
 * Methods (like {@link Mat2D.translate}, {@link Mat2D.multiplyMat}) generally _mutate_ the instance.
 * Create new instances with {@link Mat2D.clone}.
 *
 * @category Math
 */
export class Mat2D implements ReadonlyMat2D {
    get determinant() {
        return this.a * this.d - this.b * this.c;
    }

    constructor(
        public a: number = 1,
        public b: number = 0,
        public c: number = 0,
        public d: number = 1,
        public tx: number = 0,
        public ty: number = 0,
    ) {}

    translate(x: number, y?: number): this {
        this.tx += x;
        this.ty += y ?? x;

        return this;
    }

    translateVec(vec: Vec2Like): this {
        this.tx += vec.x;
        this.ty += vec.y;

        return this;
    }

    translateTo(x: number, y?: number): this {
        this.tx = x;
        this.ty = y ?? x;

        return this;
    }

    translateToVec(vec: Vec2Like): this {
        this.tx = vec.x;
        this.ty = vec.y;

        return this;
    }

    rotateRadians(radians: number): this {
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        const { a, b, c, d, tx, ty } = this;

        this.a = a * cos + c * sin;
        this.b = b * cos + d * sin;
        this.c = c * cos - a * sin;
        this.d = d * cos - b * sin;
        this.tx = tx * cos - ty * sin;
        this.ty = tx * sin + ty * cos;

        return this;
    }

    rotateDegrees(degrees: number): this {
        return this.rotateRadians(degrees * TO_RADIANS);
    }

    scale(x: number, y?: number): this {
        y ??= x;

        this.a *= x;
        this.b *= x;
        this.c *= y;
        this.d *= y;
        this.tx *= x;
        this.ty *= y;

        return this;
    }

    scaleVec(vec: Vec2Like): this {
        return this.scale(vec.x, vec.y);
    }

    add(other: Mat2DLike): this {
        this.a += other.a;
        this.b += other.b;
        this.c += other.c;
        this.d += other.d;
        this.tx += other.tx;
        this.ty += other.ty;

        return this;
    }

    subtract(other: Mat2DLike): this {
        this.a -= other.a;
        this.b -= other.b;
        this.c -= other.c;
        this.d -= other.d;
        this.tx -= other.tx;
        this.ty -= other.ty;

        return this;
    }

    multiply(scalar: number): this {
        this.a *= scalar;
        this.b *= scalar;
        this.c *= scalar;
        this.d *= scalar;
        this.tx *= scalar;
        this.ty *= scalar;

        return this;
    }

    multiplyMat(other: Mat2DLike): this {
        const { a, b, c, d, tx, ty } = this;

        this.a = a * other.a + c * other.b;
        this.b = b * other.a + d * other.b;
        this.c = a * other.c + c * other.d;
        this.d = b * other.c + d * other.d;
        this.tx = a * other.tx + c * other.ty + tx;
        this.ty = b * other.tx + d * other.ty + ty;

        return this;
    }

    multiplyMatInverse(other: Mat2DLike): this {
        let { a: a_, b: b_, c: c_, d: d_, tx: tx_, ty: ty_ } = other;

        const determinant = a_ * d_ - b_ * c_;

        a_ = d_ / determinant;
        b_ = -b_ / determinant;
        c_ = -c_ / determinant;
        d_ = a_ / determinant;
        tx_ = (c_ * ty_ - d_ * tx_) / determinant;
        ty_ = (b_ * tx_ - a_ * ty_) / determinant;

        const { a, b, c, d, tx, ty } = this;

        this.a = a * a_ + c * b_;
        this.b = b * a_ + d * b_;
        this.c = a * c_ + c * d_;
        this.d = b * c_ + d * d_;
        this.tx = a * tx_ + c * ty_ + tx;
        this.ty = b * tx_ + d * ty_ + ty;

        return this;
    }

    invert(): this {
        const { determinant, a, b, c, d, tx, ty } = this;

        this.a = d / determinant;
        this.b = -b / determinant;
        this.c = -c / determinant;
        this.d = a / determinant;
        this.tx = (c * ty - d * tx) / determinant;
        this.ty = (b * tx - a * ty) / determinant;

        return this;
    }

    makeIdentity(): this {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.tx = 0;
        this.ty = 0;

        return this;
    }

    equals(other: Mat2DLike, epsilon = Number.EPSILON): boolean {
        return (
            Math.abs(this.a - other.a) < epsilon &&
            Math.abs(this.b - other.b) < epsilon &&
            Math.abs(this.c - other.c) < epsilon &&
            Math.abs(this.d - other.d) < epsilon &&
            Math.abs(this.tx - other.tx) < epsilon &&
            Math.abs(this.ty - other.ty) < epsilon
        );
    }

    clone(): Mat2D {
        return new Mat2D(this.a, this.b, this.c, this.d, this.tx, this.ty);
    }

    copyFrom(other: Mat2DLike): this {
        this.a = other.a;
        this.b = other.b;
        this.c = other.c;
        this.d = other.d;
        this.tx = other.tx;
        this.ty = other.ty;

        return this;
    }

    copyTo3x3(
        array: Float32Array,
        order: MAT_ORDER = MAT_ORDER.COLUMN_MAJOR,
    ): void {
        const { a, b, c, d, tx, ty } = this;

        if (order === MAT_ORDER.ROW_MAJOR) {
            array[0] = a;
            array[1] = c;
            array[2] = tx;
            array[3] = b;
            array[4] = d;
            array[5] = ty;
            array[6] = 0;
            array[7] = 0;
            array[8] = 1;
        } else {
            array[0] = a;
            array[1] = b;
            array[2] = 0;
            array[3] = c;
            array[4] = d;
            array[5] = 0;
            array[6] = tx;
            array[7] = ty;
            array[8] = 1;
        }
    }

    copyTo3x2(
        array: Float32Array,
        order: MAT_ORDER = MAT_ORDER.COLUMN_MAJOR,
    ): void {
        const { a, b, c, d, tx, ty } = this;

        if (order === MAT_ORDER.ROW_MAJOR) {
            array[0] = a;
            array[1] = c;
            array[2] = tx;
            array[3] = b;
            array[4] = d;
            array[5] = ty;
        } else {
            array[0] = a;
            array[1] = b;
            array[2] = c;
            array[3] = d;
            array[4] = tx;
            array[5] = ty;
        }
    }

    asReadonly(): ReadonlyMat2D {
        return this;
    }

    static from(m: Mat2DLike): Mat2D {
        return new Mat2D(m.a, m.b, m.c, m.d, m.tx, m.ty);
    }

    static fromScale(x: number, y?: number): Mat2D {
        return new Mat2D(x, 0, 0, y ?? x, 0, 0);
    }

    static fromRotation(degrees: number): Mat2D {
        const cos = Math.cos(degrees * TO_RADIANS);
        const sin = Math.sin(degrees * TO_RADIANS);

        return new Mat2D(cos, sin, -sin, cos, 0, 0);
    }

    static fromTranslation(x: number, y: number): Mat2D;
    static fromTranslation(vec: Vec2Like): Mat2D;
    static fromTranslation(vecOrX: Vec2Like | number, y?: number): Mat2D {
        if (typeof vecOrX === 'object') {
            return this.identity().translateVec(vecOrX);
        }

        return this.identity().translate(vecOrX, y);
    }

    /**
     * A new {@link Mat2D} initialized to the identity matrix.
     */
    static identity() {
        return new Mat2D(1, 0, 0, 1, 0, 0);
    }
}
