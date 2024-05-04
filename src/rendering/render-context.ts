import { ReadOnlyVec2, Vec2, Vec2Like } from '../math';

export interface RenderContext {
    readonly dimensions: ReadOnlyVec2;

    setDimensions(dimensions: Vec2Like): void;
}

export class DefaultRenderContext implements RenderContext {
    private readonly _dimensions: Vec2;

    readonly dimensions: ReadOnlyVec2;

    constructor(dimensions: Vec2Like) {
        this._dimensions = Vec2.from(dimensions);
        this.dimensions = this._dimensions;
    }

    setDimensions(dimensions: Vec2Like): void {
        this._dimensions.copyFrom(dimensions);
    }
}
