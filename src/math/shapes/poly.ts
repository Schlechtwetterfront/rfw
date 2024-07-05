import { linesIntersect } from '../util';
import { ReadonlyVec2, Vec2, Vec2Like } from '../vec2';
import { Rect, RectLike } from './rect';
import { Shape } from './shape';

/** @category Math */
export interface PolyLike {
    readonly points: readonly Vec2Like[];
}

/** @category Math */
export interface ReadonlyPoly extends PolyLike, Shape {
    readonly points: readonly ReadonlyVec2[];

    /** @inheritdoc */
    intersectsRect(other: RectLike): boolean;

    /** @inheritdoc */
    containsPoint(point: Vec2Like): boolean;

    equals(other: PolyLike, epsilon?: number): boolean;

    clone(): Poly;
}

const TEMP_RECT = Rect.zero();
const TEMP_VEC0 = Vec2.zero();
const TEMP_VEC1 = Vec2.zero();

/** @category Math */
export class Poly implements ReadonlyPoly {
    points: Vec2[];

    constructor(...points: Vec2[]) {
        this.points = points;
    }

    /** @inheritdoc */
    intersectsRect(rect: RectLike): boolean {
        if (!this.points.length) {
            return false;
        }

        const bounds = TEMP_RECT.setFromPoints(this.points);

        if (!bounds.intersectsRect(rect)) {
            return false;
        }

        if (this.containsPointOnly(rect)) {
            return true;
        }

        const p = this.points[0]!;

        TEMP_RECT.copyFrom(rect);

        if (TEMP_RECT.containsPoint(p)) {
            return true;
        }

        const { points } = this;
        const pointCount = points.length;

        for (let i = 0; i < 4; i++) {
            switch (i) {
                case 0:
                    TEMP_VEC0.set(rect.x, rect.y);
                    TEMP_VEC1.set(rect.x + rect.width, rect.y);
                    break;

                case 1:
                    TEMP_VEC0.set(rect.x + rect.width, rect.y);
                    TEMP_VEC1.set(rect.x + rect.width, rect.y + rect.height);
                    break;

                case 2:
                    TEMP_VEC0.set(rect.x + rect.width, rect.y + rect.height);
                    TEMP_VEC1.set(rect.x, rect.y + rect.height);
                    break;

                case 3:
                    TEMP_VEC0.set(rect.x, rect.y + rect.height);
                    TEMP_VEC1.set(rect.x, rect.y);
                    break;
            }

            for (let k = 0, l = pointCount - 1; k < pointCount; l = k++) {
                const p2 = points[k]!;
                const p3 = points[l]!;

                if (linesIntersect(TEMP_VEC0, TEMP_VEC1, p2, p3)) {
                    return true;
                }
            }
        }

        return false;
    }

    // todo: Switch to robust algorithm (for points on boundary)? Other primitives are robust and
    // contain points on their border
    /** @inheritdoc */
    containsPoint(point: Vec2Like): boolean {
        if (this.points.length < 3) {
            return false;
        }

        const bounds = TEMP_RECT.setFromPoints(this.points);

        if (!bounds.containsPoint(point)) {
            return false;
        }

        return this.containsPointOnly(point);
    }

    containsPointOnly(point: Vec2Like): boolean {
        if (this.points.length < 3) {
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

    /** @inheritdoc */
    equals(other: PolyLike, epsilon = Number.EPSILON): boolean {
        const { points } = this;
        const pointCount = points.length;

        if (other.points.length !== pointCount) {
            return false;
        }

        const otherPoints = other.points;

        for (let i = 0; i < pointCount; i++) {
            const p = points[i]!;
            const po = otherPoints[i]!;

            if (!p.equalsVec(po, epsilon)) {
                return false;
            }
        }

        return true;
    }

    asReadonly(): ReadonlyPoly {
        return this;
    }

    /** @inheritdoc */
    clone(): Poly {
        const points = this.points.map(p => p.clone());

        return new Poly(...points);
    }
}
