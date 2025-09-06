import { Rect } from '../math/shapes';
import { TexturedMaterial } from '../renderers/textured-mesh';
import { ObjectOptions, SceneObject } from './graph';

/** @category Scene */
export interface SpriteOptions extends ObjectOptions {
    material: TexturedMaterial;
    textureRegion: Rect;
}

/** @category Scene */
export class SpriteObject extends SceneObject {
    material: TexturedMaterial;
    textureRegion: Rect;

    get [Symbol.toStringTag]() {
        return `Sprite ${this.label}`;
    }

    constructor(options: SpriteOptions) {
        super(options);

        this.material = options.material;
        this.textureRegion = options.textureRegion;
    }
}
