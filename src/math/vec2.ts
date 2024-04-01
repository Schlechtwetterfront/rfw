import { TypedArray } from '../util/arrays';
import { PI_2, TO_DEGREES, TO_RADIANS } from './constants';
import { Mat2DLike } from './mat2d';

/**
 * Two-dimensional vector (point).
 */
export interface Vec2Like {
    readonly x: number;
    readonly y: number;
}

export interface ReadOnlyVec2 extends Vec2Like {
    get length(): number;
    get radians(): number;
    get degrees(): number;

    dot(other: Vec2Like): number;

    radiansTo(x: number, y?: number): number;
    radiansToVec(vec: Vec2Like): number;

    degreesTo(x: number, y?: number): number;
    degreesToVec(vec: Vec2Like): number;

    equals(x: number, y: number, epsilon?: number): boolean;
    equalsVec(other: Vec2Like, epsilon?: number): boolean;

    clone(): Vec2;
}

/**
 * Two-dimensional vector (point).
 *
 * Methods (like {@link Vec2.multiple}, {@link Vec2.add}) generally _mutate_ the instance. Create
 * new instances with {@link Vec2.clone}.
 */
export class Vec2 implements ReadOnlyVec2 {
    get length(): number {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    get radians(): number {
        const length = this.length;

        if (length === 0) {
            return 0;
        }

        const radians = Math.atan2(this.y / length, this.x / length);

        return radians < 0 ? radians + PI_2 : radians;
    }

    get degrees(): number {
        return this.radians * TO_DEGREES;
    }

    set xy(xy: number) {
        this.x = this.y = xy;
    }

    constructor(
        public x = 0,
        public y = 0,
    ) {}

    set(x: number, y?: number): this {
        this.x = x;
        this.y = y ?? x;

        return this;
    }

    add(x: number, y?: number): this {
        this.x += x;
        this.y += y ?? x;

        return this;
    }

    addVec(vec: Vec2Like): this {
        this.x += vec.x;
        this.y += vec.y;

        return this;
    }

    subtract(x: number, y?: number): this {
        this.x -= x;
        this.y -= y ?? x;

        return this;
    }

    subtractVec(vec: Vec2Like): this {
        this.x -= vec.x;
        this.y -= vec.y;

        return this;
    }

    multiply(x: number, y?: number): this {
        this.x *= x;
        this.y *= y ?? x;

        return this;
    }

    multiplyVec(vec: Vec2Like): this {
        this.x *= vec.x;
        this.y *= vec.y;

        return this;
    }

    multiplyMat(mat: Mat2DLike): this {
        const { x, y } = this;

        this.x = x * mat.a + y * mat.c + mat.tx;
        this.y = x * mat.b + y * mat.d + mat.ty;

        return this;
    }

    // Sync: Mat2D.invert
    multiplyInverse(mat: Mat2DLike): this {
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

    divide(x: number, y?: number): this {
        this.x /= x;
        this.y /= y ?? x;

        return this;
    }

    divideVec(vec: Vec2Like): this {
        this.x /= vec.x;
        this.y /= vec.y;

        return this;
    }

    dot(vec: Vec2Like): number {
        return this.x * vec.x + this.y * vec.y;
    }

    cross(vec: Vec2Like): number {
        return this.x * vec.y - this.y * vec.x;
    }

    radiansTo(x: number, y?: number): number {
        const radians = Math.atan2(y ?? x, x) - Math.atan2(this.y, this.x);

        return radians < 0 ? radians + PI_2 : radians;
    }

    radiansToVec(vec: Vec2Like): number {
        return this.radiansTo(vec.x, vec.y);
    }

    degreesTo(x: number, y?: number): number {
        return this.radiansTo(x, y ?? x) * TO_DEGREES;
    }

    degreesToVec(vec: Vec2Like): number {
        return this.radiansToVec(vec) * TO_DEGREES;
    }

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

    rotateRadiansVec(radians: number, center: Vec2Like): this {
        return this.rotateRadians(radians, center.x, center.y);
    }

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

    rotateDegreesVec(degrees: number, center: Vec2Like): this {
        return this.rotateDegrees(degrees, center.x, center.y);
    }

    normalize(): this {
        const length = this.length;

        this.x /= length;
        this.y /= length;

        return this;
    }

    floor(): this {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);

        return this;
    }

    ceil(): this {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);

        return this;
    }

    round(): this {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);

        return this;
    }

    clamp(min = 0, max = 1): this {
        this.x = Math.min(max, Math.max(min, this.x));
        this.y = Math.min(max, Math.max(min, this.y));

        return this;
    }

    clampSeparate(minX = 0, minY = 0, maxX = 0, maxY = 0): this {
        this.x = Math.min(maxX, Math.max(minX, this.x));
        this.y = Math.min(maxY, Math.max(minY, this.y));

        return this;
    }

    equals(x: number, y: number, epsilon: number = Number.EPSILON): boolean {
        return Math.abs(this.x - x) < epsilon && Math.abs(this.y - y) < epsilon;
    }

    equalsVec(other: Vec2Like, epsilon?: number): boolean {
        return this.equals(other.x, other.y, epsilon);
    }

    clone(): Vec2 {
        return new Vec2(this.x, this.y);
    }

    copyFrom(other: Vec2Like): this {
        this.x = other.x;
        this.y = other.y;

        return this;
    }

    copyTo(array: TypedArray, offset = 0): void {
        array[0 + offset] = this.x;
        array[1 + offset] = this.y;
    }

    asReadOnly(): ReadOnlyVec2 {
        return this;
    }

    toString(): string {
        return `Vec2(${this.x}, ${this.y})`;
    }

    static sum(...vecs: Vec2Like[]): Vec2 {
        const vec = Vec2.ZERO;

        for (const v of vecs) {
            vec.addVec(v);
        }

        return vec;
    }

    static difference(...vecs: Vec2Like[]): Vec2 {
        const vec = Vec2.ZERO;

        for (const v of vecs) {
            vec.subtractVec(v);
        }

        return vec;
    }

    static product(...vecs: Vec2Like[]): Vec2 {
        const vec = Vec2.ZERO;

        for (const v of vecs) {
            vec.multiplyVec(v);
        }

        return vec;
    }

    static division(...vecs: Vec2Like[]): Vec2 {
        const vec = Vec2.ZERO;

        for (const v of vecs) {
            vec.divideVec(v);
        }

        return vec;
    }

    static lengthOf(x: number, y: number): number {
        return Math.sqrt(x ** 2 + y ** 2);
    }

    static lengthOfVec(vec: Vec2Like): number {
        return this.lengthOf(vec.x, vec.y);
    }

    static from(v: Vec2Like): Vec2 {
        return new Vec2(v.x, v.y);
    }

    static maybeFrom(v: Vec2Like): Vec2 {
        return v instanceof Vec2 ? v : new Vec2(v.x, v.y);
    }

    private static _ZERO = new Vec2(0, 0);
    private static _ONE = new Vec2(1, 1);
    private static _RIGHT = new Vec2(1, 0);
    private static _UP = new Vec2(0, 1);

    /**
     * A new {@link Vec2} initialized to 0,0.
     */
    static get ZERO(): Vec2 {
        return this._ZERO.clone();
    }

    /**
     * A new {@link Vec2} initialized to 1,1.
     */
    static get ONE(): Vec2 {
        return this._ONE.clone();
    }

    /**
     * A new {@link Vec2} initialized to 1,0.
     */
    static get RIGHT() {
        return this._RIGHT.clone();
    }

    /**
     * A new {@link Vec2} initialized to 0,1.
     */
    static get UP() {
        return this._UP.clone();
    }
}
