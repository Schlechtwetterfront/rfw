import { Vec2, Vec2Like } from '../vec2';
import { RectLike } from './rect';
import { Shape } from './shape';

/**
 * Circle shape interface.
 *
 * @remarks
 * `x` and `y` refer to the circle's center.
 */
export interface CircleLike {
    readonly x: number;
    readonly y: number;
    readonly radius: number;
}

/**
 * Read-only circle shape.
 *
 * @remarks
 * `x` and `y` refer to the circle's center.
 */
export interface ReadOnlyCircle extends CircleLike, Shape {
    readonly x: number;
    readonly y: number;
    readonly radius: number;

    intersectsCircle(other: CircleLike): boolean;

    /** @inheritdoc */
    intersectsRect(rect: RectLike): boolean;

    /** @inheritdoc */
    containsPoint({ x, y }: Vec2Like): boolean;

    equals(other: CircleLike, epsilon?: number): boolean;

    clone(): Circle;
}

const TEMP_VEC = Vec2.zero();

/**
 * Circle shape.
 *
 * @remarks
 * `x` and `y` refer to the circle's center.
 */
export class Circle implements ReadOnlyCircle, Vec2Like {
    constructor(
        public x: number,
        public y: number,
        public radius: number,
    ) {}

    set(x: number, y: number): this;
    set(x: number, y: number, radius: number): this;
    set(x: number, y: number, radius?: number): this {
        this.x = x;
        this.y = y;

        if (typeof radius === 'number') {
            this.radius = radius;
        }

        return this;
    }

    intersectsCircle(other: CircleLike): boolean {
        const d = Vec2.distance(this, other);

        return d < this.radius + other.radius;
    }

    intersectsRect(rect: RectLike): boolean {
        const { radius } = this;

        const d = TEMP_VEC.copyFrom(this)
            .clampSeparate(
                rect.x,
                rect.y,
                rect.x + rect.width,
                rect.y + rect.height,
            )
            .subtractFromVec(this).length;

        return d < radius;
    }

    containsPoint(point: Vec2Like): boolean {
        return Vec2.distance(this, point) <= this.radius;
    }

    /**
     * Floor this circle.
     * @returns Self
     */
    floor(): this {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        this.radius = Math.floor(this.radius);

        return this;
    }

    /**
     * Ceil this circle.
     * @returns Self
     */
    ceil(): this {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        this.radius = Math.ceil(this.radius);

        return this;
    }

    /**
     * Round position and radius of this circle.
     * @returns Self
     */
    round(): this {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.radius = Math.round(this.radius);

        return this;
    }

    equals(other: CircleLike, epsilon = Number.EPSILON): boolean {
        return (
            Math.abs(this.x - other.x) < epsilon &&
            Math.abs(this.y - other.y) < epsilon &&
            Math.abs(this.radius - other.radius) < epsilon
        );
    }

    copyFrom(other: CircleLike): this {
        this.x = other.x;
        this.y = other.y;
        this.radius = other.radius;

        return this;
    }

    clone(): Circle {
        return new Circle(this.x, this.y, this.radius);
    }

    asReadOnly(): ReadOnlyCircle {
        return this;
    }

    toString(): string {
        return `Circle(${this.x}, ${this.y}, ${this.radius})`;
    }

    static fromPoint({ x, y }: Vec2Like, radius: number): Circle {
        return new Circle(x, y, radius);
    }

    /**
     * A new instance initialized to all zeroes.
     */
    static zero() {
        return new Circle(0, 0, 0);
    }

    /**
     * A new instance initialized with radius of one.
     */
    static one() {
        return new Circle(0, 0, 1);
    }
}
