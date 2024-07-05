import { ObjectOptions, SceneObject } from './graph';

/** @category Scene */
export class EmptyObject extends SceneObject {
    get [Symbol.toStringTag]() {
        return `Empty ${this.label}`;
    }

    constructor(options?: ObjectOptions) {
        super(options);
    }
}
