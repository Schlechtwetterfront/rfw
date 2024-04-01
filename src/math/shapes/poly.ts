import { Vec2, Vec2Like } from '../vec2';
import { Rect } from './rect';
import { Shape } from './shape';

const TEMP_RECT = Rect.ZERO;

export class Poly implements Shape {
    points: Vec2[];

    constructor(...points: Vec2[]) {
        if (points.length < 3) {
            throw new Error(
                `Polygon must have at least 3 points (has ${points.length})`,
            );
        }

        this.points = points;
    }

    // todo: Switch to robust algorithm (for points on boundary)? Other primitives are robust and
    // contain points on their border
    contains(point: Vec2Like): boolean {
        const bounds = TEMP_RECT.setFromPoints(this.points);

        if (!bounds.contains(point)) {
            return false;
        }

        const { x, y } = point;
        const { points } = this;
        const pointCount = points.length;

        let hasHit = false;

        for (let i = 0, j = pointCount - 1; i < pointCount; j = i++) {
            const { x: px, y: py } = points[i]!;
            const { x: prevX, y: prevY } = points[j]!;

            if (
                py > y !== prevY > y &&
                x < ((prevX - px) * (y - py)) / (prevY - py) + px
            ) {
                hasHit = !hasHit;
            }
        }

        return hasHit;
    }
}
