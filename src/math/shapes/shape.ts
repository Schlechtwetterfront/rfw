import { Vec2Like } from '../vec2';

export interface Shape {
    contains(point: Vec2Like): boolean;
}
