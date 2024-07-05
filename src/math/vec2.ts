import { TypedArray } from '../util/arrays';
import { PI_2, TO_DEGREES, TO_RADIANS } from './constants';
import { Mat2DLike } from './mat2d';

/**
 * Two-dimensional vector (point).
 *
 * @category Math
 */
export interface Vec2Like {
    /** X component. */
    readonly x: number;

    /** Y component. */
    readonly y: number;
}

/** @category Math */
export interface ReadonlyVec2 extends Vec2Like {
    /** Length. */
    get length(): number;

    /** Squared length. */
    get lengthSquared(): number;

    /** Radians relativ to X axis. */
    get radians(): number;

    /** Degrees relativ to X axis. */
    get degrees(): number;

    /** Get lesser of `x` or `y`. */
    get min(): number;

    /** Get greater of `x` or `y`. */
    get max(): number;

    /**
     * Dot product.
     * @param x
     * @param y
     * @returns Dot product.
     */
    dot(x: number, y?: number): number;

    /**
     * Dot product.
     * @param vec
     * @returns Dot product
     */
    dotVec(vec: Vec2Like): number;

    /**
     * Cross product.
     * @param x
     * @param y
     * @returns Cross product
     */
    cross(x: number, y?: number): number;

    /**
     * Cross product.
     * @param vec
     * @returns Cross product
     */
    crossVec(vec: Vec2Like): number;

    /**
     * Get angle of the vector between this and (`x`, `y`).
     * @param x
     * @param y
     * @returns Angle in radians
     */
    radiansTo(x: number, y?: number): number;

    /**
     * Get angle of the vector between this and `vec`.
     * @param vec
     * @returns Angle in radians
     */
    radiansToVec(vec: Vec2Like): number;

    /**
     * Get angle of the vector between this and (`x`, `y`).
     * @param x
     * @param y
     * @returns Angle in degrees
     */
    degreesTo(x: number, y?: number): number;

    /**
     * Get angle of the vector between this and `vec`.
     * @param vec
     * @returns Angle in degrees
     */
    degreesToVec(vec: Vec2Like): number;

    /**
     * Get angle between this and (`x`, `y`) from origin.
     * @param x
     * @param y
     * @returns Angle in radians
     */
    radiansBetween(x: number, y?: number): number;
    /**
     * Get angle between this and `vec` from origin.
     * @param vec
     * @returns Angle in radians
     */
    radiansBetweenVec(vec: Vec2Like): number;

    /**
     * Get angle between this and (`x`, `y`) from origin.
     * @param x
     * @param y
     * @returns Angle in degrees
     */
    degreesBetween(x: number, y?: number): number;

    /**
     * Get angle between this and `vec` from origin.
     * @param vec
     * @returns Angle in radians
     */
    degreesBetweenVec(vec: Vec2Like): number;

    /**
     * Check equality of components.
     * @param x
     * @param y
     * @param epsilon - Tolerance
     * @returns `true` if equal within tolerance
     */
    equals(x: number, y: number, epsilon?: number): boolean;

    /**
     * Check equality of vectors.
     * @param other
     * @param epsilon - Tolerance
     * @returns `true` if equal within tolerance
     */
    equalsVec(other: Vec2Like, epsilon?: number): boolean;

    /**
     * Create a new instance with equal components.
     * @returns New instance
     */
    clone(): Vec2;
}

/**
 * Two-dimensional vector (point).
 *
 * Methods (like {@link Vec2.multiply}, {@link Vec2.add}) generally _mutate_ the instance. Create
 * new instances with {@link Vec2.clone}.
 *
 * @category Math
 */
export class Vec2 implements ReadonlyVec2 {
    /** @inheritdoc */
    get length(): number {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    /** @inheritdoc */
    get lengthSquared(): number {
        return this.x ** 2 + this.y ** 2;
    }

    /** @inheritdoc */
    get radians(): number {
        const length = this.length;

        if (length === 0) {
            return 0;
        }

        const radians = Math.atan2(this.y / length, this.x / length);

        return radians < 0 ? radians + PI_2 : radians;
    }

    /** @inheritdoc */
    get degrees(): number {
        return this.radians * TO_DEGREES;
    }

    /** Set both `x` and `y`. */
    set xy(xy: number) {
        this.x = this.y = xy;
    }

    /** @inheritdoc */
    get min(): number {
        return Math.min(this.x, this.y);
    }

    /** @inheritdoc */
    get max(): number {
        return Math.max(this.x, this.y);
    }

    constructor(
        public x = 0,
        public y = 0,
    ) {}

    /**
     * Set components.
     * @param x - X value
     * @param y - Y value, uses `x` if omitted
     * @returns Self
     */
    set(x: number, y?: number): this {
        this.x = x;
        this.y = y ?? x;

        return this;
    }

    /**
     * Add components.
     * @param x
     * @param y
     * @returns Self
     */
    add(x: number, y?: number): this {
        this.x += x;
        this.y += y ?? x;

        return this;
    }

    /**
     * Add a vector.
     * @param vec
     * @returns Self
     */
    addVec(vec: Vec2Like): this {
        this.x += vec.x;
        this.y += vec.y;

        return this;
    }

    /**
     * Subtract components.
     * @param x
     * @param y
     * @returns Self
     */
    subtract(x: number, y?: number): this {
        this.x -= x;
        this.y -= y ?? x;

        return this;
    }

    /**
     * Make this vector the result of (`x`, `y`) - this vector.
     * @param x
     * @param y
     * @returns Self
     */
    subtractFrom(x: number, y?: number): this {
        this.x = x - this.x;
        this.y = (y ?? x) - this.y;

        return this;
    }

    /**
     * Subtract a vector.
     * @param vec
     * @returns Self
     */
    subtractVec(vec: Vec2Like): this {
        this.x -= vec.x;
        this.y -= vec.y;

        return this;
    }

    /**
     * Make this vector the result of `vec` - this vector.
     * @param vec
     * @returns Self
     */
    subtractFromVec(vec: Vec2Like): this {
        this.x = vec.x - this.x;
        this.y = vec.y - this.y;

        return this;
    }

    /**
     * Multiply components.
     * @param x
     * @param y
     * @returns Self
     */
    multiply(x: number, y?: number): this {
        this.x *= x;
        this.y *= y ?? x;

        return this;
    }

    /**
     * Multiply with a vec.
     * @param vec
     * @returns Self
     */
    multiplyVec(vec: Vec2Like): this {
        this.x *= vec.x;
        this.y *= vec.y;

        return this;
    }

    /**
     * Multiply with matrix.
     * @param mat
     * @returns Self
     */
    multiplyMat(mat: Mat2DLike): this {
        const { x, y } = this;

        this.x = x * mat.a + y * mat.c + mat.tx;
        this.y = x * mat.b + y * mat.d + mat.ty;

        return this;
    }

    // Sync: Mat2D.invert
    /**
     * Inverse multiply with matrix.
     * @param mat
     * @returns Self
     */
    multiplyMatInverse(mat: Mat2DLike): this {
        const determinant = mat.a * mat.d - mat.b * mat.c;

        const a = mat.d / determinant;
        const b = -mat.b / determinant;
        const c = -mat.c / determinant;
        const d = mat.a / determinant;
        const tx = (mat.c * mat.ty - mat.d * mat.tx) / determinant;
        const ty = -(mat.a * mat.ty - mat.b * mat.tx) / determinant;

        const { x, y } = this;

        this.x = x * a + y * c + tx;
        this.y = x * b + y * d + ty;

        return this;
    }

    /**
     * Divide by components.
     * @param x
     * @param y
     * @returns
     */
    divide(x: number, y?: number): this {
        this.x /= x;
        this.y /= y ?? x;

        return this;
    }

    /**
     * Make this vector the result of (`x`, `y`) / this vector.
     * @param x
     * @param y
     * @returns Self
     */
    divideFrom(x: number, y?: number): this {
        this.x = x / this.x;
        this.y = (y ?? x) / this.y;

        return this;
    }

    /**
     * Divide by a vec.
     * @param vec
     * @returns Self
     */
    divideVec(vec: Vec2Like): this {
        this.x /= vec.x;
        this.y /= vec.y;

        return this;
    }

    /**
     * Make this vector the result of `vec` / this vector.
     * @param vec
     * @returns Self
     */
    divideFromVec(vec: Vec2Like): this {
        this.x = vec.x / this.x;
        this.y = vec.y / this.y;

        return this;
    }

    /** @inheritdoc */
    dot(x: number, y?: number): number {
        return this.x * x + this.y * (y ?? x);
    }

    /** @inheritdoc */
    dotVec(vec: Vec2Like): number {
        return this.x * vec.x + this.y * vec.y;
    }

    /** @inheritdoc */
    cross(x: number, y?: number): number {
        return this.x * (y ?? x) - this.y * x;
    }

    /** @inheritdoc */
    crossVec(vec: Vec2Like): number {
        return this.x * vec.y - this.y * vec.x;
    }

    /** @inheritdoc */
    radiansTo(x: number, y?: number): number {
        const radians = Math.atan2((y ?? x) - this.y, x - this.x);

        return radians < 0 ? radians + PI_2 : radians;
    }

    /** @inheritdoc */
    radiansToVec(vec: Vec2Like): number {
        return this.radiansTo(vec.x, vec.y);
    }

    /** @inheritdoc */
    degreesTo(x: number, y?: number): number {
        return this.radiansTo(x, y) * TO_DEGREES;
    }

    /** @inheritdoc */
    degreesToVec(vec: Vec2Like): number {
        return this.radiansTo(vec.x, vec.y) * TO_DEGREES;
    }

    /** @inheritdoc */
    radiansBetween(x: number, y?: number): number {
        const radians = Math.atan2(y ?? x, x) - Math.atan2(this.y, this.x);

        return radians < 0 ? radians + PI_2 : radians;
    }

    /** @inheritdoc */
    radiansBetweenVec(vec: Vec2Like): number {
        return this.radiansBetween(vec.x, vec.y);
    }

    /** @inheritdoc */
    degreesBetween(x: number, y?: number): number {
        return this.radiansBetween(x, y ?? x) * TO_DEGREES;
    }

    /** @inheritdoc */
    degreesBetweenVec(vec: Vec2Like): number {
        return this.radiansBetweenVec(vec) * TO_DEGREES;
    }

    /**
     * Rotate this vector around a point.
     * @param radians - Amount to rotate in radians
     * @param cx - Center x
     * @param cy - Center y
     * @returns Self
     */
    rotateRadians(radians: number, cx?: number, cy?: number): this {
        cx ??= 0;
        cy ??= 0;

        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        const { x, y } = this;

        this.x = (x - cx) * cos - (y - cy) * sin + cx;
        this.y = (x - cx) * sin + (y - cy) * cos + cy;

        return this;
    }

    /**
     * Rotate this vector around a point.
     * @param radians - Amount to rotate in radians
     * @param center - Center
     * @returns Self
     */
    rotateRadiansVec(radians: number, center: Vec2Like): this {
        return this.rotateRadians(radians, center.x, center.y);
    }

    /**
     * Rotate this vector around a point.
     * @param degrees - Amount to rotate in degrees
     * @param cx - Center x
     * @param cy - Center y
     * @returns Self
     */
    rotateDegrees(degrees: number, cx?: number, cy?: number): this {
        cx ??= 0;
        cy ??= 0;

        const cos = Math.cos(degrees * TO_RADIANS);
        const sin = Math.sin(degrees * TO_RADIANS);

        const { x, y } = this;

        this.x = (x - cx) * cos - (y - cy) * sin + cx;
        this.y = (x - cx) * sin + (y - cy) * cos + cy;

        return this;
    }

    /**
     * Rotate this vector around a point.
     * @param degrees - Amount to rotate in radians
     * @param center - Center
     * @returns Self
     */
    rotateDegreesVec(degrees: number, center: Vec2Like): this {
        return this.rotateDegrees(degrees, center.x, center.y);
    }

    /**
     * Make this vector the direction vector between this and (`x`, `y`).
     * @param x
     * @param y
     * @returns Self
     */
    makeDirTo(x: number, y?: number): this {
        return this.subtractFrom(x, y ?? x).normalize();
    }

    /**
     * Make this vector the direction vector between this and vec.
     * @param vec
     * @returns Self
     */
    makeDirToVec(vec: Vec2Like): this {
        return this.subtractFromVec(vec).normalize();
    }

    /**
     * Make all components absolute.
     * @returns Self
     */
    makeAbsolute(): this {
        this.x = Math.abs(this.x);
        this.y = Math.abs(this.y);

        return this;
    }

    /**
     * Normalize.
     * @returns Self
     */
    normalize(): this {
        const length = this.length;

        this.x /= length;
        this.y /= length;

        return this;
    }

    /**
     * Floor all components.
     * @returns Self
     */
    floor(): this {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);

        return this;
    }

    /**
     * Ceil all components.
     * @returns Self
     */
    ceil(): this {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);

        return this;
    }

    /**
     * Round all components.
     * @returns Self
     */
    round(): this {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);

        return this;
    }

    /**
     * Clamp all components.
     * @param min - Min
     * @param max - Max
     * @returns Self
     */
    clamp(min = 0, max = 1): this {
        this.x = Math.min(max, Math.max(min, this.x));
        this.y = Math.min(max, Math.max(min, this.y));

        return this;
    }

    /**
     * Clamp x and y separately.
     * @param minX - Min X
     * @param minY - Min Y
     * @param maxX - Max X
     * @param maxY - Max Y
     * @returns Self
     */
    clampSeparate(minX = 0, minY = 0, maxX = 0, maxY = 0): this {
        this.x = Math.min(maxX, Math.max(minX, this.x));
        this.y = Math.min(maxY, Math.max(minY, this.y));

        return this;
    }

    /** @inheritdoc */
    equals(x: number, y: number, epsilon: number = Number.EPSILON): boolean {
        return Math.abs(this.x - x) < epsilon && Math.abs(this.y - y) < epsilon;
    }

    /** @inheritdoc */
    equalsVec(other: Vec2Like, epsilon?: number): boolean {
        return this.equals(other.x, other.y, epsilon);
    }

    /** @inheritdoc */
    componentsEqual(epsilon: number = Number.EPSILON): boolean {
        return Math.abs(this.x - this.y) < epsilon;
    }

    /** @inheritdoc */
    clone(): Vec2 {
        return new Vec2(this.x, this.y);
    }

    /**
     * Copy components from `other`.
     * @param other
     * @returns Self
     */
    copyFrom(other: Vec2Like): this {
        this.x = other.x;
        this.y = other.y;

        return this;
    }

    /**
     * Copy components into a typed array.
     * @param array - Typed array
     * @param offset - Element offset
     */
    copyTo(array: TypedArray, offset = 0): void {
        array[0 + offset] = this.x;
        array[1 + offset] = this.y;
    }

    /**
     * Get a read-only version of this vector. Does not clone.
     * @returns Read-only vector
     */
    asReadonly(): ReadonlyVec2 {
        return this;
    }

    toString(): string {
        return `Vec2(${this.x}, ${this.y})`;
    }

    static distance(from: Vec2Like, to: Vec2Like): number {
        return TEMP_VEC.copyFrom(from).subtractVec(to).length;
    }

    static distanceSquared(from: Vec2Like, to: Vec2Like): number {
        return TEMP_VEC.copyFrom(from).subtractVec(to).lengthSquared;
    }

    static from(v: Vec2Like): Vec2 {
        return new Vec2(v.x, v.y);
    }

    /**
     * A new {@link Vec2} initialized to 0,0.
     */
    static zero(): Vec2 {
        return new Vec2(0, 0);
    }

    /**
     * A new {@link Vec2} initialized to 1,1.
     */
    static one(): Vec2 {
        return new Vec2(1, 1);
    }
}

const TEMP_VEC = Vec2.zero();
