import { Mat2DLike } from '../mat2d';
import { Vec2Like } from '../vec2';
import { Shape } from './shape';

/**
 * Rectangle shape interface.
 *
 * @remarks
 * `x` and `y` are the rectangle's origin, `width` and `height` extend along the positive x/y axes.
 *
 * @category Math
 */
export interface RectLike {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}

/**
 * Read-only rectangle shape.
 *
 * @remarks
 * `x` and `y` are the rectangle's origin, `width` and `height` extend along the positive x/y axes.
 *
 * @category Math
 */
export interface ReadonlyRect extends RectLike, Shape {
    /** Rect `x` plus `width`. */
    readonly xExtent: number;

    /** Rect `y` plus `height`. */
    readonly yExtent: number;

    /** @inheritdoc */
    intersectsRect(other: RectLike): boolean;

    /**
     * Check if this rect contains `other`.
     * @param other - Rect
     * @returns `true` if contained
     */
    containsRect(other: RectLike): boolean;

    containsPoint(point: Vec2Like): boolean;

    equals(other: RectLike, epsilon?: number): boolean;

    clone(): Rect;
}

/**
 * Rectangle shape.
 *
 * @remarks
 * `x` and `y` are the rectangle's origin, `width` and `height` extend along the positive x/y axes.
 *
 * @category Math
 */
export class Rect implements ReadonlyRect, Vec2Like {
    /** @inheritdoc */
    get xExtent() {
        return this.x + this.width;
    }

    /** @inheritdoc */
    get yExtent() {
        return this.y + this.height;
    }

    constructor(
        /** X origin. */
        public x: number,
        /** Y origin. */
        public y: number,
        /** Extent along positive X axis. */
        public width: number,
        /** Extent along positive Y axis. */
        public height: number,
    ) {}

    set(x: number, y: number): this;
    set(x: number, y: number, size: number): this;
    set(x: number, y: number, width: number, height: number): this;
    set(x: number, y: number, sizeOrWidth?: number, height?: number): this {
        this.x = x;
        this.y = y;

        if (typeof sizeOrWidth === 'number') {
            this.width = sizeOrWidth;

            this.height = height ?? sizeOrWidth;
        }

        return this;
    }

    /**
     * Set this rect's dimensions to a bounding box of `points`.
     * @param points - Points to encompass
     * @returns Self
     */
    setFromPoints(points: readonly Vec2Like[]): this {
        let minx = Infinity;
        let miny = Infinity;
        let maxx = -Infinity;
        let maxy = -Infinity;

        for (let i = 0; i < points.length; i++) {
            const { x, y } = points[i]!;

            if (x < minx) {
                minx = x;
            }

            if (x > maxx) {
                maxx = x;
            }

            if (y < miny) {
                miny = y;
            }

            if (y > maxy) {
                maxy = y;
            }
        }

        this.x = minx;
        this.y = miny;
        this.width = maxx - minx;
        this.height = maxy - miny;

        return this;
    }

    multiplyMat(mat: Mat2DLike): this {
        const { x, y, width, height } = this;

        const x1 = x * mat.a + y * mat.c + mat.tx;
        const y1 = x * mat.b + y * mat.d + mat.ty;

        const right = x + width;
        const bottom = y + height;
        const x2 = right * mat.a + bottom * mat.c + mat.tx;
        const y2 = right * mat.b + bottom * mat.d + mat.ty;

        this.x = Math.min(x1, x2);
        this.y = Math.min(y1, y2);
        this.width = Math.max(x1, x2) - this.x;
        this.height = Math.max(y1, y2) - this.y;

        return this;
    }

    // Sync: Mat2D.invert
    multiplyMatInverse(mat: Mat2DLike): this {
        const determinant = mat.a * mat.d - mat.b * mat.c;

        const a = mat.d / determinant;
        const b = -mat.b / determinant;
        const c = -mat.c / determinant;
        const d = mat.a / determinant;
        const tx = (mat.c * mat.ty - mat.d * mat.tx) / determinant;
        const ty = -(mat.a * mat.ty - mat.b * mat.tx) / determinant;

        const { x, y, width, height } = this;

        const x1 = x * a + y * c + tx;
        const y1 = x * b + y * d + ty;

        const right = x + width;
        const bottom = y + height;
        const x2 = right * a + bottom * c + tx;
        const y2 = right * b + bottom * d + ty;

        this.x = Math.min(x1, x2);
        this.y = Math.min(y1, y2);
        this.width = Math.max(x1, x2) - this.x;
        this.height = Math.max(y1, y2) - this.y;

        return this;
    }

    /**
     * Extend this rect to encompass `other`.
     * @param other - Other rect to extend with
     * @returns Self
     */
    extend(other: RectLike): this {
        const { x, y, width, height } = this;
        const right = x + width;
        const bottom = y + height;

        const {
            x: otherX,
            y: otherY,
            width: otherWidth,
            height: otherHeight,
        } = other;
        const otherRight = otherX + otherWidth;
        const otherBottom = otherY + otherHeight;

        this.x = Math.min(x, otherX);
        this.y = Math.min(y, otherY);
        this.width = Math.max(right, otherRight) - this.x;
        this.height = Math.max(bottom, otherBottom) - this.y;

        return this;
    }

    /**
     * Clip this rect to `other`.
     * @param other - Clip rect
     * @returns Self
     */
    clip(other: RectLike): this {
        if (!this.intersectsRect(other)) {
            this.width = this.height = 0;

            return this;
        }

        const { x, y, width, height } = this;
        const right = x + width;
        const bottom = y + height;

        const {
            x: otherX,
            y: otherY,
            width: otherWidth,
            height: otherHeight,
        } = other;
        const otherRight = otherX + otherWidth;
        const otherBottom = otherY + otherHeight;

        this.x = Math.max(x, otherX);
        this.y = Math.max(y, otherY);
        this.width = Math.max(Math.min(right, otherRight) - this.x, 0);
        this.height = Math.max(Math.min(bottom, otherBottom) - this.y, 0);

        return this;
    }

    intersectsRect(other: RectLike): boolean {
        if (
            other.x < this.x + this.width &&
            this.x < other.x + other.width &&
            other.y < this.y + this.height
        ) {
            return this.y < other.y + other.height;
        }

        return false;
    }

    containsRect(other: RectLike): boolean {
        if (
            this.x <= other.x &&
            this.y <= other.y &&
            this.x + this.width >= other.x + other.width
        ) {
            return this.y + this.height >= other.y + other.height;
        }

        return false;
    }

    containsPoint({ x, y }: Vec2Like): boolean {
        const { x: thisX, y: thisY } = this;

        if (
            x < thisX ||
            y < thisY ||
            x > thisX + this.width ||
            y > thisY + this.height
        ) {
            return false;
        }

        return true;
    }

    /**
     * Floor this rect (ceils `x` and `y`, floors `width` and `height`).
     * @returns Self
     */
    floor(): this {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        this.width = Math.floor(this.width);
        this.height = Math.floor(this.height);

        return this;
    }

    /**
     * Ceil this rect (floors `x` and `y`, ceils `width` and `height`).
     * @returns Self
     */
    ceil(): this {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        this.width = Math.ceil(this.width);
        this.height = Math.ceil(this.height);

        return this;
    }

    /**
     * Round position and extents of this rect.
     * @returns Self
     */
    round(): this {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.width = Math.round(this.width);
        this.height = Math.round(this.height);

        return this;
    }

    equals(other: RectLike, epsilon = Number.EPSILON): boolean {
        return (
            Math.abs(this.x - other.x) < epsilon &&
            Math.abs(this.y - other.y) < epsilon &&
            Math.abs(this.width - other.width) < epsilon &&
            Math.abs(this.height - other.height) < epsilon
        );
    }

    copyFrom(other: RectLike): this {
        this.x = other.x;
        this.y = other.y;
        this.width = other.width;
        this.height = other.height;

        return this;
    }

    clone(): Rect {
        return new Rect(this.x, this.y, this.width, this.height);
    }

    asReadonly(): ReadonlyRect {
        return this;
    }

    toString(): string {
        return `Rect(${this.x}, ${this.y}, ${this.width}, ${this.height})`;
    }

    static from(like: RectLike, centerOrigin = false): Rect {
        if (centerOrigin) {
            return new Rect(
                like.x - like.width / 2,
                like.y - like.height / 2,
                like.width,
                like.height,
            );
        }

        return new Rect(like.x, like.y, like.width, like.height);
    }

    static fromPoint({ x, y }: Vec2Like, width: number, height: number): Rect {
        return new Rect(x, y, width, height);
    }

    /**
     * Create a bounding box rect from `points`.
     * @param points - Points to encompass
     * @returns Bounding box rect
     * @see {@link Rect.setFromPoints}
     */
    static fromPoints(points: readonly Vec2Like[]): Rect {
        return this.zero().setFromPoints(points);
    }

    /**
     * A new instance initialized to all zeroes.
     */
    static zero() {
        return new Rect(0, 0, 0, 0);
    }

    /**
     * A new instance initialized with extents of one.
     */
    static one() {
        return new Rect(0, 0, 1, 1);
    }
}
