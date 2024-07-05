import { Vec2Like } from '../vec2';
import { RectLike } from './rect';

/** @category Math */
export interface Shape {
    /**
     * Check if this shape and `rect` intersect.
     * @param rect - Rect
     * @returns `true` if shape and rect intersect
     */
    intersectsRect(rect: RectLike): boolean;

    /**
     * Check if this shape contains `point`.
     * @param point - Point to check
     * @returns `true` if this shape contains the point
     */
    containsPoint(point: Vec2Like): boolean;
}
