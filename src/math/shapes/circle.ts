import { Vec2Like } from '../vec2';
import { Shape } from './shape';

export class Circle implements Shape, Vec2Like {
    constructor(
        public x: number,
        public y: number,
        public radius: number,
    ) {}

    contains({ x, y }: Vec2Like): boolean {
        return (x - this.x) ** 2 + (y - this.y) ** 2 <= this.radius ** 2;
    }

    equals(other: Circle, epsilon = Number.EPSILON): boolean {
        return (
            Math.abs(this.x - other.x) < epsilon &&
            Math.abs(this.y - other.y) < epsilon &&
            Math.abs(this.radius - other.radius) < epsilon
        );
    }

    static fromPoint({ x, y }: Vec2Like, radius: number): Circle {
        return new Circle(x, y, radius);
    }
}
