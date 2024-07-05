import { ReadonlyVec2, Vec2, Vec2Like } from '../math';

/** @category Rendering */
export interface RenderContext {
    readonly dimensions: ReadonlyVec2;

    setDimensions(dimensions: Vec2Like): void;
}

/** @category Rendering */
export class DefaultRenderContext implements RenderContext {
    private readonly _dimensions: Vec2;

    readonly dimensions: ReadonlyVec2;

    constructor(dimensions: Vec2Like) {
        this._dimensions = Vec2.from(dimensions);
        this.dimensions = this._dimensions;
    }

    setDimensions(dimensions: Vec2Like): void {
        this._dimensions.copyFrom(dimensions);
    }
}
